export default defineEventHandler(async (event) => {
  if (!isAdminAuthenticated(event)) {
    throw createError({ message: 'Nicht autorisiert', statusCode: 401 });
  }

  await db.delete(schema.songRequests);

  return { message: 'Alle Songvorschläge wurden zurückgesetzt.', ok: true };
});
