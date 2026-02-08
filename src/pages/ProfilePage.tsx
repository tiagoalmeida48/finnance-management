import { Box, Container, Typography, Stack, Card, CardContent, Alert, CircularProgress, Grid } from '@mui/material';
import { ShieldCheck, UserRound } from 'lucide-react';
import { colors } from '@/shared/theme';
import { useProfilePageLogic } from '../shared/hooks/useProfilePageLogic';
import { ProfileHeaderSection } from '../shared/components/profile/ProfileHeaderSection';
import { PersonalInfoForm } from '../shared/components/profile/PersonalInfoForm';
import { SecurityForm } from '../shared/components/profile/SecurityForm';
import { SiteBrandingForm } from '../shared/components/profile/SiteBrandingForm';

export function ProfilePage() {
    const {
        user, loading, fetching, message, fullName, setFullName, avatarUrl, uploading,
        password, setPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, pwdLoading,
        handleUpdate, uploadAvatar, handlePasswordUpdate
    } = useProfilePageLogic();

    if (fetching) {
        return (
            <Box sx={{ pt: 12, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 4, pb: 7 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography sx={{
                            fontSize: '28px',
                            fontFamily: '"Plus Jakarta Sans"',
                            fontWeight: 700,
                            color: colors.textPrimary,
                            mb: 0.5,
                        }}>
                            Perfil
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: colors.textSecondary }}>
                            Gerencie suas informações e segurança em um só lugar.
                        </Typography>
                    </Box>

                    {message && (
                        <Alert severity={message.type} sx={{ borderRadius: 2 }}>
                            {message.text}
                        </Alert>
                    )}

                    <Grid container spacing={2.25}>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: '14px',
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                                    <Stack spacing={3}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <UserRound size={18} color={colors.accent} />
                                            <Typography sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' }}>
                                                Dados da Conta
                                            </Typography>
                                        </Stack>

                                        <PersonalInfoForm
                                            fullName={fullName}
                                            setFullName={setFullName}
                                            email={user?.email}
                                            loading={loading}
                                            handleUpdate={handleUpdate}
                                            photoSection={(
                                                <ProfileHeaderSection
                                                    avatarUrl={avatarUrl}
                                                    uploading={uploading}
                                                    uploadAvatar={uploadAvatar}
                                                />
                                            )}
                                        />

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <ShieldCheck size={18} color={colors.accent} />
                                            <Typography sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' }}>
                                                Segurança
                                            </Typography>
                                        </Stack>

                                        <SecurityForm
                                            password={password}
                                            setPassword={setPassword}
                                            confirmPassword={confirmPassword}
                                            setConfirmPassword={setConfirmPassword}
                                            showPassword={showPassword}
                                            setShowPassword={setShowPassword}
                                            pwdLoading={pwdLoading}
                                            handlePasswordUpdate={handlePasswordUpdate}
                                        />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 4 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: '14px',
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                                    <Stack spacing={3}>
                                        <SiteBrandingForm />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}
