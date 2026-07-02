import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils';

interface SelectMenuOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

interface SelectMenuProps {
  value: string | number;
  onChange: (value: string) => void;
  options: SelectMenuOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

interface MenuRect {
  left: number;
  top: number;
  width: number;
  openUp: boolean;
}

export function SelectMenu({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  id,
  className,
  disabled,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<MenuRect | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((option) => String(option.value) === String(value));
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const measure = () => {
    const el = triggerRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const estimated = Math.min(options.length * 38 + 8, 264);
    const openUp = box.bottom + estimated > window.innerHeight && box.top > estimated;
    setRect({
      left: box.left,
      top: openUp ? box.top - estimated - 6 : box.bottom + 6,
      width: box.width,
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (open) {
      measure();
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = menuRef.current?.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (options[activeIndex]) pick(options[activeIndex].value);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onReflow = () => measure();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onReflow, true);
      window.removeEventListener('resize', onReflow);
    };
  }, [open]);

  const pick = (next: string | number) => {
    onChange(String(next));
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={onKeyDown}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-bg/60 px-3 text-left text-sm text-text transition-all hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn('flex min-w-0 items-center gap-2 truncate', !selected && 'text-text-muted')}>
          {selected?.icon ? <span className="shrink-0">{selected.icon}</span> : null}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open &&
        rect &&
        createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            className="animate-dialog-in fixed z-[70] max-h-64 overflow-auto rounded-lg border border-border-strong bg-surface-3 p-1 shadow-elevated"
            style={{ left: rect.left, top: rect.top, width: rect.width }}
          >
            {options.map((option, index) => {
              const isSelected = String(option.value) === String(value);
              const isHighlighted = index === activeIndex;
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => pick(option.value)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                      isSelected ? 'text-primary' : 'text-text',
                      isHighlighted ? 'bg-surface-2' : isSelected ? 'bg-primary/10' : '',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
                      <span className="truncate">{option.label}</span>
                    </span>
                    {isSelected && <Check size={15} className="shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
