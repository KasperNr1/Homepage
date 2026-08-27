import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

// No React island ships yet, so this pins down the jsdom and Testing Library wiring instead.
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Klicks: {count}</button>
}

describe("React island harness", () => {
  it("renders a client component and reacts to user input", async () => {
    render(<Counter />)

    await userEvent.click(screen.getByRole("button", { name: "Klicks: 0" }))

    expect(screen.getByRole("button", { name: "Klicks: 1" })).toBeInTheDocument()
  })
})
