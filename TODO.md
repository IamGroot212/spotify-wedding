# TODO — Spotify Wedding

## Kritisch (vor Hochzeit)

- [x] Production-DB: separate SQLite-Datei für Produktion (`production.sqlite`)
- [x] Admin-Passwort: sicheres Passwort gesetzt
- [ ] Spotify Redirect URI: nur `https://camavor.de/...` in Spotify Dashboard, Dev-URIs entfernen
- [x] GitHub Actions CI/CD: Pi als Self-Hosted Runner, Auto-Deploy auf Push to main
- [x] Tests: API-Tests (Vitest) für alle Server-Endpunkte (21 Tests)
- [ ] Tests: E2E-Tests (Playwright) — Guest-Flow + Admin-Flow
- [ ] SSR-Fix prüfen: aktuell SPA-Mode wegen Node 22 Vue-Bug — ggf. mit Node 20 testen

## Funktional

- [x] QR-Code Seite: `/qr` Route mit druckbarem QR-Code zu camavor.de
- [x] Splash/Welcome Screen: "The Midnight Concierge" Landing
- [ ] Gast-Queue-Status: Gäste sehen ob ihr Vorschlag angenommen/abgelehnt wurde (via Session-ID)
- [ ] Admin: Live-Counter (eingegangen / genehmigt / abgelehnt / in Queue)
- [ ] Admin: Bulk Actions (mehrere Requests auf einmal annehmen/ablehnen)
- [ ] Admin: Blocklist (Songs/Artisten sperren)
- [ ] Offline-Fallback: "Bitte Geduld"-Screen wenn Spotify nicht erreichbar

## UX / Design

- [ ] UI mit Stitch-Prototyp abgleichen und aktualisieren (alle Screens)
- [ ] Stitch-Funktionalitäten aus Prototyp übernehmen
- [ ] Toast/Feedback nach Songvorschlag verbessern (Animation)
- [ ] Dark Mode fest erzwingen (kein Toggle, immer Midnight Concierge)
- [ ] Admin-UI an Midnight Concierge Design anpassen

## Nice to Have

- [ ] PWA: "Add to Homescreen" für Gäste
- [ ] Admin: Song-Statistiken (meistgewünscht, aktivste Gäste)
- [ ] Konfetti-Animation wenn Song zur Queue hinzugefügt wird
- [ ] Rate-Limiting verfeinern (pro Session statt nur pro IP)

## Ops / Deployment

- [x] GitHub Actions Runner auf Pi einrichten
- [x] Deploy-Workflow: pnpm install → build → systemctl restart
- [ ] .env.production pflegen (getrennt von .env für Dev)
- [ ] Monitoring: systemd Journal + einfacher Health-Check
- [ ] Backup-Strategie für SQLite-DB (vor dem Event)
