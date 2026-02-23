import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { Transaction } from '@/shared/interfaces';
import { messages } from '@/shared/i18n/messages';
import { Text } from '@/shared/components/ui/Text';
import { Container } from '@/shared/components/layout/Container';

interface DashboardRecentTransactionsProps {
    transactions: Transaction[] | undefined;
    isLoading: boolean;
}

export function DashboardRecentTransactions({ transactions, isLoading }: DashboardRecentTransactionsProps) {
    const recentMessages = messages.dashboard.recentTransactions;
    const navigate = useNavigate();

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(val);

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'income':
                return {
                    icon: TrendingUp,
                    iconClass: 'bg-[var(--color-greenBg)] text-[var(--color-success)]',
                    textClass: 'text-[var(--color-success)]',
                    prefix: '+'
                };
            case 'expense':
                return {
                    icon: TrendingDown,
                    iconClass: 'bg-[var(--color-redBg)] text-[var(--color-error)]',
                    textClass: 'text-[var(--color-error)]',
                    prefix: '-'
                };
            default:
                return {
                    icon: ArrowRightLeft,
                    iconClass: 'bg-[var(--color-accentGlow)] text-[var(--color-accent)]',
                    textClass: 'text-[var(--color-accent)]',
                    prefix: ''
                };
        }
    };

    return (
        <Card>
            <CardContent className="p-3">
                <Container unstyled className="mb-2 flex items-center justify-between">
                    <Text className="text-base font-semibold [font-family:var(--font-heading)]">
                        {recentMessages.title}
                    </Text>
                    <Button
                        size="small"
                        endIcon={<ArrowRight size={14} />}
                        onClick={() => navigate('/transactions')}
                        className="bg-transparent text-xs text-[var(--color-text-secondary)] hover:bg-transparent hover:text-[var(--color-primary)]"
                    >
                        {recentMessages.viewAll}
                    </Button>
                </Container>

                <Container unstyled>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Container unstyled
                                key={i}
                                className={`py-1.5 ${i < 4 ? 'border-b border-[var(--color-border)]' : ''}`}
                            >
                                <Container unstyled className="flex items-center gap-2">
                                    <Container unstyled className="h-9 w-9 animate-pulse rounded-[10px] bg-white/5" />
                                    <Container unstyled className="flex-1">
                                        <Container unstyled className="mb-1 h-4 w-3/5 animate-pulse rounded bg-white/5" />
                                        <Container unstyled className="h-4 w-2/5 animate-pulse rounded bg-white/5" />
                                    </Container>
                                    <Container unstyled className="h-4 w-20 animate-pulse rounded bg-white/5" />
                                </Container>
                            </Container>
                        ))
                    ) : transactions?.slice(0, 6).map((t, idx) => {
                        const config = getTypeConfig(t.type);
                        const Icon = config.icon;
                        return (
                            <Container unstyled
                                key={t.id}
                                className={`py-1.5 transition-all duration-200 hover:bg-white/[0.02] hover:pl-0.5 ${idx < 5 ? 'border-b border-[var(--color-border)]' : ''}`}
                            >
                                <Container unstyled className="flex items-center gap-2">
                                    <Container unstyled
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${config.iconClass}`}
                                    >
                                        <Icon size={18} />
                                    </Container>
                                    <Container unstyled className="min-w-0 flex-1">
                                        <Text className="truncate text-[13.5px] font-medium text-[var(--color-text-primary)]">
                                            {t.description}
                                        </Text>
                                        <Text className="text-xs text-[var(--color-text-muted)]">
                                            {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM/yyyy')}
                                            {t.category?.name && ` • ${t.category.name}`}
                                        </Text>
                                    </Container>
                                    <Container unstyled className="shrink-0 text-right">
                                        <Text className={`text-sm font-semibold [font-family:var(--font-heading)] ${config.textClass}`}>
                                            {config.prefix}{formatBRL(t.amount)}
                                        </Text>
                                        {!t.is_paid && (
                                            <Text className="text-[10px] font-medium text-[var(--color-warning)]">
                                                {recentMessages.pending}
                                            </Text>
                                        )}
                                    </Container>
                                </Container>
                            </Container>
                        );
                    })}
                </Container>
            </CardContent>
        </Card>
    );
}





