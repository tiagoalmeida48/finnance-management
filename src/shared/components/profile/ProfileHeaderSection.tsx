import { Box, Badge, IconButton, CircularProgress, Avatar, Stack, Button } from '@mui/material';
import { Camera } from 'lucide-react';

interface ProfileHeaderSectionProps {
    avatarUrl: string | null;
    uploading: boolean;
    uploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeaderSection({ avatarUrl, uploading, uploadAvatar }: ProfileHeaderSectionProps) {
    return (
        <Box
            sx={{
                p: { xs: 1.5, md: 3.5 },
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.01)',
            }}
        >
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
            >
                <Box sx={{ position: 'relative' }}>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <IconButton
                                component="label"
                                sx={{
                                    width: 26,
                                    height: 26,
                                    bgcolor: 'primary.main',
                                    color: '#101321',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                                    border: '2px solid #0f1323'
                                }}
                            >
                                <input
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={uploadAvatar}
                                    disabled={uploading}
                                />
                                {uploading ? <CircularProgress size={12} color="inherit" /> : <Camera size={12} />}
                            </IconButton>
                        }
                    >
                        <Avatar
                            src={avatarUrl || undefined}
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'primary.main',
                                color: '#111',
                                border: '1.5px solid rgba(212, 175, 55, 0.28)',
                                boxShadow: '0 6px 14px rgba(0,0,0,0.25)'
                            }}
                        />
                    </Badge>
                </Box>
                <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<Camera size={15} />}
                    disabled={uploading}
                    sx={{
                        borderColor: 'rgba(212, 175, 55, 0.5)',
                        color: 'primary.main',
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 1.25,
                        minWidth: 0,
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(212, 175, 55, 0.08)'
                        }
                    }}
                >
                    {uploading ? 'Enviando...' : 'Trocar foto'}
                    <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                </Button>
            </Stack>
        </Box>
    );
}
