import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { useApplyElementStyles } from '@/shared/hooks/useApplyElementStyles';

interface MonthlyTrackingProgressProps {
    progress: number;
    isSettled: boolean;
    progressText: string;
}

export function MonthlyTrackingProgress({
    progress,
    isSettled,
    progressText,
}: MonthlyTrackingProgressProps) {
    const progressBarRef = useApplyElementStyles<HTMLDivElement>({
        width: `${progress}%`,
    });

    return (
        <Container unstyled className="mb-1.5">
            <Container unstyled className="mb-1 flex items-center justify-between">
                <Text className="text-[11px] text-[var(--color-text-secondary)]">
                    {progressText}
                </Text>
                <Text
                    className={`text-[11px] font-bold ${isSettled ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'
                        }`}
                >
                    {progress}%
                </Text>
            </Container>
            <Container unstyled className="h-[7px] overflow-hidden rounded-full bg-[var(--color-surface)]">
                <Container
                    unstyled
                    ref={progressBarRef}
                    className={`h-full rounded-full ${isSettled
                            ? 'bg-[linear-gradient(90deg,var(--color-success)_0%,var(--color-success-light)_100%)]'
                            : 'bg-[linear-gradient(90deg,var(--color-warning)_0%,var(--color-primary)_100%)]'
                        }`}
                />
            </Container>
        </Container>
    );
}
