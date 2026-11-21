import { afterEach, describe, expect, it, vi } from 'vitest';

import { createNoticeQueue, type Notice } from './notice-queue';

function setup() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
  const callbacks = new Map<
    string,
    { onClose: () => void; onRemove: () => void }
  >();
  const deliver = vi.fn<Parameters<typeof createNoticeQueue>[0]['deliver']>(
    ({ notice, onClose, onRemove }) => {
      callbacks.set(notice.title, { onClose, onRemove });
      return notice.title;
    },
  );
  const dismiss = vi.fn((id: string) => {
    const handlers = callbacks.get(id)!;
    handlers.onClose();
    handlers.onRemove();
  });
  const updateCount = vi.fn();
  return {
    queue: createNoticeQueue({ deliver, updateCount, dismiss }),
    deliver,
    dismiss,
    updateCount,
  };
}

function notice(title: string, variant: Notice['variant'] = 'success'): Notice {
  return { title, variant, description: 'Descrição original.' };
}

afterEach(() => vi.useRealTimers());

describe('notice queue', () => {
  it('promotes FIFO and gives queued notices their full timeout', async () => {
    const { queue, deliver, dismiss } = setup();
    for (const item of [
      notice('1'),
      notice('2', 'danger'),
      notice('3', 'warning'),
      notice('4'),
    ]) {
      queue.add(item, null);
    }
    expect(deliver.mock.calls.map(([item]) => item.notice.title)).toEqual([
      '1',
      '2',
      '3',
    ]);
    await vi.advanceTimersByTimeAsync(4000);
    expect(dismiss).toHaveBeenCalledExactlyOnceWith('1');
    expect(deliver.mock.calls.map(([item]) => item.notice.title)).toEqual([
      '1',
      '2',
      '3',
      '4',
    ]);
    await vi.advanceTimersByTimeAsync(3999);
    expect(dismiss).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(dismiss.mock.calls.flat()).toEqual(['1', '3', '4']);
    await vi.advanceTimersByTimeAsync(10000);
    expect(dismiss.mock.calls.flat()).not.toContain('2');
  });

  it('deduplicates visible and pending notices without restarting or replacing the first', async () => {
    const { queue, deliver, dismiss, updateCount } = setup();
    queue.add(notice('1'), null);
    queue.add(notice('2', 'danger'), null);
    queue.add(notice('3', 'danger'), null);
    queue.add(notice('4'), null);
    await vi.advanceTimersByTimeAsync(3000);
    queue.add({ ...notice('1'), description: 'Outro texto.' }, null);
    queue.add(notice('4'), null);
    expect(updateCount).toHaveBeenCalledExactlyOnceWith('1', 2);
    await vi.advanceTimersByTimeAsync(1000);
    expect(dismiss).toHaveBeenCalledExactlyOnceWith('1');
    expect(deliver.mock.calls.at(-1)?.[0]).toMatchObject({
      count: 2,
      notice: notice('4'),
    });
    expect(deliver.mock.calls[0]?.[0].notice.description).toBe(
      'Descrição original.',
    );
  });

  it('keeps timers paused until hover, focus and hidden-document pauses clear', async () => {
    const { queue, dismiss } = setup();
    queue.add(notice('1'), null);
    await vi.advanceTimersByTimeAsync(3000);
    queue.pause('hover', true);
    queue.pause('focus', true);
    queue.pause('visibility', true);
    queue.add(notice('2'), null);
    queue.pause('focus', false);
    queue.pause('hover', false);
    await vi.advanceTimersByTimeAsync(10000);
    expect(dismiss).not.toHaveBeenCalled();
    queue.pause('visibility', false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(dismiss).toHaveBeenCalledExactlyOnceWith('1');
    queue.clear();
    await vi.advanceTimersByTimeAsync(10000);
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
