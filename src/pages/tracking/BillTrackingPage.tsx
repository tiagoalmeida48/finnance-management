import { IconButton } from '@/shared/components/ui/icon-button';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useBillTrackingPageLogic } from '@/pages/tracking/hooks/useBillTrackingPageLogic';
import { MonthlyTrackingCard } from './components/MonthlyTrackingCard';
import { Container } from '@/shared/components/layout/Container';
import { Section } from '@/shared/components/layout/Section';
import { Grid } from '@/shared/components/layout/Grid';
import { messages } from '@/shared/i18n/messages';
import { PageHeader } from '@/shared/components/composite/PageHeader';
import { Row } from '@/shared/components/layout/Row';
import { Text } from '@/shared/components/ui/Text';

export function BillTrackingPage() {
    const pageMessages = messages.tracking.page;
    const {
        currentYear, setCurrentYear,
        loadingTx, loadingCards,
        monthlyData
    } = useBillTrackingPageLogic();

    if (loadingTx || loadingCards) {
        return (
            <Container unstyled className="flex justify-center py-8">
                <Text as="span" className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-r-transparent" />
            </Container>
        );
    }

    return (
        <Section>
            <Container>
                <PageHeader
                    title={(
                        <Row className="items-center gap-1.5">
                            <Container unstyled className="flex rounded-md bg-[var(--color-accentGlow)] p-1 text-[var(--color-accent)]">
                                <CalendarCheck size={22} />
                            </Container>
                            <Text as="span" className="text-2xl font-bold">{pageMessages.title}</Text>
                        </Row>
                    )}
                    subtitle={pageMessages.subtitle}
                    actions={(
                        <Container unstyled className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--overlay-white-02)] p-1">
                            <IconButton
                                size="small"
                                onClick={() => setCurrentYear(prev => addMonths(prev, -12))}
                                className="text-[var(--color-text-secondary)]"
                            >
                                <ChevronLeft size={18} />
                            </IconButton>
                            <Text className="font-heading min-w-[62px] text-center font-bold">
                                {format(currentYear, 'yyyy')}
                            </Text>
                            <IconButton
                                size="small"
                                onClick={() => setCurrentYear(prev => addMonths(prev, 12))}
                                className="text-[var(--color-text-secondary)]"
                            >
                                <ChevronRight size={18} />
                            </IconButton>
                        </Container>
                    )}
                    className="w-full flex-col items-start md:flex-row md:items-center"
                />

                <Grid className="sm:grid-cols-2 xl:grid-cols-4">
                    {monthlyData.map((data, idx) => (
                        <MonthlyTrackingCard key={idx} data={data} />
                    ))}
                </Grid>
            </Container>
        </Section>
    );
}

