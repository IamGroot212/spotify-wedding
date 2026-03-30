import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(20).optional().default(10),
  q: z.string().min(1).max(200),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse);
  const result = await searchTracks(query.q, query.limit);

  return result.tracks.items.map(track => ({
    album: track.album.name,
    artist: track.artists.map(a => a.name).join(', '),
    coverUrl: track.album.images[0]?.url || null,
    durationMs: track.duration_ms,
    explicit: track.explicit,
    id: track.id,
    title: track.name,
    uri: track.uri,
  }));
});
