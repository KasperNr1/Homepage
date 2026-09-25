import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      techStack: z.array(z.string()),
      // The one visual a project has to bring, shown on its card and its own page.
      hero: image(),
      heroAlt: z.string().optional(),
      // The button at the top of the project page. An in-page target such as
      // "#installation" keeps command line tools on the page.
      action: z
        .object({ href: z.string(), label: z.string(), note: z.string().optional() })
        .optional(),
      // Where the project can actually be obtained, e.g. PyPI or the App Store.
      download: z.object({ href: z.string(), label: z.string() }).optional(),
      install: z
        .object({
          intro: z.string().optional(),
          command: z.string().optional(),
          steps: z.array(z.string()).optional(),
          note: z.string().optional(),
        })
        .optional(),
      changelog: z
        .array(
          z.object({
            version: z.string(),
            date: z.coerce.date(),
            changes: z.array(z.string()),
          }),
        )
        .optional(),
      status: z.string().optional(),
    }),
})

const policies = defineCollection({
  loader: glob({ base: "./src/content/policies", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    lastUpdated: z.coerce.date(),
    // Selects the document shell so app policies keep the Gonzales chrome.
    shell: z.enum(["site", "gonzales"]).default("site"),
  }),
})

export const collections = { projects, policies }
