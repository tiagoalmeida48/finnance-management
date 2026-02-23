import { IconButton } from "@/shared/components/ui/icon-button";
import { Button } from "@/shared/components/ui/button";
import { Camera } from "lucide-react";
import { messages } from "@/shared/i18n/messages";
import { Stack } from "@/shared/components/layout/Stack";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

interface ProfileHeaderSectionProps {
  avatarUrl: string | null;
  uploading: boolean;
  uploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeaderSection({
  avatarUrl,
  uploading,
  uploadAvatar,
}: ProfileHeaderSectionProps) {
  const headerMessages = messages.profile.header;
  return (
    <Container
      unstyled
      className="rounded-lg border border-white/[0.08] bg-white/[0.01] p-1.5 md:p-3.5"
    >
      <Stack className="flex-row items-center justify-between gap-1.5">
        <Container unstyled className="relative">
          <Container unstyled className="relative">
            <Container
              unstyled
              className="h-16 w-16 overflow-hidden rounded-full border-[1.5px] border-[var(--color-primary)47] bg-[var(--color-primary)] text-[var(--color-neutral-black)] shadow-[0_6px_14px_var(--overlay-black-25)]"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={headerMessages.avatarAlt}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </Container>
            <Container unstyled className="absolute bottom-0 right-0">
              <IconButton
                component="label"
                className="h-[26px] w-[26px] border-2 border-[var(--color-avatar-border-dark)] bg-[var(--color-primary)] text-[var(--color-avatar-text-dark)] shadow-[0_4px_10px_var(--overlay-black-25)] hover:bg-[var(--color-primary-dark)]"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={uploadAvatar}
                  disabled={uploading}
                />
                {uploading ? (
                  <Text
                    as="span"
                    className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-r-transparent"
                  />
                ) : (
                  <Camera size={12} />
                )}
              </IconButton>
            </Container>
          </Container>
        </Container>
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<Camera size={15} />}
          disabled={uploading}
          className="min-w-0 rounded-[6px] border-[var(--color-primary)80] px-[5px] font-semibold text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--overlay-primary-08)]"
        >
          {uploading ? headerMessages.uploading : headerMessages.changePhoto}
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </Button>
      </Stack>
    </Container>
  );
}
