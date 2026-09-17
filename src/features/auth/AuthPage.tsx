import React from 'react';
import { AuthForm } from './AuthForm';

export const LoginPage: React.FC = () => <AuthForm mode="login" />;
export const RegisterPage: React.FC = () => <AuthForm mode="register" />;