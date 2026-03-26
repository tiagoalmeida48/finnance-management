import { IconButton } from '@/shared/components/ui/icon-button';
import { Button } from '@/shared/components/ui/button';
import { Camera } from 'lucide-react';
import { messages } from '@/shared/i18n/messages';
import { Stack } from '@/shared/components/layout/Stack';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

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
      className="flex h-full w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 shadow-sm"
    >
      <Stack className="flex-row items-center justify-between w-full gap-3">
        <Container unstyled className="relative">
          <Container unstyled className="relative">
            <Container
              unstyled
              className="h-20 w-20 overflow-hidden rounded-full border-[1.5px] border-[var(--color-primary)50] bg-[var(--color-primary)] text-[var(--color-neutral-black)] shadow-md"
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
                className="h-[24px] w-[24px] border-[2px] border-[var(--color-avatar-border-dark)] bg-[var(--color-primary)] text-[var(--color-avatar-text-dark)] shadow-[0_4px_10px_var(--overlay-black-25)] hover:bg-[var(--color-primary-dark)]"
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
          startIcon={<Camera size={14} />}
          disabled={uploading}
          className="rounded-[6px] border-[var(--color-primary)80] px-2 py-1 text-xs font-semibold text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--overlay-primary-08)]"
        >
          {uploading ? headerMessages.uploading : 'Trocar'}
          <input hidden accept="image/*" type="file" onChange={uploadAvatar} disabled={uploading} />
        </Button>
      </Stack>
    </Container>
  );
}
