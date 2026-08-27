export interface NavigationLink {
  href: string
  label: string
}

/** A document shell: brand, navigation and footer used by a group of pages. */
export interface Shell {
  titleSuffix: string
  brand: string
  brandHref: string
  description: string
  navigation: NavigationLink[]
  footer: NavigationLink[]
  noindex: boolean
}

export const siteConfig = {
  name: "Matti Magnus Bos",
  owner: "Matti Magnus Bos",
  locale: "de",
  ogLocale: "de_DE",
  description:
    "Matti Magnus Bos - Softwareentwickler und Dozent. Ich entwickle Tools, die aus eigenen Problemen entstehen und auch anderen helfen könnten.",
  contactEmail: "matti@magnusbos.com",
  legalEmail: "impressum@magnusbos.com",
} as const

export const shells = {
  site: {
    titleSuffix: siteConfig.name,
    brand: siteConfig.name,
    brandHref: "/",
    description: siteConfig.description,
    navigation: [
      { href: "/#about", label: "Über mich" },
      { href: "/#projects", label: "Projekte" },
      { href: "/notes/", label: "Notizen" },
      { href: "/contact", label: "Kontakt" },
    ],
    footer: [
      { href: "/impressum", label: "Impressum" },
      { href: "/policies/datenschutz", label: "Datenschutz" },
    ],
    noindex: false,
  },
  gonzales: {
    titleSuffix: "Gonzales",
    brand: "Gonzales",
    brandHref: "/gonzales",
    description:
      "Gonzales ist eine native macOS-App, mit der sich der Mauszeiger sofort zwischen Monitoren bewegen lässt.",
    navigation: [
      { href: "/policies/gonzales", label: "Datenschutz" },
      { href: `mailto:${siteConfig.legalEmail}`, label: "Kontakt" },
    ],
    footer: [
      { href: "/gonzales", label: "App-Seite" },
      { href: "/policies/gonzales", label: "Datenschutz" },
    ],
    noindex: true,
  },
} satisfies Record<string, Shell>

export type ShellName = keyof typeof shells
