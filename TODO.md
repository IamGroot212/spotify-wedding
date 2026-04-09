# TODO — Spotify Wedding

## Erledigt

- [x] Production-DB + sicheres Admin-Passwort
- [x] GitHub Actions CI/CD + Self-Hosted Runner
- [x] API-Tests (Vitest, 21 Tests)
- [x] SSR aktiviert (vite.ssr.noExternal fix)
- [x] Rate-Limiting auf Session-ID
- [x] Gast-Name per localStorage gespeichert
- [x] "Keine Wiederholungen" Sperre (Admin-Toggle)
- [x] Admin-Sessions in SQLite (überlebt Restarts)
- [x] Admin Logout-Button + secure Cookie
- [x] QR-Code Seite + Splash Screen
- [x] Gast-Queue-Status (Vorschlag-Tracking)
- [x] Admin: Live-Counter + Stats Reset
- [x] Offline-Fallback: Connection Banner
- [x] Admin: Settings-Seite mit Toggles/Slidern
- [x] Admin: Spotify Reconnect Dropdown
- [x] Favicon (Gold-Musiknote SVG)
- [x] Stitch "Midnight Concierge" Design (Guest + Admin)
- [x] Input-Reihenfolge: Name zuerst, dann Songsuche

## Offen — Funktional

- [ ] Admin: Bulk Actions (mehrere Requests auf einmal annehmen/ablehnen)
- [ ] DB-Backup Strategie (Skript vor dem Event)
- [ ] Admin: Queue-Ansicht (Now Playing + Queue-Liste + Skip/Pause Controls)
- [ ] Admin: Blocklist (Songs/Artisten sperren)
- [ ] Toast/Feedback nach Songvorschlag verbessern

## Offen — Architektur (Diskussion nötig)

- [ ] Queue-Scheduler: getaktetes Einfügen statt sofort (deaktivierbar)
- [ ] Pi System-Monitor (eigene App unter monitor.camavor.de)

## Offen — Ops

- [ ] Spotify Redirect URI aufräumen (Dev-URIs entfernen)
- [ ] Spotify Token-Refresh Langzeittest (4+ Stunden)
- [ ] E2E-Tests (Playwright)

## Nice to Have

- [ ] Admin: Song-Statistiken (meistgewünscht, aktivste Gäste)
- [ ] Konfetti-Animation wenn Song zur Queue hinzugefügt wird
- [ ] Playlist-Sortierung nach Audio Features — separate Session
