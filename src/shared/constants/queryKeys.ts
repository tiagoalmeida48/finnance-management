export interface TransactionQueryFilters {
    account_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    is_paid?: boolean;
}

type DashboardFilter = Date | { start: string; end: string };

const getDashboardFilterToken = (filter?: DashboardFilter) => {
    if (!filter) return 'all';
    if (filter instanceof Date) return filter.toISOString().slice(0, 10);
    return `${filter.start}_${filter.end}`;
};

export const queryKeys = {
    accounts: {
        all: ['accounts'] as const,
    },
    categories: {
        all: ['categories'] as const,
    },
    cards: {
        all: ['credit_cards'] as const,
        details: (id: string) => ['credit_cards', id, 'details'] as const,
        statementCycles: (id: string) => ['credit_cards', id, 'statement-cycles'] as const,
    },
    transactions: {
        all: ['transactions'] as const,
        list: (filters?: TransactionQueryFilters) => ['transactions', filters ?? null] as const,
        firstDate: ['transactions', 'first-date'] as const,
    },
    dashboard: {
        stats: (filter?: DashboardFilter) => ['dashboard-stats', getDashboardFilterToken(filter)] as const,
        charts: (filter?: DashboardFilter) => ['dashboard-charts', getDashboardFilterToken(filter)] as const,
        categories: (filter?: DashboardFilter) => ['dashboard-categories', getDashboardFilterToken(filter)] as const,
    },
    salary: {
        history: ['salary-settings-history'] as const,
        current: ['salary-settings-current'] as const,
    },
} as const;
