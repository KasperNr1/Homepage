import { getViteConfig } from "astro/config"

export default getViteConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
  },
})
