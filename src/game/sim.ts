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
  lastAngle: number
  sweep: number
  orbits: number
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
const MAX_TRAIL = 140
const ESCAPE_DISTANCE = 2600

export const SIZES = { small: 9, medium: 15, big: 23 } as const
export type SizeKey = keyof typeof SIZES

let nextId = 1

export function makePlanet(pos: Vec, vel: Vec, r: number, sun: Vec, kind = randomCharacter()): Planet {
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
    lastAngle: Math.atan2(pos.y - sun.y, pos.x - sun.x),
    sweep: 0,
    orbits: 0,
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

export function predictPath(pos: Vec, vel: Vec, sun: Vec, seconds = 3, steps = 180): Vec[] {
  const pts: Vec[] = []
  let { x, y } = pos
  let vx = vel.x
  let vy = vel.y
  const dt = seconds / steps
  for (let i = 0; i < steps; i++) {
    const a = accel(x, y, sun)
    vx += a.x * dt
    vy += a.y * dt
    x += vx * dt
    y += vy * dt
    pts.push({ x, y })
    if (Math.hypot(x - sun.x, y - sun.y) < SUN_RADIUS) break
  }
  return pts
}

export type StepEvents = {
  sunHits: Planet[]
  merges: { a: Planet; b: Planet; at: Vec }[]
  orbitsCompleted: Planet[]
}

export function step(planets: Planet[], sun: Vec, dt: number, trails: boolean): { planets: Planet[]; events: StepEvents } {
  const events: StepEvents = { sunHits: [], merges: [], orbitsCompleted: [] }
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

    const ang = Math.atan2(p.y - sun.y, p.x - sun.x)
    let delta = ang - p.lastAngle
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    p.sweep += delta
    p.lastAngle = ang
    if (Math.abs(p.sweep) >= Math.PI * 2) {
      p.sweep -= Math.sign(p.sweep) * Math.PI * 2
      p.orbits++
      events.orbitsCompleted.push(p)
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

  for (let i = 0; i < planets.length; i++) {
    const a = planets[i]
    if (dead.has(a.id)) continue
    for (let j = i + 1; j < planets.length; j++) {
      const b = planets[j]
      if (dead.has(b.id)) continue
      if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 0.85) {
        const ma = a.r ** 3
        const mb = b.r ** 3
        const m = ma + mb
        const big = ma >= mb ? a : b
        const small = big === a ? b : a
        big.vx = (a.vx * ma + b.vx * mb) / m
        big.vy = (a.vy * ma + b.vy * mb) / m
        big.x = (a.x * ma + b.x * mb) / m
        big.y = (a.y * ma + b.y * mb) / m
        big.r = Math.min(Math.cbrt(m), 40)
        dead.add(small.id)
        events.merges.push({ a: big, b: small, at: { x: big.x, y: big.y } })
      }
    }
  }

  return { planets: planets.filter((p) => !dead.has(p.id)), events }
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
