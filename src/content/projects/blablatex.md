---
title: Blablatex
description: Ein Kommandozeilen-Tool zur Verwaltung von LaTeX-Templates und eigentlich jeder Art von Vorlagen.
date: 2025-07-27
techStack:
  - Python
  - pip
hero: ../../assets/projects/blablatex-hero.webp
action:
  href: "#installation"
  label: Installation ansehen
  note: Wird über die Kommandozeile installiert.
download:
  href: https://pypi.org/project/blablatex/
  label: Auf PyPI ansehen
install:
  intro: Blablatex liegt auf PyPI und wird mit pip installiert. Vorausgesetzt werden Git und Python, für die Vorlagen selbst außerdem eine LaTeX-Installation.
  command: pip install blablatex
  steps:
    - Ein Git-Repository mit den eigenen Vorlagen anlegen oder auswählen, öffentlich oder privat.
    - Nur für private Repositories - blablatex set-token <github-pat> hinterlegt einen Personal Access Token mit repo-Scope. Er wird lokal unter ~/.template_tool/credentials.txt mit eingeschränkten Dateirechten gespeichert.
    - Mit blablatex set-repo <url> das Tool mit dem Repository verbinden.
    - Mit blablatex init <vorlage> [zielordner] eine Vorlage in das aktuelle Verzeichnis kopieren.
  note: Eine bestimmte Version lässt sich mit pip install blablatex==1.2.0 festnageln, die vollständige Befehlsübersicht liefert blablatex --help.
changelog:
  - version: "1.2.0"
    changes:
      - Unterstützung für private Repositories über einen GitHub Personal Access Token.
      - Neue Befehle set-token und clear-token zum Hinterlegen und Entfernen des Tokens.
      - set-repo zeigt an, ob eine Authentifizierung eingerichtet ist.
      - Zugangsdaten liegen lokal mit eingeschränkten Dateirechten und werden weder angezeigt noch protokolliert.
  - version: "1.1.1"
    changes:
      - Absturz beim erstmaligen Klonen des entfernten Repositories behoben.
  - version: "1.1.0"
    changes:
      - Neuer Befehl version zeigt die installierte Versionsnummer.
      - Funktioniert offline mit dem zuletzt geladenen Stand.
      - Absturz durch fehlgeschlagene Pulls vom entfernten Repository behoben.
  - version: "1.0.0"
    date: 2025-07-27
    changes:
      - Erste Veröffentlichung mit den Befehlen set-repo, path, list, init und refresh.
---

Blablatex verwaltet LaTeX-Templates und eigentlich jede Art von Vorlagen direkt aus der
Kommandozeile.

Aktualisieren, abrufen und anwenden, alles mit einem einzigen Befehl!

Das Tool ist als pip-Paket veröffentlicht und lässt sich damit in jede bestehende Python-Umgebung
einbinden.
