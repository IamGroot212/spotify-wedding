# Spotify Wedding

Private Hochzeits-Songwunsch-App. Gäste scannen einen QR-Code, suchen Songs und reichen Vorschläge ein. Der Admin moderiert die Vorschläge und kontrolliert die Spotify-Warteschlange.

## Setup

### 1. Spotify App erstellen

1. Gehe zu [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Erstelle eine neue App
3. Setze die Redirect URI auf: `http://localhost:3000/api/auth/spotify/callback` (oder deine Produktions-URL)
4. Notiere Client ID und Client Secret
5. Benötigte Scopes: `user-read-currently-playing`, `user-read-playback-state`, `user-modify-playback-state`

### 2. Umgebungsvariablen

```bash
cp .env.example .env
```

Bearbeite `.env`:

```env
NUXT_SPOTIFY_CLIENT_ID=deine-client-id
NUXT_SPOTIFY_CLIENT_SECRET=dein-client-secret
NUXT_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
NUXT_ADMIN_PASSWORD=dein-admin-passwort
NUXT_DATABASE_PATH=.data/db.sqlite
NUXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Abhängigkeiten installieren

```bash
pnpm install
```

### 4. Entwicklungsserver starten

```bash
pnpm dev
```

### 5. Spotify verbinden

1. Öffne `http://localhost:3000/admin/login`
2. Logge dich mit dem Admin-Passwort ein
3. Klicke "Mit Spotify verbinden"
4. Autorisiere die App in Spotify

## Nutzung

- **Gäste**: Öffnen die Startseite (QR-Code), suchen Songs, reichen Vorschläge ein
- **Admin**: `/admin` — Vorschläge annehmen/ablehnen, zur Queue hinzufügen, Spotify-Status überwachen

## Produktion

### Build

```bash
pnpm build
```

### Starten

```bash
node .output/server/index.mjs
```

### Raspberry Pi Deployment

```bash
# Build auf dem Pi oder übertrage den .output-Ordner
pnpm build

# Starten mit Umgebungsvariablen
NUXT_ADMIN_PASSWORD=geheim \
NUXT_SPOTIFY_CLIENT_ID=xxx \
NUXT_SPOTIFY_CLIENT_SECRET=xxx \
NUXT_SPOTIFY_REDIRECT_URI=http://pi-ip:3000/api/auth/spotify/callback \
NUXT_PUBLIC_BASE_URL=http://pi-ip:3000 \
node .output/server/index.mjs
```

### Nginx Reverse Proxy (optional)

```nginx
server {
    listen 80;
    server_name hochzeit.local;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Architektur

```
app/
  pages/index.vue              # Gast-Seite (Suche + Now Playing + Queue)
  pages/admin/index.vue        # Admin-Dashboard
  pages/admin/login.vue        # Admin-Login
  components/guest/            # NowPlaying, QueueList, SongSearch
  components/admin/            # RequestList, SpotifyStatus
  composables/                 # Business-Logik (Suche, Requests, Auth, Polling)
  middleware/admin.ts           # Client-Side Route Guard

server/
  api/spotify/                 # Spotify-API-Proxy (search, now-playing, queue, devices)
  api/requests/                # Songvorschläge CRUD
  api/admin/                   # Admin-Endpunkte (login, settings, queue)
  api/auth/spotify/            # OAuth-Flow (connect, callback, status)
  db/schema.ts                 # Drizzle-Schema (SQLite)
  utils/db.ts                  # Datenbankverbindung
  utils/spotify.ts             # Spotify-API-Client mit Token-Refresh
  utils/auth.ts                # Admin-Session-Management
  middleware/                  # Rate-Limiting, Admin-Auth
  plugins/migrations.ts        # Auto-Migration beim Start
```

## Technologie

- **Nuxt 4** + **Nuxt UI v4** (Tailwind CSS v4)
- **Drizzle ORM** + **SQLite** (better-sqlite3, WAL-Modus)
- **Spotify Web API** (Authorization Code Flow)
- Node.js 20+, pnpm
