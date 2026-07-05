import React, { useId, useState } from 'react';
import { Check, Circle } from 'lucide-react';
import {
  getPasswordStrength,
  passwordStrengthColor,
  passwordStrengthLabel,
} from '@/lib/utils';
import styles from './PasswordStrengthMeter.module.scss';

interface PasswordStrengthMeterProps {
  password: string;
  /** Show the requirements popover while the password field is focused. */
  fieldFocused?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  fieldFocused = false,
}) => {
  const popoverId = useId();
  const [hovered, setHovered] = useState(false);
  const [triggerFocused, setTriggerFocused] = useState(false);

  const { score, requirements } = getPasswordStrength(password);
  const showPopover = fieldFocused || hovered || triggerFocused;
  const hasPassword = password.length > 0;
  const label = hasPassword ? passwordStrengthLabel(score) : 'Requirements';
  const fillColor = hasPassword
    ? passwordStrengthColor(score)
    : 'var(--inkblot-semantic-color-border-strong)';

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-describedby={showPopover ? popoverId : undefined}
        aria-expanded={showPopover}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setTriggerFocused(true)}
        onBlur={() => setTriggerFocused(false)}
      >
        <div
          className={styles.track}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={
            hasPassword
              ? `Password strength: ${passwordStrengthLabel(score)}`
              : 'Password requirements'
          }
        >
          <div
            className={styles.fill}
            style={{
              width: hasPassword ? `${(score / 5) * 100}%` : '0%',
              backgroundColor: fillColor,
            }}
          />
        </div>
        <span className={styles.label} style={hasPassword ? { color: fillColor } : undefined}>
          {label}
        </span>
      </button>

      <div
        id={popoverId}
        role="tooltip"
        className={styles.popover}
        data-open={showPopover || undefined}
      >
        <p className={styles.popoverTitle}>Password requirements</p>
        {hasPassword ? (
          <p className={styles.popoverStrength}>
            Strength: <strong>{passwordStrengthLabel(score)}</strong>
          </p>
        ) : null}
        <ul className={styles.requirements}>
          {requirements.map((req) => (
            <li key={req.id} className={req.met ? styles.requirementMet : styles.requirementUnmet}>
              {req.met ? (
                <Check size={14} strokeWidth={2.25} aria-hidden />
              ) : (
                <Circle size={14} strokeWidth={2} aria-hidden />
              )}
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
