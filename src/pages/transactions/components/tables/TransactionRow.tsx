import { format } from 'date-fns';
import { IconButton } from '@/shared/components/ui/icon-button';
import { Clock, CheckCircle2, CreditCard, TrendingUp, TrendingDown, ArrowRightLeft, RefreshCw, MoreVertical, Landmark, Circle } from 'lucide-react';
import { Transaction } from '@/shared/services/transactions.service';
import { colors } from '@/shared/theme';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { TableCell, TableRow } from '@/shared/components/layout/Table';

interface TransactionRowProps {
    transaction: Transaction;
    isChild?: boolean;
    selectedIds: string[];
    handleSelectRow: (id: string) => void;
    handleTogglePaid: (t: Transaction) => void;
    handleOpenMenu: (e: React.MouseEvent<HTMLElement>, t: Transaction) => void;
    isPendingToggle?: boolean;
}

const chipBase = 'inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider';

export function TransactionRow({
    transaction: t,
    isChild = false,
    selectedIds,
    handleSelectRow,
    handleTogglePaid,
    handleOpenMenu,
    isPendingToggle,
}: TransactionRowProps) {
    const formatBRL = (amount: number) => (
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(amount)
    );

    const isBillPayment = t.payment_method === 'bill_payment';

    const getTypeConfig = (type: string) => {
        if (isBillPayment) {
            return {
                icon: Landmark,
                amountClass: t.is_paid ? 'text-[var(--color-success)]' : 'text-[var(--color-accent)]',
                iconWrapClass: 'bg-[var(--overlay-primary-14)] text-[var(--color-accent)]',
            };
        }

        switch (type) {
            case 'income':
                return {
                    icon: TrendingUp,
                    amountClass: 'text-[var(--color-success)]',
                    iconWrapClass: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
                };
            case 'expense':
                return {
                    icon: TrendingDown,
                    amountClass: 'text-white', // Use white for expense amounts in dark mode, or text-primary
                    iconWrapClass: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
                };
            default:
                return {
                    icon: ArrowRightLeft,
                    amountClass: 'text-[var(--color-text-secondary)]',
                    iconWrapClass: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
                };
        }
    };

    const typeConfig = getTypeConfig(t.type);
    const TypeIcon = typeConfig.icon;
    const dateToDisplay = (t.type === 'expense' && !isBillPayment)
        ? (t.purchase_date || t.payment_date)
        : (t.payment_date || t.purchase_date);
    const amountPrefix = t.type === 'expense' && !isBillPayment ? '-' : '';
    const setCategoryChipRef = (node: HTMLSpanElement | null, color?: string) => {
        if (!node) return;
        node.style.setProperty('background-color', color ? `${color}15` : 'var(--overlay-white-05)');
        node.style.setProperty('color', color || colors.textSecondary);
        node.style.setProperty('opacity', t.is_paid ? '1' : '0.7');
    };
    const setCardNameRef = (node: HTMLParagraphElement | null) => {
        if (!node) return;
        node.style.setProperty('color', t.credit_card?.color || colors.textMuted);
    };

    return (
        <TableRow
            className={`group min-h-14 border-b border-white/5 transition-all duration-200 hover:bg-white/[0.02] ${selectedIds.includes(t.id)
                ? 'bg-[var(--color-primary)]/5'
                : isChild
                    ? 'bg-transparent'
                    : 'bg-transparent'
                } ${isPendingToggle ? 'opacity-50' : 'opacity-100'}`}
        >
            <TableCell className="px-2 py-2">
                <button
                    type="button"
                    onClick={() => handleSelectRow(t.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded transition-all ${selectedIds.includes(t.id)
                            ? 'text-[var(--color-warning)] hover:brightness-75 hover:bg-[var(--color-warning)]/10'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
                        }`}
                >
                    {selectedIds.includes(t.id) ? (
                        <CheckCircle2 size={16} />
                    ) : (
                        <Circle size={16} />
                    )}
                </button>
            </TableCell>
            <TableCell className="w-12 px-1 py-2">
                {!t.card_id ? (
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePaid(t);
                        }}
                        className={`h-8 w-8 rounded-lg transition-colors ${t.is_paid ? 'text-[var(--color-success)] hover:bg-white/5' : 'text-[var(--color-text-muted)] hover:bg-white/5'}`}
                    >
                        {t.is_paid ? <CheckCircle2 size={18} /> : <Clock size={16} />}
                    </IconButton>
                ) : (
                    <Text as="span" title={messages.transactions.row.paidViaBillTitle} className="inline-flex p-1">
                        <CreditCard size={16} color={colors.textMuted} />
                    </Text>
                )}
            </TableCell>
            <TableCell className="w-[100px] px-2 py-2 text-[13px] text-[var(--color-text-secondary)]">
                {dateToDisplay ? format(new Date(`${dateToDisplay}T12:00:00`), 'dd/MM/yyyy') : '-'}
            </TableCell>
            <TableCell className="px-2 py-2">
                <Container unstyled className="flex items-center gap-2">
                    {!isChild && (
                        <Container unstyled
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeConfig.iconWrapClass}`}
                        >
                            <TypeIcon size={16} />
                        </Container>
                    )}
                    {isChild && <Container unstyled className="w-8" />}
                    <Container unstyled className={t.is_paid ? 'opacity-100' : 'opacity-70'}>
                        <Container unstyled className="flex flex-wrap items-center gap-1.5">
                            <Text className={`text-[13px] font-semibold ${t.is_paid ? 'text-white' : 'text-white/70'}`}>
                                {t.description}
                            </Text>
                            {t.installment_number && (
                                <Text as="span" className={`${chipBase} bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]`}>
                                    {t.installment_number}/{t.total_installments}
                                </Text>
                            )}
                            {!t.is_paid && (
                                <Text as="span" className={`${chipBase} bg-[var(--color-warning)]/10 text-[var(--color-warning)]`}>
                                    {messages.transactions.row.pending}
                                </Text>
                            )}
                            {t.is_fixed && (
                                <Text as="span" title={messages.transactions.row.recurringTitle}>
                                    <RefreshCw size={12} className="text-[var(--color-text-muted)]" />
                                </Text>
                            )}
                        </Container>
                        {t.is_fixed && (
                            <Container unstyled className="mt-1">
                                <Text as="span" className={`${chipBase} bg-[var(--color-blue)]/10 text-[var(--color-blue)]`}>
                                    {messages.transactions.row.recurringChip}
                                </Text>
                            </Container>
                        )}
                    </Container>
                </Container>
            </TableCell>
            <TableCell className="px-2 py-2 align-top">
                {!isChild && (
                    <Container unstyled className="min-h-6">
                        {t.type !== 'transfer' ? (
                            isBillPayment ? (
                                <Text as="span" className={`${chipBase} bg-[var(--color-primary)]/10 text-[var(--color-primary)]`}>
                                    {messages.transactions.row.billPaymentChip}
                                </Text>
                            ) : t.category?.name ? (
                                <Text as="span"
                                    ref={(node) => setCategoryChipRef(node, t.category?.color)}
                                    className={chipBase}
                                >
                                    {t.category.name}
                                </Text>
                            ) : (
                                <Text as="span" className={`${chipBase} bg-white/5 text-[var(--color-text-muted)]`}>
                                    {messages.transactions.row.noCategory}
                                </Text>
                            )
                        ) : (
                            <Text as="span" className={`${chipBase} bg-[var(--color-warning)]/10 text-[var(--color-warning)]`}>
                                {messages.transactions.row.transferChip}
                            </Text>
                        )}
                    </Container>
                )}
            </TableCell>
            <TableCell className="px-2 py-2 align-top">
                {!isChild && (
                    <Container unstyled className="min-h-6">
                        <Text className={`text-[12px] font-medium leading-[20px] ${t.is_paid ? 'text-white' : 'text-white/60'}`}>
                            {t.payment_method === 'money' && messages.transactions.row.paymentMethodMoney}
                            {t.payment_method === 'debit' && messages.transactions.row.paymentMethodDebit}
                            {t.payment_method === 'credit' && messages.transactions.row.paymentMethodCredit}
                            {t.payment_method === 'pix' && messages.transactions.row.paymentMethodPix}
                            {t.payment_method === 'bill_payment' && messages.transactions.row.paymentMethodBillPayment}
                            {t.type === 'transfer' && messages.transactions.row.paymentMethodTransfer}
                            {!t.payment_method && (t.card_id ? messages.transactions.row.paymentMethodCard : messages.transactions.row.paymentMethodAccount)}
                        </Text>
                        <Text ref={setCardNameRef} className={`text-[11px] leading-tight ${t.is_paid ? 'opacity-100' : 'opacity-70'}`}>
                            {t.type === 'transfer'
                                ? `${t.bank_account?.name} → ${t.to_bank_account?.name}`
                                : (t.credit_card?.name || t.bank_account?.name || '')}
                        </Text>
                    </Container>
                )}
            </TableCell>
            <TableCell className="px-2 py-2 text-[11px] text-[var(--color-text-muted)]">
                -
            </TableCell>
            <TableCell className={`min-w-[100px] px-2 py-2 text-right text-[13px] font-bold tracking-tight ${typeConfig.amountClass}`}>
                {amountPrefix}{formatBRL(t.amount)}
            </TableCell>
            <TableCell className="w-12 px-2 py-2 text-right">
                <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, t)}
                    className="h-8 w-8 rounded-lg text-[var(--color-text-muted)] opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100 focus:opacity-100"
                >
                    <MoreVertical size={16} />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}




