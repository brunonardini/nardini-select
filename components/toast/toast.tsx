'use client';

import { Toast } from '@base-ui/react/toast';
import type { ReactNode } from 'react';

/** Notices for the admin area. Copy confirmation uses this, not an alert. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider timeout={4000}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="toast-viewport">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className="toast">
      <Toast.Content className="toast-content">
        <div>
          <Toast.Title className="toast-title" />
          <Toast.Description className="toast-description" />
        </div>
        <Toast.Close className="button button-secondary" type="button">
          Fechar
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

export function useNotice() {
  const manager = Toast.useToastManager();
  return (title: string, description: string) => {
    manager.add({ title, description });
  };
}
