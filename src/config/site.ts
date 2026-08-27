export interface NavigationLink {
  href: string
  label: string
}

/** A document shell: brand, navigation and footer used by a group of pages. */
export interface Shell {
  titleSuffix: string
  brand: string
  brandHref: string
  navigation: NavigationLink[]
  footer: NavigationLink[]
  noindex: boolean
}

export const siteConfig = {
  name: "Matti Magnus Bos",
  owner: "Matti Magnus Bos",
  locale: "de",
  description:
    "Matti Magnus Bos - Softwareentwickler und Dozent. Ich entwickle Tools, die aus eigenen Problemen entstehen und auch anderen helfen könnten.",
  email: "matti@magnusbos.com",
} as const

export const shells = {
  site: {
    titleSuffix: siteConfig.name,
    brand: siteConfig.name,
    brandHref: "/",
    navigation: [
      { href: "/#about", label: "Über mich" },
      { href: "/#projects", label: "Projekte" },
      { href: "/notes/", label: "Notizen" },
      { href: "/contact", label: "Kontakt" },
    ],
    footer: [
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" },
    ],
    noindex: false,
  },
  gonzales: {
    titleSuffix: "Gonzales",
    brand: "Gonzales",
    brandHref: "/gonzales",
    navigation: [
      { href: "/gonzales/privacy", label: "Datenschutz" },
      { href: `mailto:impressum@magnusbos.com`, label: "Kontakt" },
    ],
    footer: [
      { href: "/gonzales", label: "App-Seite" },
      { href: "/gonzales/privacy", label: "Datenschutz" },
    ],
    noindex: true,
  },
} satisfies Record<string, Shell>

export type ShellName = keyof typeof shells
