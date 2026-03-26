import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  color?: string;
}

interface CustomSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
  disabled,
  error,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Container unstyled ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`group flex h-10 w-full items-center justify-between rounded-[10px] border bg-[var(--overlay-white-04)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-[var(--color-error)]'
            : 'border-[var(--overlay-white-10)] hover:border-[var(--overlay-white-20)]'
        } ${className}`}
      >
        <Container unstyled className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span
              className="flex shrink-0 items-center justify-center"
              style={
                selectedOption.color
                  ? { color: selectedOption.color }
                  : { color: 'var(--color-text-secondary)' }
              }
            >
              {selectedOption.icon}
            </span>
          )}
          <Text
            className={`truncate ${!selectedOption ? 'text-[var(--color-text-muted)]' : 'font-medium'}`}
            style={selectedOption?.color ? { color: selectedOption.color } : undefined}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </Container>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[var(--color-text-secondary)] transition-transform ${isOpen ? 'rotate-180' : 'group-hover:text-white'}`}
        />
      </button>

      {isOpen && (
        <Container
          unstyled
          className="absolute top-[calc(100%+4px)] left-0 z-50 max-h-64 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#161618] p-1 shadow-2xl custom-scrollbar animate-in fade-in slide-in-from-top-2"
        >
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`mb-1 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-white/5 ${
              !value
                ? 'bg-[var(--color-primary)] text-black font-semibold hover:bg-[var(--color-primary)]/90'
                : 'text-white/70'
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  isSelected ? 'font-semibold' : 'hover:bg-white/10 hover:text-white'
                }`}
                style={{
                  ...(isSelected
                    ? {
                        backgroundColor: option.color
                          ? `${option.color}1A`
                          : 'var(--color-primary-10, rgba(200, 255, 0, 0.1))',
                        color: option.color || 'var(--color-primary)',
                      }
                    : { color: option.color || 'var(--color-text-primary)' }),
                }}
              >
                {option.icon && (
                  <span
                    className="flex shrink-0 items-center justify-center"
                    style={
                      isSelected
                        ? { color: option.color || 'var(--color-primary)' }
                        : {
                            color: option.color || 'var(--color-text-secondary)',
                          }
                    }
                  >
                    {option.icon}
                  </span>
                )}
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </Container>
      )}
    </Container>
  );
}
