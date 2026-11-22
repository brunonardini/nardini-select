const limit = 3;
const duration = { success: 4000, warning: 8000, danger: 0 };

export type Notice = {
  variant: keyof typeof duration;
  title: string;
  description: string;
};

type Entry = {
  notice: Notice;
  origin: HTMLElement | null;
  count: number;
  remaining: number;
  id?: string;
  closing?: boolean;
  deadline?: number;
  timer?: ReturnType<typeof setTimeout>;
};

type Delivery = {
  notice: Notice;
  origin: HTMLElement | null;
  count: number;
  onClose: () => void;
  onRemove: () => void;
};

export function createNoticeQueue({
  deliver,
  updateCount,
  dismiss,
}: {
  deliver: (delivery: Delivery) => string;
  updateCount: (id: string, count: number) => void;
  dismiss: (id: string) => void;
}) {
  const active = new Set<Entry>();
  const pending: Entry[] = [];
  const pauses = new Set<'hover' | 'focus' | 'visibility'>();

  function stop(entry: Entry) {
    if (entry.timer === undefined) return;
    clearTimeout(entry.timer);
    entry.timer = undefined;
    entry.remaining = Math.max(0, entry.deadline! - performance.now());
  }

  function start(entry: Entry) {
    if (
      pauses.size ||
      entry.closing ||
      entry.timer !== undefined ||
      entry.notice.variant === 'danger'
    ) {
      return;
    }
    entry.deadline = performance.now() + entry.remaining;
    entry.timer = setTimeout(() => dismiss(entry.id!), entry.remaining);
  }

  function promote() {
    while (active.size < limit && pending.length > 0) {
      const entry = pending.shift()!;
      active.add(entry);
      entry.id = deliver({
        notice: entry.notice,
        origin: entry.origin,
        count: entry.count,
        onClose() {
          entry.closing = true;
          stop(entry);
        },
        onRemove() {
          // Base UI invokes onRemove before updating its list.
          queueMicrotask(() => {
            if (active.delete(entry)) promote();
          });
        },
      });
      start(entry);
    }
  }

  return {
    add(notice: Notice, origin: HTMLElement | null) {
      const matches = (entry: Entry) =>
        !entry.closing &&
        entry.notice.variant === notice.variant &&
        entry.notice.title === notice.title;
      const duplicate = [...active].find(matches) ?? pending.find(matches);
      if (duplicate) {
        duplicate.count += 1;
        if (duplicate.id !== undefined) {
          updateCount(duplicate.id, duplicate.count);
        }
        return;
      }
      pending.push({
        notice,
        origin,
        count: 1,
        remaining: duration[notice.variant],
      });
      promote();
    },
    pause(reason: 'hover' | 'focus' | 'visibility', paused: boolean) {
      if (paused) {
        pauses.add(reason);
        active.forEach(stop);
      } else {
        pauses.delete(reason);
        if (pauses.size === 0) active.forEach(start);
      }
    },
    clear() {
      active.forEach(stop);
      active.clear();
      pending.length = 0;
      pauses.clear();
    },
  };
}
