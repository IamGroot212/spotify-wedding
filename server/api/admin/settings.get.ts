export default defineEventHandler(async () => {
  const settings = await db.query.appSettings.findFirst();
  return { settings };
});
