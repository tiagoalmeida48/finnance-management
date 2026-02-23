import { cn } from "@/lib/utils";

interface ColorPickerFieldProps {
  value?: string;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  className?: string;
}

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const DEFAULT_PICKER_COLOR = "#c9a84c";

const getSafeInputColor = (value?: string) =>
  value && HEX_COLOR_REGEX.test(value) ? value : DEFAULT_PICKER_COLOR;

export function ColorPickerField({
  value,
  onChange,
  title,
  description,
  className,
}: ColorPickerFieldProps) {
  const inputColor = getSafeInputColor(value);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3",
        className,
      )}
    >
      <div className="relative h-[42px] w-[42px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: value || inputColor }}
        />
        <input
          type="color"
          value={inputColor}
          onChange={(event) => onChange(event.target.value)}
          aria-label={title}
          className="absolute left-[-25%] top-[-25%] h-[150%] w-[150%] cursor-pointer border-none bg-transparent p-0 opacity-0"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-bold text-white">{title}</p>
        {description ? (
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
