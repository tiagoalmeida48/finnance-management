import { useDashboardPageLogic } from "@/pages/dashboard/hooks/useDashboardPageLogic";
import { DashboardSummary } from "./components/DashboardSummary";
import { DashboardCharts } from "./components/DashboardCharts";
import { DashboardRecentTransactions } from "./components/DashboardRecentTransactions";
import { DashboardFilters } from "./components/DashboardFilters";
import { Container } from "@/shared/components/layout/Container";
import { Section } from "@/shared/components/layout/Section";
import { messages } from "@/shared/i18n/messages";
import { PageHeader } from "@/shared/components/composite/PageHeader";

export function DashboardPage() {
  const pageMessages = messages.dashboard.page;
  const {
    selectedYear,
    setSelectedYear,
    stats,
    chartData,
    categories,
    isLoading,
  } = useDashboardPageLogic();

  return (
    <Section>
      <Container>
        <PageHeader
          title={pageMessages.title}
          subtitle={pageMessages.subtitle}
          actions={
            <DashboardFilters
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          }
          className="w-full flex-col items-start md:flex-row md:items-center"
        />

        <DashboardSummary stats={stats} isLoading={isLoading} />

        <DashboardCharts chartData={chartData} categories={categories} />

        <DashboardRecentTransactions
          transactions={stats?.transactions}
          isLoading={isLoading}
        />
      </Container>
    </Section>
  );
}
