import React from 'react';
import { LoginExperience } from '@/components/login/LoginExperience';

// The unified email-first flow detects new vs existing accounts, so signup
// enters through the same email step and branches to account creation.
export const SignupPage: React.FC = () => <LoginExperience start="email" />;
