import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/shared/components/ui/icon-button";
import { Row } from "@/shared/components/layout/Row";
import { TableCell, TableRow } from "@/shared/components/layout/Table";
import { Text } from "@/shared/components/ui/Text";
import type { CreditCardStatementCycle } from "@/shared/interfaces";
import { OPEN_CYCLE_END } from "@/shared/utils/card-statement-cycle.utils";
import { messages } from "@/shared/i18n/messages";

interface CardStatementCycleHistoryRowProps {
  cycle: CreditCardStatementCycle;
  isOnlyCycle: boolean;
  isMutating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  formatCycleRange: (cycle: CreditCardStatementCycle) => string;
}

export function CardStatementCycleHistoryRow({
  cycle,
  isOnlyCycle,
  isMutating,
  onEdit,
  onDelete,
  formatCycleRange,
}: CardStatementCycleHistoryRowProps) {
  const cycleHistoryMessages = messages.cards.cycleHistory;
  const isCurrent = cycle.date_end === OPEN_CYCLE_END;

  return (
    <TableRow>
      <TableCell className="text-[13px]">{formatCycleRange(cycle)}</TableCell>
      <TableCell className="text-[13px]">
        {cycleHistoryMessages.dayLabel(cycle.closing_day)}
      </TableCell>
      <TableCell className="text-[13px]">
        {cycleHistoryMessages.dayLabel(cycle.due_day)}
      </TableCell>
      <TableCell className="text-[13px]">
        {isCurrent ? (
          <Text
            as="span"
            className="inline-flex rounded bg-[var(--color-primary)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]"
          >
            {cycleHistoryMessages.current}
          </Text>
        ) : (
          <Text
            as="span"
            className="inline-flex rounded bg-white/10 px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
          >
            {cycleHistoryMessages.history}
          </Text>
        )}
      </TableCell>
      <TableCell className="text-[13px]">{cycle.notes || "-"}</TableCell>
      <TableCell className="text-center text-[13px]">
        <Row className="justify-center gap-1">
          <IconButton
            size="small"
            onClick={onEdit}
            disabled={isMutating}
            className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
          >
            <Pencil size={15} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onDelete}
            disabled={isOnlyCycle || isMutating}
            className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
          >
            <Trash2 size={15} />
          </IconButton>
        </Row>
      </TableCell>
    </TableRow>
  );
}
