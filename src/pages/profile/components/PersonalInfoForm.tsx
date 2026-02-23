import { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { User as UserIcon, Mail, Save } from "lucide-react";
import { messages } from "@/shared/i18n/messages";
import { Stack } from "@/shared/components/layout/Stack";
import { Heading } from "@/shared/components/ui/Heading";
import { FormField } from "@/shared/components/forms/FormField";
import { Grid } from "@/shared/components/layout/Grid";
import { Container } from "@/shared/components/layout/Container";

interface PersonalInfoFormProps {
  fullName: string;
  setFullName: (val: string) => void;
  email: string | undefined;
  loading: boolean;
  handleUpdate: () => void;
  photoSection?: ReactNode;
}

export function PersonalInfoForm({
  fullName,
  setFullName,
  email,
  loading,
  handleUpdate,
  photoSection,
}: PersonalInfoFormProps) {
  const formMessages = messages.profile.personalInfo;
  return (
    <Stack className="space-y-2">
      <Container unstyled>
        <Heading level={3} className="mb-0.5 text-base font-extrabold">
          {formMessages.title}
        </Heading>
      </Container>

      <Grid className="grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
        <Container unstyled className="md:col-span-4 lg:col-span-3 relative">
          {photoSection}
        </Container>
        <Container unstyled className="md:col-span-8 lg:col-span-9">
          <Stack className="space-y-2">
            <FormField
              label={formMessages.fullNameLabel}
              htmlFor="profile-fullname"
            >
              <Container unstyled className="relative">
                <UserIcon
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-65"
                />
                <Input
                  id="profile-fullname"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Container>
            </FormField>

            <FormField label={formMessages.emailLabel} htmlFor="profile-email">
              <Container unstyled className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-65"
                />
                <Input
                  id="profile-email"
                  className="pl-9"
                  disabled
                  value={email || ""}
                />
              </Container>
            </FormField>
          </Stack>
        </Container>
      </Grid>

      <Button
        fullWidth
        variant="contained"
        size="large"
        startIcon={<Save size={18} />}
        onClick={handleUpdate}
        disabled={loading}
        className="mt-0.5 rounded-lg py-2 font-extrabold"
      >
        {loading ? formMessages.saving : formMessages.save}
      </Button>
    </Stack>
  );
}
