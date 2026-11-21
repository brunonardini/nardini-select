'use client';

import { Toast } from '@base-ui/react/toast';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import { Icon } from '../icon/icon';
import { createNoticeQueue, type Notice } from './notice-queue';

type NoticeContext = {
  add: (notice: Notice, origin?: HTMLElement) => void;
  host: (element: HTMLDivElement | null) => void;
};

const NoticeContext = createContext<NoticeContext | null>(null);
const icons = {
  success: 'check',
  warning: 'warning',
  danger: 'error',
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider timeout={0}>
      <NoticeProvider>{children}</NoticeProvider>
    </Toast.Provider>
  );
}

function NoticeProvider({ children }: { children: ReactNode }) {
  const manager = Toast.useToastManager<{
    count: number;
    variant: Notice['variant'];
    element: RefObject<HTMLDivElement | null>;
  }>();
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const host = useRef<HTMLDivElement | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const queueRef = useRef<ReturnType<typeof createNoticeQueue> | null>(null);
  const { add: addToast, close: closeToast, update: updateToast } = manager;

  useLayoutEffect(() => {
    const queue = createNoticeQueue({
      deliver({ notice, origin, count, onClose, onRemove }) {
        const element = { current: null as HTMLDivElement | null };
        return addToast({
          title: notice.title,
          description: notice.description,
          data: { count, variant: notice.variant, element },
          onClose() {
            onClose();
            if (!element.current?.contains(document.activeElement)) return;
            queueMicrotask(() => {
              const boundary = host.current?.closest('[role="dialog"]');
              if (
                origin?.isConnected &&
                (!boundary || boundary.contains(origin))
              ) {
                origin.focus();
              } else if (boundary) {
                boundary
                  .querySelector<HTMLElement>('button:enabled, input:enabled')
                  ?.focus();
              } else if (opener.current?.isConnected) {
                opener.current.focus();
              }
            });
          },
          onRemove,
        });
      },
      updateCount(id, count) {
        updateToast(id, (toast) => ({ data: { ...toast.data!, count } }));
      },
      dismiss: closeToast,
    });
    queueRef.current = queue;
    const syncVisibility = () => queue.pause('visibility', document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      queue.clear();
      queueRef.current = null;
    };
  }, [addToast, closeToast, updateToast]);

  const mountPortal = useCallback((anchor: HTMLSpanElement | null) => {
    if (!anchor) return;
    const container = anchor.ownerDocument.createElement('div');
    portalRef.current = container;
    (host.current ?? anchor.ownerDocument.body).append(container);
    setPortal(container);
    return () => {
      container.remove();
      portalRef.current = null;
    };
  }, []);

  const attachHost = useCallback((element: HTMLDivElement | null) => {
    if (element && !host.current) {
      const active = document.activeElement;
      if (active instanceof HTMLElement) opener.current = active;
    }
    host.current = element;
    if (!portalRef.current) return;
    (element ?? document.body).append(portalRef.current);
    queueRef.current?.pause(
      'hover',
      viewport.current?.matches(':hover') ?? false,
    );
    queueRef.current?.pause(
      'focus',
      viewport.current?.contains(document.activeElement) ?? false,
    );
  }, []);
  const add = useCallback<NoticeContext['add']>((notice, origin) => {
    const active = document.activeElement;
    queueRef.current?.add(
      notice,
      origin ?? (active instanceof HTMLElement ? active : null),
    );
  }, []);
  const toasts = [...manager.toasts].reverse();

  return (
    <NoticeContext.Provider value={{ add, host: attachHost }}>
      <span hidden ref={mountPortal} />
      {children}
      {portal ? (
        <Toast.Portal container={portal}>
          <Toast.Viewport
            ref={viewport}
            className="toast-viewport"
            aria-label="Notificações"
            aria-live="off"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse')
                queueRef.current?.pause('hover', true);
            }}
            onPointerLeave={() => queueRef.current?.pause('hover', false)}
            onFocus={() => queueRef.current?.pause('focus', true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                queueRef.current?.pause('focus', false);
            }}
          >
            {toasts.map((toast) => {
              const { variant, count, element } = toast.data!;
              return (
                <Toast.Root
                  key={toast.id}
                  ref={element}
                  toast={toast}
                  className="toast"
                  data-variant={variant}
                  swipeDirection={[]}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') event.stopPropagation();
                  }}
                >
                  <Toast.Content className="toast-content">
                    <span className="toast-icon">
                      <Icon name={icons[variant]} />
                    </span>
                    <div className="toast-message">
                      <div className="toast-heading">
                        <Toast.Title className="toast-title" />
                        {count > 1 ? (
                          <span className="toast-count">
                            <span aria-hidden="true">×{count}</span>
                            <span className="sr-only">
                              Repetido {count} vezes
                            </span>
                          </span>
                        ) : null}
                      </div>
                      <Toast.Description className="toast-description" />
                    </div>
                    <Toast.Close
                      className="toast-close"
                      aria-hidden={false}
                      aria-label={`Fechar: ${toast.title}`}
                    >
                      <Icon name="close" />
                    </Toast.Close>
                  </Toast.Content>
                </Toast.Root>
              );
            })}
          </Toast.Viewport>
          {(['polite', 'assertive'] as const).map((priority) => (
            <div
              key={priority}
              className="sr-only"
              aria-live={priority}
              aria-relevant="additions"
            >
              {toasts
                .filter(
                  (toast) =>
                    toast.transitionStatus !== 'ending' &&
                    (toast.data?.variant === 'danger') ===
                      (priority === 'assertive'),
                )
                .map((toast) => (
                  <div key={toast.id}>
                    {toast.title}. {toast.description}
                  </div>
                ))}
            </div>
          ))}
        </Toast.Portal>
      ) : null}
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) throw new Error('useNotice requires ToastProvider');
  return context.add;
}

/** Keeps the same viewport within the focus boundary of an invitation dialog. */
export function ToastHost() {
  const context = useContext(NoticeContext);
  return <div className="toast-host" ref={context?.host} />;
}
