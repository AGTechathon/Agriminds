// components/ui/Toast.tsx
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Toast = {
  error: (message: string) => toast.error(message),
  success: (message: string) => toast.success(message),
};