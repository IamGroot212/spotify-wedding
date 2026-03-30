import { eq } from 'drizzle-orm';
import { z } from 'zod';

const querySchema = z.object({
  code: z.string().min(1),
  error: z.string().optional(),
  state: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse);

  if (query.error) {
    return sendRedirect(event, '/admin?error=spotify_denied');
  }

  // Verify state
  const storedState = getCookie(event, 'spotify_oauth_state');
  if (!storedState || storedState !== query.state) {
    return sendRedirect(event, '/admin?error=invalid_state');
  }

  deleteCookie(event, 'spotify_oauth_state', { path: '/' });

  try {
    const tokens = await exchangeCode(query.code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Upsert tokens (always id=1, single-user system)
    const existing = await db.query.spotifyTokens.findFirst();
    if (existing) {
      await db.update(schema.spotifyTokens)
        .set({
          accessToken: tokens.access_token,
          expiresAt,
          refreshToken: tokens.refresh_token,
          updatedAt: new Date(),
        })
        .where(eq(schema.spotifyTokens.id, 1));
    }
    else {
      await db.insert(schema.spotifyTokens).values({
        accessToken: tokens.access_token,
        expiresAt,
        id: 1,
        refreshToken: tokens.refresh_token,
      });
    }

    return sendRedirect(event, '/admin?spotify=connected');
  }
  catch (error) {
    console.error('Spotify OAuth error:', error);
    return sendRedirect(event, '/admin?error=spotify_auth_failed');
  }
});
