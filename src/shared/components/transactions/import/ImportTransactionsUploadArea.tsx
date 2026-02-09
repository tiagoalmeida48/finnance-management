import { Box, Button, Stack, Typography } from '@mui/material';
import { FileText, Upload } from 'lucide-react';

interface ImportTransactionsUploadAreaProps {
    isDragOver: boolean;
    onDrop: (event: React.DragEvent<HTMLElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLElement>) => void;
    onDragLeave: (event: React.DragEvent<HTMLElement>) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDownloadTemplate: () => void;
}

export function ImportTransactionsUploadArea({
    isDragOver,
    onDrop,
    onDragOver,
    onDragLeave,
    onFileChange,
    onDownloadTemplate,
}: ImportTransactionsUploadAreaProps) {
    return (
        <Stack spacing={2}>
            <Box
                component="label"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                    border: isDragOver ? '2px dashed #D4AF37' : '2px dashed #2A2A2A',
                    borderRadius: 2,
                    textAlign: 'center',
                    bgcolor: isDragOver ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.01)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: 'rgba(212, 175, 55, 0.05)',
                        borderColor: 'primary.main',
                        '& .upload-icon': { color: 'primary.main', opacity: 1 }
                    }
                }}
            >
                <input type="file" accept=".csv" hidden onChange={onFileChange} />
                <Upload className="upload-icon" size={48} style={{ marginBottom: 16, opacity: 0.5, transition: 'all 0.2s' }} />
                <Typography variant="h6">Selecione seu arquivo CSV</Typography>
                <Typography color="text.secondary" variant="body2">ou arraste e solte aqui</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    size="small"
                    variant="text"
                    startIcon={<FileText size={16} />}
                    onClick={onDownloadTemplate}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                    Baixar modelo de CSV
                </Button>
            </Box>
        </Stack>
    );
}
