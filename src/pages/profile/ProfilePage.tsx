import { Card, CardContent } from "@/shared/components/ui/card";
import { ShieldCheck, UserRound } from "lucide-react";
import { colors } from "@/shared/theme";
import { useProfilePageLogic } from "@/pages/profile/hooks/useProfilePageLogic";
import { ProfileHeaderSection } from "./components/ProfileHeaderSection";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import { SecurityForm } from "./components/SecurityForm";
import { Container } from "@/shared/components/layout/Container";
import { Section } from "@/shared/components/layout/Section";
import { Grid } from "@/shared/components/layout/Grid";
import { messages } from "@/shared/i18n/messages";
import { PageHeader } from "@/shared/components/composite/PageHeader";
import { Stack } from "@/shared/components/layout/Stack";
import { Heading } from "@/shared/components/ui/Heading";
import { Text } from "@/shared/components/ui/Text";

export function ProfilePage() {
  const pageMessages = messages.profile.page;
  const {
    user,
    loading,
    fetching,
    message,
    fullName,
    setFullName,
    avatarUrl,
    uploading,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    pwdLoading,
    handleUpdate,
    uploadAvatar,
    handlePasswordUpdate,
  } = useProfilePageLogic();

  if (fetching) {
    return (
      <Container unstyled className="flex justify-center pt-12">
        <Text
          as="span"
          className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-r-transparent"
        />
      </Container>
    );
  }

  return (
    <Section className="pb-7">
      <Container>
        <Stack className="space-y-3">
          <PageHeader
            title={pageMessages.title}
            subtitle={pageMessages.subtitle}
            className="mb-0"
          />

          {message && (
            <Container
              unstyled
              className={`rounded-lg border px-3 py-2 text-sm ${message.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-400/30 bg-red-500/10 text-red-300"
                }`}
            >
              {message.text}
            </Container>
          )}

          <Grid className="lg:grid-cols-12">
            <Container unstyled className="lg:col-span-6">
              <Card className="h-full rounded-[14px]">
                <CardContent className="p-[18px] md:p-[22px]">
                  <Stack className="space-y-3">
                    <Container unstyled className="flex items-center gap-1">
                      <UserRound size={18} color={colors.accent} />
                      <Heading level={3} className="font-heading font-bold">
                        {pageMessages.accountData}
                      </Heading>
                    </Container>

                    <PersonalInfoForm
                      fullName={fullName}
                      setFullName={setFullName}
                      email={user?.email}
                      loading={loading}
                      handleUpdate={handleUpdate}
                      photoSection={
                        <ProfileHeaderSection
                          avatarUrl={avatarUrl}
                          uploading={uploading}
                          uploadAvatar={uploadAvatar}
                        />
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Container>

            <Container unstyled className="lg:col-span-6">
              <Card className="h-full rounded-[14px]">
                <CardContent className="p-[18px] md:p-[22px]">
                  <Stack className="space-y-3">
                    <Container unstyled className="flex items-center gap-1">
                      <ShieldCheck size={18} color={colors.accent} />
                      <Heading level={3} className="font-heading font-bold">
                        {pageMessages.security}
                      </Heading>
                    </Container>

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
            </Container>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
