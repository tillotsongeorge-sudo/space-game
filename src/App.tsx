import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import {
  burst,
  circularVelocity,
  makePlanet,
  predictPath,
  SIZES,
  step,
  SUN_RADIUS,
  type Particle,
  type Planet,
  type Popup,
  type SizeKey,
  type Vec,
} from './game/sim'
import { sounds } from './game/sound'
import sunFaceUrl from './assets/sun-face.png'

const sunFace = new Image()
sunFace.src = sunFaceUrl
// Square crop of the source photo centred on the face, in image pixels.
const SUN_FACE_CROP = { x: 30, y: 15, size: 225 }

const LAUNCH_SCALE = 2.2
const MAX_PLANETS = 40

type Drag = { start: Vec; current: Vec }
type Star = { x: number; y: number; r: number; twinkle: number }

function makeStars(w: number, h: number): Star[] {
  const count = Math.floor((w * h) / 2500)
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.4 + 0.2,
    twinkle: Math.random() * Math.PI * 2,
  }))
}

function drawFace(ctx: CanvasRenderingContext2D, p: Planet, sun: Vec, t: number) {
  if (p.r < 8) return
  const nearSun = Math.hypot(p.x - sun.x, p.y - sun.y) < SUN_RADIUS + 90
  const blink = Math.sin(t / 900 + p.id * 1.7) > 0.985
  const eyeDx = p.r * 0.33
  const eyeY = p.y - p.r * 0.15
  const eyeR = Math.max(1.4, p.r * 0.12)
  ctx.fillStyle = '#1b1240'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    if (blink) ctx.ellipse(p.x + side * eyeDx, eyeY, eyeR, eyeR * 0.25, 0, 0, Math.PI * 2)
    else ctx.arc(p.x + side * eyeDx, eyeY, eyeR, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = '#1b1240'
  ctx.lineWidth = Math.max(1.2, p.r * 0.09)
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (nearSun) {
    ctx.arc(p.x, p.y + p.r * 0.32, p.r * 0.14, 0, Math.PI * 2)
    ctx.fillStyle = '#1b1240'
    ctx.fill()
  } else {
    ctx.arc(p.x, p.y + p.r * 0.1, p.r * 0.35, 0.2 * Math.PI, 0.8 * Math.PI)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(255,120,160,0.45)'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(p.x + side * p.r * 0.55, p.y + p.r * 0.2, p.r * 0.13, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const planets = useRef<Planet[]>([])
  const particles = useRef<Particle[]>([])
  const popups = useRef<Popup[]>([])
  const stars = useRef<Star[]>([])
  const drag = useRef<Drag | null>(null)
  const sun = useRef<Vec>({ x: 0, y: 0 })
  const totals = useRef({ orbits: 0, launched: 0, best: 0 })

  const [size, setSize] = useState<SizeKey>('medium')
  const [paused, setPaused] = useState(false)
  const [slowMo, setSlowMo] = useState(false)
  const [trails, setTrails] = useState(true)
  const [muted, setMuted] = useState(false)
  const [stats, setStats] = useState({ alive: 0, orbits: 0, best: 0 })
  const [hasInteracted, setHasInteracted] = useState(false)

  const settings = useRef({ size, paused, slowMo, trails, muted })
  useEffect(() => {
    settings.current = { size, paused, slowMo, trails, muted }
  }, [size, paused, slowMo, trails, muted])

  const play = useCallback(<K extends keyof typeof sounds>(name: K, ...args: Parameters<(typeof sounds)[K]>) => {
    if (settings.current.muted) return
    ;(sounds[name] as (...a: unknown[]) => void)(...args)
  }, [])

  const addPlanet = useCallback((p: Planet) => {
    planets.current.push(p)
    if (planets.current.length > MAX_PLANETS) planets.current.shift()
    totals.current.launched++
    setHasInteracted(true)
  }, [])

  const autoOrbit = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = sun.current
    const maxR = Math.min(canvas.clientWidth, canvas.clientHeight) / 2 - 40
    const dist = 80 + Math.random() * Math.max(40, maxR - 80)
    const a = Math.random() * Math.PI * 2
    const pos = { x: s.x + Math.cos(a) * dist, y: s.y + Math.sin(a) * dist }
    addPlanet(makePlanet(pos, circularVelocity(pos, s), SIZES[settings.current.size], s))
    play('launch')
  }, [addPlanet, play])

  const clearAll = useCallback(() => {
    for (const p of planets.current) particles.current.push(...burst(p, p.color, 10, 120))
    planets.current = []
    totals.current.orbits = 0
    totals.current.best = 0
    setStats({ alive: 0, orbits: 0, best: 0 })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let last = performance.now()
    let statTimer = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const old = sun.current
      const next = { x: w / 2, y: h / 2 }
      if (old.x || old.y) {
        const dx = next.x - old.x
        const dy = next.y - old.y
        for (const p of planets.current) {
          p.x += dx
          p.y += dy
          for (const t of p.trail) {
            t.x += dx
            t.y += dy
          }
        }
      }
      sun.current = next
      stars.current = makeStars(w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    const frame = (now: number) => {
      const rawDt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const { paused, slowMo, trails } = settings.current
      const dt = paused ? 0 : rawDt * (slowMo ? 0.3 : 1)
      const s = sun.current
      const w = canvas.clientWidth
      const h = canvas.clientHeight

      if (dt > 0) {
        const res = step(planets.current, s, dt, trails)
        planets.current = res.planets
        for (const p of res.events.sunHits) {
          particles.current.push(...burst(p, '#ffd36b', 26, 220), ...burst(p, p.color, 12, 160))
          play('sizzle')
        }
        for (const m of res.events.merges) {
          particles.current.push(...burst(m.at, m.b.color, 18, 140))
          popups.current.push({ x: m.at.x, y: m.at.y - 20, text: 'Bonk!', life: 1 })
          play('merge')
        }
        for (const p of res.events.orbitsCompleted) {
          totals.current.orbits++
          totals.current.best = Math.max(totals.current.best, p.orbits)
          popups.current.push({ x: p.x, y: p.y - p.r - 10, text: p.orbits === 1 ? '★' : `★ ${p.orbits}`, life: 1 })
          play('orbit', p.orbits)
        }
        for (const q of particles.current) {
          q.x += q.vx * dt
          q.y += q.vy * dt
          q.vx *= 0.97
          q.vy *= 0.97
          q.life -= dt * 1.2
        }
        particles.current = particles.current.filter((q) => q.life > 0)
        for (const pop of popups.current) {
          pop.y -= 30 * dt
          pop.life -= dt * 0.9
        }
        popups.current = popups.current.filter((pop) => pop.life > 0)
      }

      ctx.fillStyle = '#0b0a1f'
      ctx.fillRect(0, 0, w, h)
      for (const st of stars.current) {
        const a = 0.35 + 0.35 * Math.sin(now / 700 + st.twinkle)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fillRect(st.x, st.y, st.r, st.r)
      }

      const glow = ctx.createRadialGradient(s.x, s.y, SUN_RADIUS * 0.4, s.x, s.y, SUN_RADIUS * 3.2)
      glow.addColorStop(0, 'rgba(255,200,90,0.55)')
      glow.addColorStop(1, 'rgba(255,140,60,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(s.x, s.y, SUN_RADIUS * 3.2, 0, Math.PI * 2)
      ctx.fill()
      const pulse = 1 + Math.sin(now / 500) * 0.03
      const sunR = SUN_RADIUS * pulse
      ctx.fillStyle = '#ffc94a'
      ctx.beginPath()
      ctx.arc(s.x, s.y, sunR, 0, Math.PI * 2)
      ctx.fill()
      if (sunFace.complete && sunFace.naturalWidth) {
        ctx.save()
        ctx.clip()
        const c = SUN_FACE_CROP
        ctx.drawImage(sunFace, c.x, c.y, c.size, c.size, s.x - sunR, s.y - sunR, sunR * 2, sunR * 2)
        ctx.restore()
      }
      ctx.strokeStyle = '#ffb53c'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(s.x, s.y, sunR, 0, Math.PI * 2)
      ctx.stroke()

      for (const p of planets.current) {
        if (p.trail.length < 2) continue
        ctx.lineWidth = Math.max(2, p.r * 0.45)
        ctx.lineCap = 'round'
        for (let i = 1; i < p.trail.length; i++) {
          const a = i / p.trail.length
          ctx.strokeStyle = p.color + Math.floor(a * 140).toString(16).padStart(2, '0')
          ctx.beginPath()
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y)
          ctx.lineTo(p.trail[i].x, p.trail[i].y)
          ctx.stroke()
        }
      }

      for (const p of planets.current) {
        const age = Math.min(1, (now - p.born) / 250)
        const r = p.r * (0.5 + 0.5 * age)
        const g = ctx.createRadialGradient(p.x - r * 0.4, p.y - r * 0.4, r * 0.1, p.x, p.y, r)
        g.addColorStop(0, '#ffffff')
        g.addColorStop(0.25, p.color)
        g.addColorStop(1, p.color)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        drawFace(ctx, { ...p, r }, s, now)
      }

      for (const q of particles.current) {
        ctx.globalAlpha = Math.max(0, q.life)
        ctx.fillStyle = q.color
        ctx.beginPath()
        ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      ctx.textAlign = 'center'
      ctx.font = '700 20px "Baloo 2", system-ui, sans-serif'
      for (const pop of popups.current) {
        ctx.globalAlpha = Math.max(0, pop.life)
        ctx.fillStyle = '#ffe66d'
        ctx.fillText(pop.text, pop.x, pop.y)
      }
      ctx.globalAlpha = 1

      const d = drag.current
      if (d) {
        const vel = { x: (d.current.x - d.start.x) * LAUNCH_SCALE, y: (d.current.y - d.start.y) * LAUNCH_SCALE }
        const path = predictPath(d.start, vel, s)
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        path.forEach((pt, i) => {
          if (i % 4) return
          ctx.globalAlpha = 1 - i / path.length
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(d.start.x, d.start.y)
        ctx.lineTo(d.current.x, d.current.y)
        ctx.stroke()
        const r = SIZES[settings.current.size]
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(d.start.x, d.start.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      statTimer += rawDt
      if (statTimer > 0.2) {
        statTimer = 0
        setStats({ alive: planets.current.length, orbits: totals.current.orbits, best: totals.current.best })
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [play])

  const toPoint = (e: React.PointerEvent): Vec => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const pt = toPoint(e)
    if (Math.hypot(pt.x - sun.current.x, pt.y - sun.current.y) < SUN_RADIUS + 10) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { start: pt, current: pt }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.current) drag.current.current = toPoint(e)
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const vel = { x: (d.current.x - d.start.x) * LAUNCH_SCALE, y: (d.current.y - d.start.y) * LAUNCH_SCALE }
    addPlanet(makePlanet(d.start, vel, SIZES[settings.current.size], sun.current))
    play('launch')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement && (e.key === ' ' || e.key === 'Enter')) return
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      } else if (e.key === 'a') autoOrbit()
      else if (e.key === 'c') clearAll()
      else if (e.key === 's') setSlowMo((v) => !v)
      else if (e.key === 't') setTrails((v) => !v)
      else if (e.key === 'm') setMuted((v) => !v)
      else if (e.key === '1') setSize('small')
      else if (e.key === '2') setSize('medium')
      else if (e.key === '3') setSize('big')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [autoOrbit, clearAll])

  return (
    <div className="app">
      <canvas
        ref={canvasRef}
        className="sky"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        aria-label="Space. Drag to throw a planet around the sun."
      />

      <header className="hud">
        <h1>Orbit Playground</h1>
        <div className="stats">
          <span title="Planets in space">🪐 {stats.alive}</span>
          <span title="Total orbits completed">⭐ {stats.orbits}</span>
          <span title="Most orbits by one planet">🏆 {stats.best}</span>
        </div>
      </header>

      {!hasInteracted && (
        <div className="hint" aria-live="polite">
          <p className="hint-big">Drag anywhere to throw a planet!</p>
          <p>Throw it sideways past the sun to make it orbit. Every lap earns a ⭐</p>
        </div>
      )}

      {paused && <div className="paused-badge">Paused</div>}

      <nav className="toolbar" aria-label="Controls">
        <div className="group" role="radiogroup" aria-label="Planet size">
          {(Object.keys(SIZES) as SizeKey[]).map((k) => (
            <button
              key={k}
              role="radio"
              aria-checked={size === k}
              className={`size-btn ${size === k ? 'active' : ''}`}
              onClick={() => setSize(k)}
              title={`${k[0].toUpperCase() + k.slice(1)} planet`}
            >
              <span className="dot" style={{ width: SIZES[k] * 1.1, height: SIZES[k] * 1.1 }} />
            </button>
          ))}
        </div>
        <div className="group">
          <button className="btn primary" onClick={autoOrbit} title="Add a planet in a perfect orbit (A)">
            ✨ Magic orbit
          </button>
          <button className={`btn ${slowMo ? 'active' : ''}`} onClick={() => setSlowMo((v) => !v)} title="Slow motion (S)">
            🐢 Slow
          </button>
          <button className={`btn ${paused ? 'active' : ''}`} onClick={() => setPaused((v) => !v)} title="Pause (Space)">
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
        </div>
        <div className="group">
          <button className={`btn icon ${trails ? 'active' : ''}`} onClick={() => setTrails((v) => !v)} title="Trails (T)">
            〰
          </button>
          <button className="btn icon" onClick={() => setMuted((v) => !v)} title="Sound (M)">
            {muted ? '🔇' : '🔊'}
          </button>
          <button className="btn icon danger" onClick={clearAll} title="Clear all planets (C)">
            🧹
          </button>
        </div>
      </nav>
    </div>
  )
}
