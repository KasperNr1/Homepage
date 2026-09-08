/** Cursor trail for the unicorn theme. Purely decorative, so it stays out of the
    way of pointers that hover nothing and of readers who asked for less motion. */
const colors = ["#ff5fa8", "#e8a020", "#c2185b", "#ffb3d9", "#ffd05a"]
const spawnDistance = 14
const maxSparkles = 40

let layer: HTMLDivElement | null = null
let lastX = 0
let lastY = 0
let hasLast = false
let live = 0

function isUnicorn(): boolean {
  return document.documentElement.dataset.theme === "unicorn"
}

function teardown(): void {
  layer?.remove()
  layer = null
  hasLast = false
  live = 0
}

function spawn(x: number, y: number): void {
  if (!layer) {
    layer = document.createElement("div")
    layer.className = "sparkle-layer"
    layer.setAttribute("aria-hidden", "true")
    document.body.append(layer)
  }

  const sparkle = document.createElement("span")
  const size = 6 + Math.random() * 9
  const drift = (Math.random() - 0.5) * 26
  const spin = Math.random() < 0.5 ? -180 : 180

  sparkle.className = "sparkle"
  sparkle.style.left = `${x}px`
  sparkle.style.top = `${y}px`
  sparkle.style.setProperty("--sparkle-size", `${size}px`)
  sparkle.style.setProperty("--sparkle-color", colors[Math.floor(Math.random() * colors.length)])
  layer.append(sparkle)
  live += 1

  const animation = sparkle.animate(
    [
      { transform: "translate(-50%, -50%) scale(0) rotate(0deg)", opacity: 1 },
      {
        transform: `translate(calc(-50% + ${drift}px), calc(-50% + 14px)) scale(1) rotate(${spin / 2}deg)`,
        opacity: 1,
        offset: 0.35,
      },
      {
        transform: `translate(calc(-50% + ${drift * 1.8}px), calc(-50% + 40px)) scale(0) rotate(${spin}deg)`,
        opacity: 0,
      },
    ],
    { duration: 700 + Math.random() * 350, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" },
  )

  animation.onfinish = () => {
    sparkle.remove()
    live -= 1
  }
}

export function initSparkles(): void {
  // A trail needs a pointer that hovers, and it is motion nobody has to sit through.
  if (
    !window.matchMedia("(pointer: fine)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!isUnicorn()) {
        if (layer) {
          teardown()
        }
        return
      }

      const distance = hasLast ? Math.hypot(event.clientX - lastX, event.clientY - lastY) : Infinity
      if (distance < spawnDistance) {
        return
      }

      lastX = event.clientX
      lastY = event.clientY
      hasLast = true
      if (live < maxSparkles) {
        spawn(event.clientX, event.clientY)
      }
    },
    { passive: true },
  )

  new MutationObserver(() => {
    if (!isUnicorn()) {
      teardown()
    }
  }).observe(document.documentElement, { attributeFilter: ["data-theme"] })
}
