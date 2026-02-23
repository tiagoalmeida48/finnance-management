import { IconButton } from "@/shared/components/ui/icon-button";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  MoreVertical,
  ChevronDown,
  CheckCircle2,
  Clock,
  Landmark,
  Circle,
} from "lucide-react";
import { Transaction } from "@/shared/services/transactions.service";
import { colors } from "@/shared/theme";
import { TransactionGroup } from "@/shared/utils/transactionsPage.utils";
import { useState } from "react";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/utils/currency";

interface TransactionMobileCardProps {
  item: Transaction | TransactionGroup;
  selectedIds: string[];
  handleSelectRow: (id: string) => void;
  handleTogglePaid: (t: Transaction) => void;
  handleOpenMenu: (e: React.MouseEvent<HTMLElement>, t: Transaction) => void;
  isPendingToggle?: (id: string) => boolean;
}

export function TransactionMobileCard({
  item,
  selectedIds,
  handleSelectRow,
  handleTogglePaid,
  handleOpenMenu,
  isPendingToggle: _isPendingToggle,
}: TransactionMobileCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isGroup = "isGroup" in item && item.isGroup;
  const group = isGroup ? (item as TransactionGroup) : null;
  const transaction = isGroup ? group!.mainTransaction : (item as Transaction);

  const isSelected = isGroup
    ? group!.items.every((it) => selectedIds.includes(it.id))
    : selectedIds.includes(transaction.id);

  const toggleSelection = () => {
    if (isGroup) {
      group!.items.forEach((it) => {
        handleSelectRow(it.id);
      });
    } else {
      handleSelectRow(transaction.id);
    }
  };

  const isBillPayment = transaction.payment_method === "bill_payment";
  const isPaid = isGroup ? group!.isAllPaid : transaction.is_paid;

  const getTypeConfig = (type: string) => {
    if (isBillPayment) {
      return {
        icon: Landmark,
        iconClass: "bg-[var(--overlay-primary-14)] text-[var(--color-accent)]",
        amountClass: isPaid
          ? "text-[var(--color-success)]"
          : "text-[var(--color-accent)]",
      };
    }

    switch (type) {
      case "income":
        return {
          icon: TrendingUp,
          iconClass: "bg-[var(--color-greenBg)] text-[var(--color-success)]",
          amountClass: "text-[var(--color-success)]",
        };
      case "expense":
        return {
          icon: TrendingDown,
          iconClass: "bg-[var(--color-redBg)] text-[var(--color-error)]",
          amountClass: "text-[var(--color-error)]",
        };
      default:
        return {
          icon: ArrowRightLeft,
          iconClass: "bg-[var(--color-yellowBg)] text-[var(--color-warning)]",
          amountClass: isPaid
            ? "text-[var(--color-text-primary)]"
            : "text-[var(--color-warning)]",
        };
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const TypeIcon = typeConfig.icon;
  const displayAmount = isGroup ? group!.totalAmount : transaction.amount;
  const dateToDisplay =
    transaction.type === "expense" && !isBillPayment
      ? transaction.purchase_date || transaction.payment_date
      : transaction.payment_date || transaction.purchase_date;
  const setCategoryChipRef = (node: HTMLSpanElement | null) => {
    if (!node) return;
    node.style.setProperty(
      "background-color",
      transaction.category?.color
        ? `${transaction.category.color}15`
        : "var(--overlay-white-05)",
    );
    node.style.setProperty(
      "color",
      transaction.category?.color || colors.textSecondary,
    );
  };
  return (
    <Container
      unstyled
      className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-2"
    >
      <Container unstyled className="flex flex-col gap-2">
        <Container unstyled className="flex items-center justify-between">
          <Text className="text-xs text-[var(--color-text-secondary)]">
            {dateToDisplay
              ? format(new Date(`${dateToDisplay}T12:00:00`), "dd/MM/yyyy")
              : "-"}
          </Text>
          <Container unstyled className="flex items-center gap-2">
            {!isGroup && !transaction.card_id && (
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePaid(transaction);
                }}
                className="flex items-center gap-1"
              >
                {isPaid ? (
                  <CheckCircle2 size={14} color={colors.accent} />
                ) : (
                  <Clock size={14} color={colors.textMuted} />
                )}
                <Text
                  as="span"
                  className={`text-[11px] ${isPaid ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}
                >
                  {isPaid
                    ? messages.transactions.row.paid
                    : messages.transactions.row.pending}
                </Text>
              </Button>
            )}
            {isGroup && (
              <Text
                as="span"
                className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)]"
              >
                {messages.transactions.mobileCard.paidCountLabel(
                  group!.paidItemsCount,
                  group!.totalItemsCount,
                )}
              </Text>
            )}
          </Container>
        </Container>

        <Container unstyled className="flex items-start gap-2">
          <Container
            unstyled
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${typeConfig.iconClass}`}
          >
            <TypeIcon size={20} />
          </Container>

          <Container unstyled className="min-w-0 flex-grow">
            <Text className="mb-1 text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
              {transaction.description}
            </Text>

            <Container unstyled className="flex flex-wrap items-center gap-1">
              {isBillPayment && (
                <Text
                  as="span"
                  className="rounded bg-[var(--overlay-primary-14)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]"
                >
                  {messages.transactions.row.billPaymentChip}
                </Text>
              )}
              {!isBillPayment && transaction.category?.name && (
                <Text
                  as="span"
                  ref={setCategoryChipRef}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold"
                >
                  {transaction.category.name}
                </Text>
              )}
              {isGroup && (
                <Text
                  as="span"
                  className="rounded bg-[var(--color-purpleBg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-secondary)]"
                >
                  {group!.type === "installment"
                    ? messages.transactions.table.groupInstallmentLabel
                    : messages.transactions.table.groupRecurringLabel}
                </Text>
              )}
            </Container>

            <Text
              className={`mt-1 text-base font-bold ${typeConfig.amountClass}`}
            >
              {formatCurrency(displayAmount)}
            </Text>
          </Container>

          <Container unstyled className="flex flex-col items-end gap-1">
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(e, transaction)}
              className="text-[var(--color-text-muted)]"
            >
              <MoreVertical size={18} />
            </IconButton>

            <button
              type="button"
              onClick={toggleSelection}
              className={`flex h-5 w-5 items-center justify-center rounded transition-all ${isSelected
                ? "text-[var(--color-warning)] hover:brightness-75 hover:bg-[var(--color-warning)]/10"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                }`}
            >
              {isSelected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </button>
          </Container>
        </Container>

        {isGroup && (
          <Container unstyled>
            <Button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex w-full items-center justify-center border-t border-[var(--color-border)] pt-1 text-xs text-[var(--color-text-secondary)]"
            >
              {expanded
                ? messages.transactions.mobileCard.hideInstallments
                : messages.transactions.mobileCard.showInstallments(
                  group!.items.length,
                )}
              <ChevronDown
                size={14}
                className={`ml-1 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </Button>

            {expanded && (
              <Container unstyled className="mt-2 flex flex-col gap-1">
                {group!.items.map((subItem) => (
                  <TransactionMobileCard
                    key={subItem.id}
                    item={subItem}
                    selectedIds={selectedIds}
                    handleSelectRow={handleSelectRow}
                    handleTogglePaid={handleTogglePaid}
                    handleOpenMenu={handleOpenMenu}
                    isPendingToggle={_isPendingToggle}
                  />
                ))}
              </Container>
            )}
          </Container>
        )}
      </Container>
    </Container>
  );
}
