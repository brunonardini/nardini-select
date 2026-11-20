import { allowsMutationOrigin } from '@/lib/auth/logic/access';
import { socialSignInLocation } from '@/lib/auth/logic/sign-in';
import {
  inviteCookieHeader,
  sealInviteCookie,
} from '@/lib/auth/io/invitation-cookie';
import { getAuth } from '@/lib/auth/io/server';
import { isInvitationToken } from '@/lib/auth/logic/invitation-token';
import { findInvitationByToken } from '@/lib/invitations/io/invitations';
import { invitationPageError } from '@/lib/invitations/logic/rules';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '@/lib/legal/versions';

function back(request: Request, token: string, code: string): Response {
  const url = new URL(request.url);
  url.pathname = `/admin/convite/${encodeURIComponent(token)}`;
  url.search = `?erro=${code}`;
  return Response.redirect(url);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await context.params;
  const siteUrl = process.env.BETTER_AUTH_URL ?? '';
  if (
    !allowsMutationOrigin({
      method: request.method,
      secFetchSite: request.headers.get('sec-fetch-site'),
      origin: request.headers.get('origin'),
      siteUrl,
    })
  ) {
    return Response.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (!isInvitationToken(token))
    return back(request, token, 'convite_invalido');

  const invitation = await findInvitationByToken(token);
  const statusError = invitation
    ? invitationPageError(invitation.validity)
    : 'convite_invalido';
  if (statusError) return back(request, token, statusError);

  const form = await request.formData();
  if (form.get('aceite') !== 'on') {
    return back(request, token, 'termos_obrigatorios');
  }

  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error('BETTER_AUTH_SECRET is not set.');

  const auth = await getAuth();
  const started = await auth.api.signInSocial({
    body: {
      provider: 'google',
      callbackURL: '/admin',
      errorCallbackURL: '/admin/entrar',
    },
    headers: request.headers,
    asResponse: true,
  });
  const location = socialSignInLocation(started.headers.get('location'));
  if (!location) return back(request, token, 'erro');

  const headers = new Headers();
  headers.set('location', location);
  for (const cookie of started.headers.getSetCookie()) {
    headers.append('set-cookie', cookie);
  }
  headers.append(
    'set-cookie',
    inviteCookieHeader(
      sealInviteCookie(
        {
          token,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_NOTICE_VERSION,
        },
        secret,
      ),
    ),
  );
  return new Response(null, { status: 303, headers });
}
