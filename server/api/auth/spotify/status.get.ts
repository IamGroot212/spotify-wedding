export default defineEventHandler(async () => {
  const tokenRow = await db.query.spotifyTokens.findFirst();

  if (!tokenRow) {
    return { connected: false };
  }

  const expired = tokenRow.expiresAt.getTime() < Date.now();

  return {
    connected: true,
    expired,
    expiresAt: tokenRow.expiresAt.toISOString(),
  };
});
