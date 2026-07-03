import { format } from 'date-fns';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, PageHeader, Spinner } from '@/shared/components/ui';
import { MonthlyTrackingCard, useTrackingPageLogic } from '@/features/tracking';

export function TrackingPage() {
  const { currentYear, goToPreviousYear, goToNextYear, isLoading, monthlyData } =
    useTrackingPageLogic();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarCheck}
        eyebrow="Mês a mês"
        title="Acompanhamento"
        description="Acompanhe o pagamento das contas mês a mês."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 p-1">
            <button
              onClick={goToPreviousYear}
              aria-label="Ano anterior"
              className="rounded-full p-1 text-text-muted transition-colors hover:bg-surface hover:text-text"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[62px] text-center font-bold text-text">
              {format(currentYear, 'yyyy')}
            </span>
            <button
              onClick={goToNextYear}
              aria-label="Próximo ano"
              className="rounded-full p-1 text-text-muted transition-colors hover:bg-surface hover:text-text"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : monthlyData.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-10 text-center text-sm text-text-muted">
              Nenhum dado de acompanhamento disponível para este ano.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {monthlyData.map((data) => (
            <MonthlyTrackingCard key={data.monthName} data={data} />
          ))}
        </div>
      )}
    </div>
  );
}
