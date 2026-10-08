import { CHARACTERS, randomCharacter, type CharacterKind } from './characters'

export type Vec = { x: number; y: number }

export type Planet = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  kind: CharacterKind
  color: string
  trail: Vec[]
  born: number
}

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

export type Popup = { x: number; y: number; text: string; life: number }

export const SUN_RADIUS = 38
export const GM = 9_000_000
const SOFTENING = 400
const MAX_TRAIL = 90
const ESCAPE_DISTANCE = 2600

export const SIZES = { small: 9, medium: 15, big: 23 } as const

let nextId = 1

export function makePlanet(pos: Vec, vel: Vec, r: number, kind = randomCharacter()): Planet {
  return {
    id: nextId++,
    x: pos.x,
    y: pos.y,
    vx: vel.x,
    vy: vel.y,
    r,
    kind,
    color: CHARACTERS[kind],
    trail: [],
    born: performance.now(),
  }
}

export function circularVelocity(pos: Vec, sun: Vec, clockwise = false): Vec {
  const dx = pos.x - sun.x
  const dy = pos.y - sun.y
  const d = Math.hypot(dx, dy) || 1
  const speed = Math.sqrt(GM / d)
  const dir = clockwise ? -1 : 1
  return { x: (-dy / d) * speed * dir, y: (dx / d) * speed * dir }
}

function accel(x: number, y: number, sun: Vec): Vec {
  const dx = sun.x - x
  const dy = sun.y - y
  const d2 = dx * dx + dy * dy + SOFTENING
  const inv = GM / (d2 * Math.sqrt(d2))
  return { x: dx * inv, y: dy * inv }
}

export type StepEvents = { sunHits: Planet[] }

export function step(planets: Planet[], sun: Vec, dt: number, trails: boolean): { planets: Planet[]; events: StepEvents } {
  const events: StepEvents = { sunHits: [] }
  const SUB = 4
  const h = dt / SUB

  for (const p of planets) {
    for (let s = 0; s < SUB; s++) {
      const a = accel(p.x, p.y, sun)
      p.vx += a.x * h
      p.vy += a.y * h
      p.x += p.vx * h
      p.y += p.vy * h
    }

    if (trails) {
      p.trail.push({ x: p.x, y: p.y })
      if (p.trail.length > MAX_TRAIL) p.trail.shift()
    } else if (p.trail.length) {
      p.trail.length = 0
    }
  }

  const dead = new Set<number>()
  for (const p of planets) {
    const d = Math.hypot(p.x - sun.x, p.y - sun.y)
    if (d < SUN_RADIUS + p.r * 0.6) {
      dead.add(p.id)
      events.sunHits.push(p)
    } else if (d > ESCAPE_DISTANCE) {
      dead.add(p.id)
    }
  }

  return { planets: planets.filter((p) => !dead.has(p.id)), events }
}

// Hit area is padded so small critters are still easy to tap with a finger.
export function pickAt(planets: Planet[], pt: Vec): Planet | undefined {
  for (let i = planets.length - 1; i >= 0; i--) {
    const p = planets[i]
    if (Math.hypot(p.x - pt.x, p.y - pt.y) < Math.max(p.r * 1.3, 24)) return p
  }
}

export function burst(at: Vec, color: string, count: number, speed: number): Particle[] {
  const out: Particle[] = []
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const s = speed * (0.3 + Math.random() * 0.7)
    out.push({
      x: at.x,
      y: at.y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      color,
      size: 2 + Math.random() * 3,
    })
  }
  return out
}
