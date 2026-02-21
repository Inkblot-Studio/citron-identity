import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore, User as UserType } from '@/store/auth';
import styles from './Dashboard.module.scss';

interface DashboardProps {
  user: UserType;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { logout } = useAuthStore();

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <User size={24} />
          </div>
          <div className={styles.userDetails}>
            <h1 className={styles.welcomeText}>
              Welcome back, {user.name || user.email}!
            </h1>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" leftIcon={<Settings size={16} />}>
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut size={16} />}
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </motion.div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Account Overview</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Username</span>
              <span className={styles.statValue}>{user.username || 'Not set'}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Email Verified</span>
              <span className={styles.statValue}>
                {user.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>2FA Enabled</span>
              <span className={styles.statValue}>
                {user.twoFactorEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Member Since</span>
              <span className={styles.statValue}>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
          <div className={styles.actions}>
            <Button variant="primary" fullWidth>
              Access apps
            </Button>
            <Button variant="outline" fullWidth>
              View Profile
            </Button>
            <Button variant="outline" fullWidth>
              Security Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 