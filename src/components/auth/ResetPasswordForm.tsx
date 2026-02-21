import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import authFormStyles from './AuthForm.module.scss';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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

  const hasError = !!error || !!errors.password?.message || !!errors.confirmPassword?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        className={`${authFormStyles.inputGroup} ${isFocused ? authFormStyles.focused : ''} ${hasError ? authFormStyles.error : ''}`}
      >
        <div className={authFormStyles.inputRow}>
          <input
            type={showPassword ? 'text' : 'password'}
            className={authFormStyles.input}
            placeholder="new password"
            {...register('password')}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <button
            type="button"
            className={authFormStyles.passwordPeek}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className={authFormStyles.inputRow}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className={authFormStyles.input}
            placeholder="confirm password"
            {...register('confirmPassword')}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <button
            type="button"
            className={authFormStyles.passwordPeek}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className={authFormStyles.submitRow}>
          <button
            type="submit"
            className={authFormStyles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={authFormStyles.spinner} />
            ) : (
              'Reset password'
            )}
          </button>
        </div>
      </div>

      {(errors.password?.message || errors.confirmPassword?.message || error) && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(var(--color-error-rgb), 0.1)',
            border: '1px solid rgba(var(--color-error-rgb), 0.3)',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {errors.password?.message || errors.confirmPassword?.message || error}
        </div>
      )}
    </form>
  );
};
