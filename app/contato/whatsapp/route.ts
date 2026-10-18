export function GET() {
  const destination = new URL('https://wa.me/5524992528791');
  destination.searchParams.set(
    'text',
    'Olá! Conheci a Nardini Select pelo site e gostaria de saber mais sobre a seleção de vocês.',
  );
  return Response.redirect(destination, 307);
}
