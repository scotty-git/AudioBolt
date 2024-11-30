import { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AuthErrorDisplay } from './AuthErrorDisplay';

export interface EmailPasswordFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string;
  submitLabel?: string;
  showPasswordConfirm?: boolean;
}

export const EmailPasswordForm = ({
  onSubmit,
  isLoading = false,
  errorMessage,
  submitLabel = 'Submit',
  showPasswordConfirm = false,
}: EmailPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate email
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    // Validate password confirmation if required
    if (showPasswordConfirm && password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (error) {
      // Error will be handled by parent component through errorMessage prop
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(errorMessage || validationError) && (
        <AuthErrorDisplay errorMessage={errorMessage || validationError} />
      )}

      <Input
        id="email"
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Input
        id="password"
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={showPasswordConfirm ? 'new-password' : 'current-password'}
        helperText="Must be at least 6 characters"
      />

      {showPasswordConfirm && (
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        loading={isLoading}
      >
        {submitLabel}
      </Button>
    </form>
  );
};
