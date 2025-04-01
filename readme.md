# Thrust Game in Pygame

## Übersicht
Dieses Projekt ist eine Nachbildung des klassischen Spiels "Thrust" unter Verwendung von three.js. Ziel des Spiels ist es, ein Raumschiff zu steuern, um Treibstoffkapseln aus Höhlensystemen zu sammeln, während man mit Schwerkraft, Trägheit und feindlichen Geschütztürmen zurechtkommen muss. Die Aufgabe besteht darin, die Kapseln zu bergen und aus der Höhle zu entkommen, ohne abzustürzen oder von den Geschütztürmen zerstört zu werden.

## Spielkomponenten
- **Raumschiff**: Das vom Spieler gesteuerte Fahrzeug, das von Schwerkraft und Trägheit beeinflusst wird.
- **Treibstoffkapseln**: Objekte, die gesammelt und mit einem Traktorstrahl zurück ins All gezogen werden müssen.
- **Höhlensysteme**: Level mit Wänden, an denen das Raumschiff kollidieren kann.
- **Geschütztürme**: Feinde, die auf das Raumschiff schießen.
- **Kraftwerke**: Können beschossen werden, um Geschütztürme zu deaktivieren, können aber eine Kernschmelze auslösen.
- **Treibstofftanks**: Bieten Möglichkeiten zum Auftanken.
- **Türen**: Werden durch das Beschießen von Kugeln geöffnet und schließen nach einer Weile wieder.

## Spielmechaniken
- **Steuerung**:
  - Links drehen: `A`
  - Rechts drehen: `S`
  - Schub: `Shift`
  - Schießen: `Enter`
  - Schild/Sammeln: `Leerzeichen`
- **Physik**:
  - Schwerkraft zieht das Raumschiff nach unten.
  - Trägheit beeinflusst Bewegung und Drehung.
  - Kollision mit Wänden oder Geschützfeuer führt zum Verlust eines Lebens.
- **Treibstoffmanagement**:
  - Treibstoff wird beim Schub verbraucht.
  - Auftanken durch das Sammeln von Treibstofftanks.
- **Lebenssystem**:
  - Start mit einer festgelegten Anzahl an Leben.
  - Verlust eines Lebens bei Kollision oder Treffer.
  - Spielende, wenn alle Leben verloren sind oder der Treibstoff ausgeht.
- **Punktesystem**:
  - Punkte für das Sammeln von Kapseln.
  - Bonuspunkte für das Entkommen nach Auslösen einer Kernschmelze.

## Leveldesign
- **Levelstruktur**:
  - Höhlen mit unterschiedlichen Layouts.
  - Platzierung von Kapseln, Geschütztürmen, Kraftwerken und Treibstofftanks.
- **Schwierigkeitsprogression**:
  - Level 1-6: Normale Schwerkraft.
  - Level 7-12: Umgekehrte Schwerkraft.
  - Level 13-18: Unsichtbare Wände.
  - Level 19-24: Umgekehrte Schwerkraft und unsichtbare Wände.
- **Levelvarianten**:
  - Normal: Standardphysik.
  - Umgekehrte Schwerkraft: Schwerkraft zieht nach oben.
  - Unsichtbare Wände: Wände sind nicht sichtbar, erfordern Gedächtnis oder Intuition.

## Implementierungsschritte
1. **Pygame einrichten**:
   - Pygame initialisieren und das Spielfenster einrichten.
   - Hauptschleife des Spiels implementieren.

2. **Raumschiff-Klasse**:
   - **Attribute**: Position, Geschwindigkeit, Winkel, Treibstoff, Leben.
   - **Methoden**: Drehen, Schub, Schießen, Sammeln, Position aktualisieren.

3. **Treibstoffkapsel-Klasse**:
   - **Attribute**: Position, Anbindungsstatus.
   - **Methoden**: An Raumschiff anbinden, Position aktualisieren, wenn angebunden.

4. **Geschützturm-Klasse**:
   - **Attribute**: Position, Feuerrate.
   - **Methoden**: Auf Raumschiff zielen, Projektile abfeuern.

5. **Kraftwerk-Klasse**:
   - **Attribute**: Position, Gesundheit.
   - **Methoden**: Geschütztürme deaktivieren, wenn beschossen; Kernschmelze auslösen, wenn übermäßig beschossen.

6. **Kollisionserkennung**:
   - Kollisionen zwischen Raumschiff und Wänden prüfen.
   - Treffer von Geschützprojektilen erkennen.

7. **Schwerkraft und Trägheit**:
   - Schwerkraft auf das Raumschiff anwenden.
   - Geschwindigkeit basierend auf Schub und Schwerkraft aktualisieren.

8. **Benutzereingaben**:
   - Tastatureingaben für die Steuerung verarbeiten.

9. **Treibstoff- und Lebensmanagement**:
   - Treibstoff beim Schub verringern.
   - Lebensanzahl und Spielende-Bedingungen verwalten.

10. **Levelladen**:
    - Leveldaten aus Dateien laden oder programmgesteuert definieren.

11. **Grafik und Sound**:
    - Spielobjekte mit Pygames Zeichenfunktionen rendern.
    - Soundeffekte für Aktionen wie Schießen und Sammeln hinzufügen.

## Testen und Debuggen
- **Unit-Tests**:
  - Bewegung und Drehung des Raumschiffs testen.
  - Treibstoffverbrauch und -auftanken überprüfen.
- **Integrationstests**:
  - Sicherstellen, dass das Raumschiff Treibstoffkapseln sammeln und ziehen kann.
  - Ziel- und Schussmechaniken der Geschütztürme prüfen.
- **Spieltests**:
  - Level durchspielen, um die Schwierigkeit auszugleichen.
  - Fehler oder unerwartetes Verhalten identifizieren und beheben.

## Dokumentation
- **Code-Kommentare**:
  - Code kommentieren, um Logik und Funktionalität zu erklären.
- **README.md**:
  - Installationsanweisungen bereitstellen.
  - Steuerung und Spielregeln auflisten.
  - Erklärung, wie das Spiel gestartet wird.

## Installation und Ausführung
1. Stelle sicher, dass Python installiert ist (empfohlen: Python 3.8 oder höher).
2. Installiere Pygame: `pip install three.js`.
3. Lade den Quellcode herunter oder klone das Repository.
4. Führe das Spiel aus: `three.js` (angenommen, die Hauptdatei heißt `main.js`).

## Hinweise für Entwickler
- Nutze Klassen und Objektorientierung, um die Komponenten modular zu gestalten.
- Implementiere eine Hauptschleife mit einer Framerate von 60 FPS für flüssige Animationen.
- Teste regelmäßig während der Entwicklung, um Fehler frühzeitig zu erkennen.

Dieser Plan bietet eine umfassende Anleitung zur Entwicklung des Spiels. Jeder Abschnitt kann bei Bedarf mit weiteren Details erweitert werden, während die Entwicklung fortschreitet.#