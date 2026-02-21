import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPortal.module.scss';

interface AuthPageLayoutProps {
  children?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const navigate = useNavigate();
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBackgroundBlurred(true);
      setIsFormVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={`${styles.backgroundImage} ${isBackgroundBlurred ? styles.blurred : ''}`} />
      </div>

      <div className={`${styles.content} ${isFormVisible ? styles.visible : ''}`}>
        <div className={styles.header}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.backLink}
          >
            ← Back
          </button>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {children && (
          <div className={styles.formContent}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
