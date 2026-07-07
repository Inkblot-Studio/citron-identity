import React from 'react';
import { useAuthStore } from '@/store/auth';
import styles from './SubscriptionStep.module.scss';

interface SubscriptionStepProps {
  onSignIn: () => void;
}

export const SubscriptionStep: React.FC<SubscriptionStepProps> = ({ onSignIn }) => {
  const { selectPlan, skipSubscription, logout } = useAuthStore();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <button type="button" className={styles.signOut} onClick={onSignIn}>
            Sign in
          </button>
          <button type="button" className={styles.signOut} onClick={logout}>
            Sign out
          </button>
        </div>

        <div className={styles.stepIndicator}>2 of 3</div>
        <h1 className={styles.title}>Choose the best plan for you</h1>
      </div>

      <div className={styles.plansContainer}>
        <div className={styles.planCard}>
          <div className={styles.planHeader}>
            <h3 className={styles.planTitle}>Monthly</h3>
            <div className={styles.price}>$30 /month</div>
            <div className={styles.trial}>$0.00 For 7 days</div>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Powerful identity management</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Multi-app authentication</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Advanced security features</span>
            </div>
          </div>

          <button type="button" className={styles.chooseButton} onClick={() => selectPlan('monthly')}>
            Choose monthly
          </button>
        </div>

        <div className={styles.planCard}>
          <div className={styles.planHeader}>
            <h3 className={styles.planTitle}>Yearly</h3>
            <div className={styles.price}>$300 /year</div>
            <div className={styles.trial}>$0.00 For 7 days</div>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Priority support</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Complete privacy and no ads</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span className={styles.savings}>$60 cheaper</span>
            </div>
          </div>

          <button type="button" className={styles.chooseButton} onClick={() => selectPlan('yearly')}>
            Choose yearly and save 20%
          </button>
        </div>
      </div>

      <div className={styles.skipSection}>
        <button type="button" className={styles.skipButton} onClick={skipSubscription}>
          Cancel anytime before your trial ends
        </button>
        <button type="button" className={styles.skipButton} onClick={skipSubscription}>
          Skip, and do later in the settings
        </button>
        <p className={styles.loginHint}>
          Already have an account?{' '}
          <button type="button" className={styles.signInInline} onClick={onSignIn}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
