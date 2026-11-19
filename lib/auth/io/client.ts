import { createAuthClient } from 'better-auth/client';

/** Browser client. Social sign-in and get-session are the only calls we make. */
export const authClient = createAuthClient();
