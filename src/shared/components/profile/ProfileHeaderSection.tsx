import { Box, Badge, IconButton, CircularProgress, Avatar, Typography } from '@mui/material';
import { Camera } from 'lucide-react';

interface ProfileHeaderSectionProps {
    avatarUrl: string | null;
    fullName: string;
    email: string | undefined;
    uploading: boolean;
    uploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeaderSection({ avatarUrl, fullName, email, uploading, uploadAvatar }: ProfileHeaderSectionProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        <IconButton
                            component="label"
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                color: '#000',
                                '&:hover': { bgcolor: 'primary.dark' },
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                border: '2px solid #121212'
                            }}
                        >
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={uploadAvatar}
                                disabled={uploading}
                            />
                            {uploading ? <CircularProgress size={16} color="inherit" /> : <Camera size={14} />}
                        </IconButton>
                    }
                >
                    <Avatar
                        src={avatarUrl || undefined}
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'primary.main',
                            color: '#000',
                            fontSize: '2.2rem',
                            fontWeight: 800,
                            border: '2px solid rgba(212, 175, 55, 0.2)'
                        }}
                    >
                        {!avatarUrl && (fullName ? fullName[0].toUpperCase() : email?.[0].toUpperCase())}
                    </Avatar>
                </Badge>
            </Box>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {fullName || 'Usuário'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {email}
                </Typography>
            </Box>
        </Box>
    );
}
