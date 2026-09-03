/** Slug list written by scripts/inject-notes-shell.mjs. */
const noteListUrl = "/notes/random-notes.json"

let notePromise: Promise<string[]> | null = null

function loadNotes(): Promise<string[]> {
  notePromise ??= fetch(noteListUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${noteListUrl} responded with ${response.status}`)
      }
      return response.json() as Promise<string[]>
    })
    .catch((error) => {
      // Allow a later click to retry rather than staying broken for the page view.
      notePromise = null
      throw error
    })
  return notePromise
}

function pickSlug(slugs: string[], currentSlug: string | undefined): string | undefined {
  const candidates = slugs.filter((slug) => slug !== currentSlug)
  const pool = candidates.length > 0 ? candidates : slugs
  return pool[Math.floor(Math.random() * pool.length)]
}

export function initLuckyButton(): void {
  const button = document.querySelector<HTMLButtonElement>(".lucky-button")
  if (!button) {
    return
  }

  // The list is a few kilobytes, so fetch it only once the button is a likely target.
  const prefetch = () => {
    loadNotes().catch(() => {})
  }
  button.addEventListener("pointerenter", prefetch, { once: true })
  button.addEventListener("focus", prefetch, { once: true })

  button.addEventListener("click", async () => {
    button.disabled = true
    try {
      const slugs = await loadNotes()
      const slug = pickSlug(slugs, document.body.dataset.slug)
      if (slug) {
        window.location.href = `/notes/${slug}`
        return
      }
    } catch (error) {
      console.error("Could not open a random note.", error)
    }
    button.disabled = false
  })
}
