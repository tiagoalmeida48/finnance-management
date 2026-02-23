import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/shared/components/ui/label';

interface FormFieldProps {
    htmlFor?: string;
    label?: ReactNode;
    required?: boolean;
    labelSuffix?: ReactNode;
    helperText?: ReactNode;
    errorMessage?: ReactNode;
    className?: string;
    labelClassName?: string;
    helperTextClassName?: string;
    errorClassName?: string;
    children: ReactNode;
}

export function FormField({
    htmlFor,
    label,
    required = false,
    labelSuffix,
    helperText,
    errorMessage,
    className,
    labelClassName,
    helperTextClassName,
    errorClassName,
    children,
}: FormFieldProps) {
    return (
        <div className={cn('space-y-1', className)}>
            {label ? (
                <Label htmlFor={htmlFor} className={labelClassName}>
                    {label}
                    {required ? <span className="text-[var(--color-error)]"> *</span> : null}
                    {labelSuffix ? <span> {labelSuffix}</span> : null}
                </Label>
            ) : null}
            {children}
            {helperText ? (
                <p className={cn('text-xs text-[var(--color-text-muted)]', helperTextClassName)}>
                    {helperText}
                </p>
            ) : null}
            {errorMessage ? (
                <p className={cn('text-xs text-red-400', errorClassName)}>
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
}
