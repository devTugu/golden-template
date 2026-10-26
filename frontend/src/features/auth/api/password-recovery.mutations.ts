'use client';

import { useMutation } from '@tanstack/react-query';
import {
  bffAcceptInvite,
  bffForgotPassword,
  bffResetPassword,
} from '@/shared/lib/bff-auth';
import type {
  AcceptInviteInput,
  PasswordForgotInput,
  PasswordResetInput,
} from '@default/types/auth';

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (data: PasswordForgotInput) => bffForgotPassword(data.email),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (data: PasswordResetInput) => bffResetPassword(data),
  });

export const useAcceptInvite = () =>
  useMutation({
    mutationFn: (data: AcceptInviteInput) => bffAcceptInvite(data),
  });
