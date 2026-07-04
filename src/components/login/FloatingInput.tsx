import React, { forwardRef, useId, useState } from 'react';
import clsx from 'clsx';
import styles from './FloatingInput.module.scss';

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  /** Leading adornment, e.g. a mail or lock icon. */
  leading?: React.ReactNode;
  /** Trailing adornment, e.g. a password visibility toggle. */
  trailing?: React.ReactNode;
}

/**
 * Minimal light-theme text field: soft rounded surface, a leading glyph and a
 * placeholder-driven label. The whole field breathes on focus with a subtle
 * citron ring.
 */
export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      error = false,
      leading,
      trailing,
      className,
      onFocus,
      onBlur,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const id = useId();
    const [focused, setFocused] = useState(false);

    return (
      <div
        className={clsx(
          styles.field,
          focused && styles.focused,
          error && styles.error,
          className
        )}
      >
        {leading && <span className={styles.leading} aria-hidden="true">{leading}</span>}
        <input
          {...rest}
          ref={ref}
          id={id}
          className={styles.input}
          placeholder={placeholder ?? label}
          aria-label={label}
          aria-invalid={error || undefined}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {trailing && <div className={styles.trailing}>{trailing}</div>}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
