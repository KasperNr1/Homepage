export interface TimelineEntry {
  /** Free text so open ranges like "09/2023 – heute" work as well as fixed periods. */
  period: string
  title: string
  organisation?: string
  description?: string
  points?: string[]
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface Fact {
  label: string
  value: string
}

export const education: TimelineEntry[] = [
  {
    period: "09/2023 – heute",
    title: "B.Sc. Informatik",
    organisation: "Duale Hochschule Baden-Württemberg · Horb",
    description: "Schwerpunkte: Software Engineering, Künstliche Intelligenz und Algorithmen.",
  },
  {
    period: "09/2014 – 07/2022",
    title: "Allgemeine Hochschulreife",
    organisation: "Gymnasium Dornstetten",
    description: "Leistungskurse: Mathematik, Englisch und Chemie.",
  },
]

export const experience: TimelineEntry[] = [
  {
    period: "01/2026 – heute",
    title: "Freiberuflicher Dozent",
    organisation: "Didaris · Online",
    points: [
      "Vorbereitung und Durchführung von Online-Kursen für angehende Fachinformatiker.",
      "Prüfungsvorbereitung für die Fachrichtungen Systemintegration und Anwendungsentwicklung.",
    ],
  },
  {
    period: "09/2023 – heute",
    title: "Dualer Student Informatik",
    organisation: "HOMAG Group AG · Schopfloch",
    points: [
      "Fullstack-Entwicklung mit C#, TypeScript und Python.",
      "Entwicklung nach agilen Methoden (Scrum und Kanban).",
      "Betreuung und fachliche Einarbeitung neuer Auszubildender und dualer Studenten.",
    ],
  },
  {
    period: "09/2021 – 08/2023",
    title: "Dozent und Tutor für Mathematik und Englisch",
    organisation: "EL Privatunterricht · Dornstetten",
    points: [
      "Eigenständige Vorbereitung und Durchführung von Kleingruppenunterricht.",
      "Förderung von Schülerinnen und Schülern der Klassen 4 bis 13.",
      "Vorbereitung auf Klausuren, Abschluss- und Abiturprüfungen.",
    ],
  },
]

export const academicWork: TimelineEntry[] = [
  {
    period: "06/2026 – 09/2026",
    title: "Bachelorarbeit: KI-Agent zur dynamischen Anpassung der Heizleistung",
    organisation: "HOMAG Group AG · Schopfloch",
    description:
      "Beim Kantenanleimen entscheidet die Fügetemperatur über die Qualität der Verklebung. Ein Agent passt die Heizleistung dynamisch an die Prozessbedingungen an, um sie konstant zu halten.",
    points: ["Reinforcement Learning", "Datenanalyse und -vorverarbeitung"],
  },
  {
    period: "10/2025 – 05/2026",
    title: "Studienarbeit: Lawinen-App für Skitourengeher",
    organisation: "DHBW Stuttgart Campus Horb",
    description:
      "Weiterentwicklung einer App zur Einschätzung der Lawinengefahr abseits gesicherter Pisten, mit Fokus auf die Bedienbarkeit unter schwierigen Bedingungen wie Handschuhen und schlechter Sicht.",
    points: ["iOS-Entwicklung"],
  },
]

export const volunteering: TimelineEntry[] = [
  {
    period: "10/2025 – 09/2026",
    title: "Mitglied des Studierendenparlaments",
    organisation: "DHBW",
    description: "Mitwirkung an der Gestaltung von Hochschulpolitik und -entwicklung.",
  },
  {
    period: "10/2024 – 09/2026",
    title: "Mitglied der Studierendenvertretung",
    organisation: "DHBW",
    points: [
      "Vertretung der Studierendeninteressen gegenüber der Hochschulleitung.",
      "Organisation von Veranstaltungen zur Förderung des studentischen Lebens.",
      "Unterstützung bei Studieninformationstagen und Erstsemesterveranstaltungen.",
    ],
  },
  {
    period: "09/2023 – heute",
    title: "Nationaler Kampfrichter im Bogensport",
    organisation: "Deutscher Schützenbund e.V.",
    description: "Einsatz bei international rekordberechtigten Wettkämpfen.",
  },
]

export const events: TimelineEntry[] = [
  {
    period: "07/2026",
    title: "Copilot Hackathon Days 2026",
    organisation: "HOMAG Group AG · Schopfloch",
    description:
      "Zwei Tage rund um KI-gestützte Entwicklerunterstützung, mit kleineren Projekten, Quality-of-Life-Features und fachlichem Austausch.",
  },
  {
    period: "04/2026",
    title: "Drohnen-Makeathon 2026",
    organisation: "DHBW Stuttgart Campus Horb",
    description:
      "Dreitägiger interdisziplinärer Makeathon. Im Team wurden Konstruktion, Programmierung und Systemintegration zu einem fliegenden Prototypen zusammengeführt.",
  },
]

export const certificates: TimelineEntry[] = [
  {
    period: "04/2026",
    title: "Fernpilotenlizenz A1/A3",
    organisation: "Luftfahrt-Bundesamt · Braunschweig",
  },
  {
    period: "03/2026",
    title: "Certificate in Advanced English (C1)",
    organisation: "Cambridge English",
  },
]

export const skillGroups: SkillGroup[] = [
  { label: "Programmiersprachen", items: ["Java", "Python", "C#", "TypeScript"] },
  { label: "Technologien und Werkzeuge", items: ["Git", "SQL", "LaTeX", "CI/CD", "Docker"] },
  { label: "KI und Agenten", items: ["GitHub Copilot", "Claude", "Agentische Workflows"] },
]

export const facts: Fact[] = [
  { label: "Name", value: "Matti Magnus Bos" },
  { label: "Studium", value: "B.Sc. Informatik, DHBW Horb" },
  { label: "Standort", value: "Dornstetten, Deutschland" },
  { label: "Sprachen", value: "Deutsch (C2), Englisch (C1)" },
  { label: "Offen für", value: "IT-Kurse, Projekte und Kollaborationen" },
]
