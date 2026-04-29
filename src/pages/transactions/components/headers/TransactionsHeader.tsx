import { Upload, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
<<<<<<< HEAD
import { PluggySyncButton } from '@/pages/dashboard/components/PluggySyncButton';
=======
>>>>>>> finnance-management/main

interface TransactionsHeaderProps {
  isMobile: boolean;
  onImport: () => void;
  onAdd: () => void;
}

export function TransactionsHeader({ isMobile, onImport, onAdd }: TransactionsHeaderProps) {
  const pageMessages = messages.transactions.page;

  return (
    <Container unstyled className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
      <Container unstyled>
        <h1
          className={`font-heading mb-0.5 font-bold text-[var(--color-text-primary)] ${isMobile ? 'text-2xl' : 'text-[28px]'}`}
        >
          {pageMessages.title}
        </h1>
        <Text className="text-sm text-[var(--color-text-secondary)]">{pageMessages.subtitle}</Text>
      </Container>

      <Container unstyled className="flex gap-2">
<<<<<<< HEAD
        <PluggySyncButton />
=======
>>>>>>> finnance-management/main
        <Button variant="outlined" startIcon={<Upload size={16} />} onClick={onImport}>
          {pageMessages.importButton}
        </Button>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={onAdd}>
          {isMobile ? pageMessages.newButtonShort : pageMessages.newButton}
        </Button>
      </Container>
    </Container>
  );
}
