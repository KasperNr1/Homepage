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
      coverImage: image().optional(),
      // Where the project can actually be obtained, e.g. PyPI or the App Store.
      download: z.object({ href: z.string(), label: z.string() }).optional(),
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
