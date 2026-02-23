import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { messages } from '@/shared/i18n/messages';

interface PaginationBarProps {
    totalItems: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
}

export function PaginationBar({
    totalItems,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: PaginationBarProps) {
    const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(totalItems / rowsPerPage));

    return (
        <Container unstyled className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            <Container unstyled className="flex items-center gap-2">
                <Text as="span">{messages.transactions.table.paginationItemsPerPage}</Text>
                <Select
                    value={String(rowsPerPage)}
                    onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
                    className="h-8 w-[110px] text-xs"
                >
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="-1">{messages.transactions.table.paginationAll}</option>
                </Select>
            </Container>

            <Container unstyled className="flex items-center gap-2">
                <Text as="span" className="text-xs">{messages.transactions.table.paginationLabel(page + 1, totalPages)}</Text>
                <Button
                    type="button"
                    onClick={() => onPageChange(Math.max(0, page - 1))}
                    disabled={page <= 0}
                    className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
                    variant="ghost"
                >
                    {messages.transactions.table.paginationPrevious}
                </Button>
                <Button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
                    variant="ghost"
                >
                    {messages.transactions.table.paginationNext}
                </Button>
            </Container>
        </Container>
    );
}
