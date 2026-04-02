# TODO — Spotify Wedding

## Kritisch (vor Hochzeit)

- [x] Production-DB: separate SQLite-Datei für Produktion (`production.sqlite`)
- [x] Admin-Passwort: sicheres Passwort gesetzt
- [ ] Spotify Redirect URI: nur `https://camavor.de/...` in Spotify Dashboard, Dev-URIs entfernen
- [x] GitHub Actions CI/CD: Pi als Self-Hosted Runner, Auto-Deploy auf Push to main
- [x] Tests: API-Tests (Vitest) für alle Server-Endpunkte (21 Tests)
- [ ] Tests: E2E-Tests (Playwright) — Guest-Flow + Admin-Flow
- [ ] SSR-Fix prüfen: aktuell SPA-Mode wegen Node 22 Vue-Bug — ggf. mit Node 20 testen
- [ ] Rate-Limiting auf Session-ID umstellen (statt IP — alle Gäste im selben WLAN haben gleiche IP)
- [ ] Gast-Name per Session-Cookie speichern (einmal eingeben, danach automatisch)
- [ ] "Song bereits gespielt"-Sperre: ganzen Abend keine Duplikate (im Admin deaktivierbar)
- [ ] Spotify Token-Refresh Langzeittest (4+ Stunden durchspielen, Token läuft nach 1h ab)

## Architektur-Entscheidungen offen

### Queue-Scheduler (Diskussion nötig vor Umsetzung)
Songs sollen nicht alle sofort in die Spotify-Queue, sondern getaktet eingefügt werden.
Mögliche Ansätze:
- **A) Einzeln getaktet**: Server-Worker prüft Playback-Status, fügt nächsten approved Song erst ein wenn Queue leer wird. So spielt zwischen Requests immer mindestens ein Playlist-Track.
- **B) Ratio-basiert**: Konfigurierbar z.B. "nach jedem Request 2 Playlist-Songs abwarten". Worker zählt gespielte Playlist-Tracks.
- **C) Playlist-Takeover**: Eigene Playlist statt Queue nutzen, volle Kontrolle über Reihenfolge. Deutlich komplexer.

Anforderungen:
- [ ] Im Admin-UI aktivierbar/deaktivierbar (Toggle)
- [ ] Wenn deaktiviert: Songs werden sofort zur Queue hinzugefügt (aktuelles Verhalten)
- [ ] Wenn aktiviert: Scheduler managed das Timing
- [ ] Konfigurierbare Ratio (wie viele Playlist-Songs zwischen Requests)

## Bekannte Probleme / Risiken

### 1. In-Memory Session Store
Admin-Sessions (Login-Tokens) werden im RAM gespeichert, nicht in der DB. Wenn der
Node-Prozess neustartet (z.B. durch `systemctl restart` beim Deploy via Pipeline),
gehen alle aktiven Sessions verloren → Admin muss sich neu einloggen.
**Kein Datenverlust** (DB bleibt), nur der Login-Cookie wird ungültig.
**Fix**: Sessions in SQLite speichern statt im RAM. Dann überlebt ein Restart.

### 2. Spotify Token-Refresh
Spotify Access-Tokens laufen nach **1 Stunde** ab. Der Code macht automatischen Refresh
mit dem Refresh-Token (1 Minute vor Ablauf). Das funktioniert im Normalfall, aber:
- Wenn der Pi genau während des Refresh offline ist → Token abgelaufen, kein Refresh möglich
- Wenn Spotify den Refresh-Token widerruft (selten, aber möglich) → manuelles Reconnect nötig
- **Risiko beim Event**: 4-6 Stunden Laufzeit = 4-6 Token-Refreshes. Jeder einzelne muss klappen.
- **Empfehlung**: Vor dem Event 2-3 Stunden laufen lassen und Logs prüfen ob Refresh sauber durchgeht.

### 3. Bereits gespielte Songs
Aktuell: Duplikat-Check nur innerhalb `duplicateWindowMinutes` (default 60 Min).
Danach kann derselbe Song erneut angefragt werden.
**Lösung**: Zusätzlicher Toggle "Keine Wiederholungen am ganzen Abend" — prüft gegen alle
Songs mit Status `queued` oder `played`, nicht nur innerhalb Zeitfenster.
Im Admin deaktivierbar für den Fall dass ein Song bewusst nochmal gespielt werden soll.

### 4. Rate-Limiting per IP vs. Session
Aktuell: Rate-Limit per IP-Adresse (5 Requests/Minute).
**Problem**: Im Hochzeits-WLAN haben alle Gäste dieselbe öffentliche IP → ein Gast der
schnell tippt blockiert alle anderen.
**Fix**: Rate-Limit auf `guestSessionId` (localStorage UUID) umstellen.
Zusätzlich: eingegebener Gast-Name per localStorage speichern, damit er nicht jedes Mal
neu eingegeben werden muss.

## Funktional

- [x] QR-Code Seite: `/qr` Route mit druckbarem QR-Code zu camavor.de
- [x] Splash/Welcome Screen: "The Midnight Concierge" Landing
- [x] Gast-Queue-Status: Gäste sehen Vorschlag-Status via Session-ID
- [x] Admin: Live-Counter (Gesamt / Ausstehend / In Queue / Abgelehnt)
- [x] Admin: Stats Reset Endpoint (`POST /api/admin/reset-stats`)
- [ ] Admin: Bulk Actions (mehrere Requests auf einmal annehmen/ablehnen)
- [ ] Admin: Blocklist (Songs/Artisten sperren)
- [x] Offline-Fallback: Connection Banner + Fehler-States
- [ ] Admin: Queue-Ansicht (Stitch-Prototyp: Now Playing Hero + Queue-Liste + Skip/Pause)
- [ ] Admin: Settings-Seite (Duplicate Window, Cooldown, Approval-Modus, Scheduler-Toggle)
- [ ] Admin: Desktop Sidebar-Navigation (Requests / Queue / Settings / Spotify Status)

## UX / Design

- [x] UI mit Stitch-Prototyp abgleichen und aktualisieren (alle Screens)
- [ ] Stitch-Funktionalitäten aus Prototyp übernehmen (Queue-View, Settings, Error-States)
- [ ] Toast/Feedback nach Songvorschlag verbessern (Animation)
- [x] Dark Mode fest erzwingen (immer Midnight Concierge)
- [x] Admin-UI an Midnight Concierge Design anpassen

## Nice to Have

- [ ] Admin: Song-Statistiken (meistgewünscht, aktivste Gäste)
- [ ] Konfetti-Animation wenn Song zur Queue hinzugefügt wird
- [ ] Playlist-Sortierung nach Audio Features (BPM, Energy) — separate Session

## Ops / Deployment

- [x] GitHub Actions Runner auf Pi einrichten
- [x] Deploy-Workflow: pnpm install → build → systemctl restart
- [ ] .env.production pflegen (getrennt von .env für Dev)
- [ ] Monitoring: systemd Journal + einfacher Health-Check
- [ ] Backup-Strategie für SQLite-DB (vor dem Event)
- [ ] Admin-Sessions in SQLite statt RAM (überlebt Restarts)
