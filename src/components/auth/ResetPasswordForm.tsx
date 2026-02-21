import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSuccess,
}) => {
  const { resetPassword, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      await resetPassword(token, data.password);
      onSuccess();
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[var(--inkblot-dark-color-background-secondary)] p-6 shadow-lg">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)] mb-2">
        Set new password
      </h1>
      <p className="text-neutral-500 dark:text-[var(--inkblot-dark-color-text-secondary)] mb-6">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="Enter new password"
          leftIcon={<Lock size={16} />}
          showPasswordToggle
          fullWidth
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm new password"
          leftIcon={<Lock size={16} />}
          showPasswordToggle
          fullWidth
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(var(--color-error-rgb), 0.1)',
              borderColor: 'rgba(var(--color-error-rgb), 0.3)',
              color: 'var(--inkblot-color-semantic-error-main)',
              borderWidth: 1,
            }}
          >
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
          Reset password
        </Button>
      </form>
    </div>
  );
};
