export function GET() {
  const number = process.env.WHATSAPP_NUMBER || '';
  const destination = new URL(`https://wa.me/${number}`);
  destination.searchParams.set(
    'text',
    'Olá! Conheci a Nardini Select pelo site e gostaria de saber mais sobre a seleção de vocês.',
  );
  return Response.redirect(destination, 307);
}
