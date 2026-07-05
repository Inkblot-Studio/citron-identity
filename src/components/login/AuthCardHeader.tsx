import React, { useLayoutEffect, useRef } from 'react';
import { useAuthExperience } from './AuthExperienceContext';
import styles from './AuthExperience.module.scss';

interface AuthCardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional content above the title row (e.g. inbox icon). */
  lead?: React.ReactNode;
}

/**
 * Card header with copy on the left and a mascot slot on the right.
 * The shell portals a single Citron instance into the active slot so layout
 * stays content-aware across steps, zoom, and viewport width.
 */
export const AuthCardHeader: React.FC<AuthCardHeaderProps> = ({ title, subtitle, lead }) => {
  const { registerMascotSlot } = useAuthExperience();
  const mascotSlotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerMascotSlot(mascotSlotRef.current);
    return () => registerMascotSlot(null);
  }, [registerMascotSlot]);

  return (
    <header className={lead ? styles.cardHeaderWithLead : styles.cardHeader}>
      {lead}
      <div className={styles.cardHeaderRow}>
        <div className={styles.cardHeaderCopy}>
          <h1 className={styles.cardTitle}>{title}</h1>
          {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
        </div>
        <div ref={mascotSlotRef} className={styles.cardHeaderMascot} aria-hidden />
      </div>
    </header>
  );
};
