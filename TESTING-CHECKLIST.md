# Testing-Checklist — Neue Features (Stand 2026-04-10)

## WICHTIG: Pi-Konfiguration (nicht über Git änderbar)

Diese Dinge laufen direkt auf dem Pi und können nur mit SSH/Direktzugriff geändert werden:

- **systemd Service**: `/etc/systemd/system/spotify-wedding.service` (Port 3002, Node 22)
- **Cloudflare Tunnel**: `/etc/cloudflared/config.yml` + `~/.cloudflared/config.yml`
- **.env Datei**: `/home/febec/Programming/claude/spotify-wedding/.env` (Secrets, nicht in Git)
- **SQLite DB**: `.data/production.sqlite` (Produktionsdaten)
- **GitHub Runner**: `/home/febec/Programming/pi-server/github-runner/`

## Ungetestete Features (heute gebaut)

### 1. Admin Session (SSR Cookie Fix) — KRITISCH

**Was**: Browser-Cookies werden jetzt bei SSR an den Server weitergeleitet
**Risiko**: Wenn das nicht funktioniert, muss man sich bei jeder Navigation neu einloggen
**Test**:

- [ ] Login unter `https://camavor.de/admin/login`
- [ ] Zwischen Dashboard / Queue / Settings / Monitor navigieren ohne Logout
- [ ] Browser-Tab schließen, erneut `https://camavor.de/admin` öffnen → noch eingeloggt?
- [ ] Nach 12+ Stunden: Session sollte ablaufen

### 2. Queue-Scheduler — WICHTIG

**Was**: Background-Worker fügt approved Songs getaktet zur Spotify-Queue hinzu
**Risiko**: Worker könnte stillschweigend fehlschlagen, Songs bleiben im "approved" Status
**Test**:

- [ ] Settings → "Queue-Scheduler" aktivieren
- [ ] Song als Gast vorschlagen
- [ ] Im Admin: "Annehmen" drücken → Status sollte "approved" werden (NICHT "queued")
- [ ] Warten bis Spotify-Queue fast leer ist → Song sollte automatisch eingefügt werden
- [ ] Logs prüfen: `sudo journalctl -u spotify-wedding | grep queue-scheduler`
- [ ] Scheduler deaktivieren → "Annehmen" sollte wieder direkt zur Queue hinzufügen

### 3. Admin Bulk Actions — WICHTIG

**Was**: Mehrere pending Requests gleichzeitig annehmen/ablehnen
**Test**:

- [ ] Mehrere Songs vorschlagen (verschiedene Geräte/Browser)
- [ ] Im Admin: Checkboxen bei pending Requests anklicken
- [ ] "Alle auswählen" testen
- [ ] "Alle annehmen" → alle ausgewählten Songs zur Queue
- [ ] "Alle ablehnen" → alle ausgewählten Songs rejected

### 4. Blocklist — WICHTIG

**Was**: Songs/Artisten können gesperrt werden
**Test**:

- [ ] Settings → Blocklist → Interpret-Name eingeben → "Sperren"
- [ ] Als Gast: Song von diesem Interpreten suchen und vorschlagen → sollte Fehler 403 zeigen
- [ ] In Blocklist: Eintrag wieder entfernen (X-Button)
- [ ] Erneut vorschlagen → sollte jetzt funktionieren
- [ ] Track-ID Blocklist testen (Spotify Track-ID eingeben)

### 5. Pi System-Monitor — NICE TO HAVE

**Was**: CPU, Temperatur, RAM, Disk Monitoring
**Test**:

- [ ] `https://camavor.de/admin/monitor` öffnen
- [ ] Werte sollten alle 5s aktualisieren
- [ ] Temperatur sollte realistisch sein (40-60°C normal)
- [ ] RAM/Disk Balken sollten farbcodiert sein

### 6. Admin Navigation — NICE TO HAVE

**Was**: Tabs im Header: Requests, Queue, Settings, Monitor
**Test**:

- [ ] Alle 4 Tabs anklicken → richtiger Inhalt
- [ ] Aktiver Tab sollte hervorgehoben sein

### 7. Nuxt UI Switches (Settings) — NICE TO HAVE

**Was**: Custom Toggles durch USwitch ersetzt
**Test**:

- [ ] Settings öffnen → alle Toggles an/aus klicken
- [ ] Knob-Position sollte korrekt sein (nicht überstehen)

### 8. Admin Queue-Seite (Playback Controls) — WICHTIG

**Was**: Skip und Pause/Play Buttons für den Admin
**Test**:

- [ ] `https://camavor.de/admin/queue` öffnen
- [ ] Now Playing Hero mit Album Art + Fortschrittsbalken sichtbar?
- [ ] "Skip" → nächster Song sollte spielen
- [ ] "Pause" → Wiedergabe pausieren, Button wechselt zu "Play"
- [ ] "Play" → Wiedergabe fortsetzen
- [ ] Queue-Liste darunter sichtbar?

### 9. "Keine Wiederholungen" Sperre

**Was**: Songs können am ganzen Abend nur einmal vorgeschlagen werden
**Test**:

- [ ] Settings → "Keine Wiederholungen" ist AN (default)
- [ ] Song vorschlagen → erfolgreich
- [ ] Gleichen Song nochmal vorschlagen → Fehler "bereits vorgeschlagen"
- [ ] Settings → Toggle AUS → gleichen Song nochmal vorschlagen → sollte jetzt gehen

### 10. Favicon + Title

- [ ] Browser-Tab zeigt Gold-Musiknote als Favicon
- [ ] Title ist "The Midnight Concierge"

## Bekannte Einschränkungen

- **Node Version**: Pi läuft auf Node 22, Pipeline baut mit Node 22. Nicht upgraden ohne Native-Module-Rebuild.
- **Secure Cookie**: `secure: true` — funktioniert nur über HTTPS (camavor.de), nicht über HTTP (localhost)
- **Queue-Scheduler**: Prüft nur alle 15 Sekunden — es kann bis zu 15s dauern bis ein Song eingefügt wird
- **Blocklist Artist-Match**: Vergleicht exakten Artist-Namen (lowercase) — "Dua Lipa" blockt nicht "DUA LIPA feat. XY"
