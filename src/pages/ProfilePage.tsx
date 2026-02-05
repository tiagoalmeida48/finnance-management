import { Box, Container, Typography, Stack, Card, CardContent, Divider, Alert, CircularProgress } from '@mui/material';
import { useProfilePageLogic } from '../shared/hooks/useProfilePageLogic';
import { ProfileHeaderSection } from '../shared/components/profile/ProfileHeaderSection';
import { PersonalInfoForm } from '../shared/components/profile/PersonalInfoForm';
import { SecurityForm } from '../shared/components/profile/SecurityForm';

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
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Perfil</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>Gerencie suas informações e segurança.</Typography>

                <Stack spacing={4}>
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={4}>
                                <ProfileHeaderSection
                                    avatarUrl={avatarUrl}
                                    fullName={fullName}
                                    email={user?.email}
                                    uploading={uploading}
                                    uploadAvatar={uploadAvatar}
                                />

                                <Divider />

                                {message && (
                                    <Alert severity={message.type} sx={{ borderRadius: 1 }}>
                                        {message.text}
                                    </Alert>
                                )}

                                <PersonalInfoForm
                                    fullName={fullName}
                                    setFullName={setFullName}
                                    email={user?.email}
                                    createdAt={user?.created_at}
                                    loading={loading}
                                    handleUpdate={handleUpdate}
                                />
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent sx={{ p: 4 }}>
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
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}
