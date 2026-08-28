export interface TimelineEntry {
  /** Free text so ranges like "seit 10/2024" work as well as fixed periods. */
  period: string
  title: string
  organisation?: string
  description?: string
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface Fact {
  label: string
  value: string
}

// TODO: replace the "ergänzen" placeholders with the real dates and organisations.
export const education: TimelineEntry[] = [
  {
    period: "Zeitraum ergänzen",
    title: "B.Sc. Informatik",
    organisation: "Hochschule ergänzen",
    description:
      "Bachelorstudium in der Abschlussphase. Im Anschluss ist ein Masterstudium geplant.",
  },
]

export const experience: TimelineEntry[] = [
  {
    period: "Zeitraum ergänzen",
    title: "Dozent und Lehrer",
    organisation: "Organisation ergänzen",
    description:
      "Mathematikunterricht für Schülerinnen und Schüler kurz vor dem Realschulabschluss oder dem Abitur.",
  },
  {
    period: "Zeitraum ergänzen",
    title: "Online-Kurse für angehende Fachinformatiker",
    organisation: "Organisation ergänzen",
    description:
      "Vorbereitung auf die Abschlussprüfungen in Anwendungsentwicklung und Systemintegration.",
  },
]

export const skillGroups: SkillGroup[] = [
  { label: "Sprachen", items: ["Python", "Swift", "TypeScript"] },
  { label: "Werkzeuge", items: ["Git", "LaTeX", "Docker"] },
]

export const facts: Fact[] = [
  { label: "Name", value: "Matti Magnus Bos" },
  { label: "Studium", value: "B.Sc. Informatik" },
  { label: "Standort", value: "Dornstetten, Deutschland" },
  { label: "Sprachen", value: "Deutsch, Englisch" },
  { label: "Offen für", value: "IT-Kurse, Projekte und Kollaborationen" },
]
