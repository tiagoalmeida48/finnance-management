import { useState } from 'react';
import { Download } from 'lucide-react';
import { authService } from '@/features/auth/services/authService';
import { useToast } from '@/shared/components/feedback';
import { Button, Card, CardContent } from '@/shared/components/ui';

export function DataExportCard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const json = await authService.exportData();
      const blob = new Blob([json ?? '{}'], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'meus-dados-finnance.json';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erro ao exportar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-text">Meus dados</h3>
          <p className="text-sm text-text-muted">
            Baixe uma cópia completa dos seus dados em JSON (LGPD).
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} loading={loading}>
          <Download size={16} />
          Exportar meus dados
        </Button>
      </CardContent>
    </Card>
  );
}
