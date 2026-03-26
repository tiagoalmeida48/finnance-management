import { createElement } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { IconButton } from '@/shared/components/ui/icon-button';
import { MoreVertical } from 'lucide-react';
import { Category } from '@/shared/interfaces/category.interface';
import { colors } from '@/shared/theme';
import { getCategoryIcon } from '../categoryIcons';
import { useApplyElementStyles } from '@/shared/hooks/useApplyElementStyles';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

interface CategoryCardProps {
  category: Category;
  handleOpenMenu: (event: React.MouseEvent<HTMLElement>, category: Category) => void;
}

export function CategoryCard({ category, handleOpenMenu }: CategoryCardProps) {
  const cardMessages = messages.categories.card;
  const iconElement = createElement(getCategoryIcon(category.icon), {
    size: 18,
  });
  const stripeRef = useApplyElementStyles<HTMLSpanElement>({
    'background-color': category.color || colors.accent,
  });
  const iconColorRef = useApplyElementStyles<HTMLDivElement>({
    color: category.color || colors.accent,
  });

  return (
    <Container unstyled>
      <Card className="group relative overflow-hidden border border-[var(--color-border)]">
        <Text as="span" ref={stripeRef} className="absolute inset-y-0 left-0 w-[3px]" />
        <CardContent className="px-2 py-1.75">
          <Container unstyled className="flex items-center justify-between gap-2">
            <Container unstyled className="flex min-w-0 items-center gap-1.5">
              <Container
                unstyled
                ref={iconColorRef}
                className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] border border-[var(--color-border)] bg-[var(--overlay-white-03)]"
              >
                {iconElement}
              </Container>

              <Container unstyled className="min-w-0">
                <Text className="truncate text-[15px] font-semibold text-[var(--color-text-primary)]">
                  {category.name}
                </Text>
                <Text
                  as="span"
                  className={`mt-0.5 inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold ${
                    category.type === 'expense'
                      ? 'border-[var(--overlay-error-35)] bg-[var(--color-redBg)] text-[var(--color-error)]'
                      : 'border-[var(--overlay-success-35)] bg-[var(--color-greenBg)] text-[var(--color-success)]'
                  }`}
                >
                  {category.type === 'expense' ? cardMessages.expense : cardMessages.income}
                </Text>
              </Container>
            </Container>

            <Container unstyled className="category-actions flex shrink-0">
              <IconButton
                size="small"
                title={cardMessages.actionsLabel}
                onClick={(event) => handleOpenMenu(event, category)}
                className="border border-[var(--overlay-white-12)] bg-white/[0.04] text-[var(--color-text-primary)] hover:bg-white/[0.08]"
              >
                <MoreVertical size={16} />
              </IconButton>
            </Container>
          </Container>
        </CardContent>
      </Card>
    </Container>
  );
}
