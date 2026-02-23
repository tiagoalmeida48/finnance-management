import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ImagePlus, Palette } from "lucide-react";
import { useSiteBranding } from "@/shared/hooks/api/useSiteBranding";
import { messages } from "@/shared/i18n/messages";
import { Stack } from "@/shared/components/layout/Stack";
import { Heading } from "@/shared/components/ui/Heading";
import { FormField } from "@/shared/components/forms/FormField";
import { Text } from "@/shared/components/ui/Text";
import { Container } from "@/shared/components/layout/Container";

export function SiteBrandingForm() {
  const brandingMessages = messages.profile.branding;
  const { siteTitle, logoImage, updateBranding, saving } = useSiteBranding();
  const [titleInput, setTitleInput] = useState(siteTitle);
  const [logoImageInput, setLogoImageInput] = useState<string | null>(
    logoImage,
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setTitleInput(siteTitle);
  }, [siteTitle]);

  useEffect(() => {
    setLogoImageInput(logoImage);
  }, [logoImage]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoImageInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = async () => {
    setMessage(null);
    try {
      await updateBranding({
        siteTitle: titleInput,
        logoImage: logoImageInput,
      });
      setMessage({ type: "success", text: brandingMessages.successSaved });
    } catch (error: unknown) {
      const text =
        error instanceof Error ? error.message : brandingMessages.errorSave;
      setMessage({ type: "error", text });
    }
  };

  return (
    <Container
      unstyled
      className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2"
    >
      <Container
        unstyled
        className="mb-1.5 flex items-center gap-1 text-[var(--color-primary)]"
      >
        <Palette size={16} />
        <Heading level={3} className="text-base font-extrabold">
          {brandingMessages.title}
        </Heading>
      </Container>

      <Stack className="space-y-1.5">
        {message && (
          <Container
            unstyled
            className={`rounded-md border px-3 py-2 text-sm ${
              message.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-400/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message.text}
          </Container>
        )}
        <FormField label={brandingMessages.titleLabel} htmlFor="site-title">
          <Input
            id="site-title"
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
          />
        </FormField>
        <Container unstyled className="space-y-1">
          <Text className="text-xs text-white/70">
            {brandingMessages.logoLabel}
          </Text>
          <Container unstyled className="flex items-center gap-1.5">
            <Container
              unstyled
              className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.14] bg-white/[0.04]"
            >
              {logoImageInput ? (
                <img
                  src={logoImageInput}
                  alt={brandingMessages.logoAlt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Text className="font-bold text-white/70">
                  {brandingMessages.logoPlaceholder}
                </Text>
              )}
            </Container>
            <Button
              component="label"
              variant="outlined"
              startIcon={<ImagePlus size={16} />}
              disabled={saving}
            >
              {brandingMessages.chooseImage}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
              />
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() => setLogoImageInput(null)}
              disabled={saving}
              className="text-[var(--color-text-secondary)]"
            >
              {brandingMessages.removeImage}
            </Button>
          </Container>
        </Container>
        <Button
          variant="contained"
          onClick={handleSaveBranding}
          disabled={saving}
        >
          {saving ? brandingMessages.saving : brandingMessages.save}
        </Button>
      </Stack>
    </Container>
  );
}
