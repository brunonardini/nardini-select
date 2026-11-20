'use client';

type Props = { value: string | null };

/** Renders an instant in the browser timezone. The server value may differ. */
export function LocalDateTime({ value }: Props) {
  if (!value) return <>—</>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <>—</>;
  const text = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
  return (
    <time dateTime={value} suppressHydrationWarning>
      {text}
    </time>
  );
}
