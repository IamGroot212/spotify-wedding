export default defineEventHandler(async () => {
  const data = await getDevices();
  return {
    devices: data.devices.map(d => ({
      id: d.id,
      isActive: d.is_active,
      name: d.name,
      type: d.type,
      volumePercent: d.volume_percent,
    })),
  };
});
