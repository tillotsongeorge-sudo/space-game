import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import {
  burst,
  circularVelocity,
  makePlanet,
  pickAt,
  SIZES,
  step,
  SUN_RADIUS,
  type Particle,
  type Planet,
  type Popup,
  type Vec,
} from './game/sim'
import { drawCharacter } from './game/characters'
import { sounds } from './game/sound'
import sunFaceUrl from './assets/sun-face.png'

const sunFace = new Image()
sunFace.src = sunFaceUrl
// Square crop of the source photo centred on the face, in image pixels.
const SUN_FACE_CROP = { x: 30, y: 15, size: 225 }

const MAX_ALIVE = 16
const START_COUNT = 3
const COMBO_WINDOW_MS = 1200
const MAX_COMBO = 5
const BEST_KEY = 'spooky-pop-best'
const SIZE_LIST = Object.values(SIZES)
const POINTS: Record<number, number> = { [SIZES.small]: 3, [SIZES.medium]: 2, [SIZES.big]: 1 }

type Star = { x: number; y: number; r: number; twinkle: number }
type Ring = { x: number; y: number; r: number; color: string; life: number }

function makeStars(w: number, h: number): Star[] {
  const count = Math.floor((w * h) / 2500)
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.4 + 0.2,
    twinkle: Math.random() * Math.PI * 2,
  }))
}

function spawnInterval(popped: number) {
  return Math.max(0.5, 1.4 - popped * 0.015)
}

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const planets = useRef<Planet[]>([])
  const particles = useRef<Particle[]>([])
  const popups = useRef<Popup[]>([])
  const rings = useRef<Ring[]>([])
  const stars = useRef<Star[]>([])
  const sun = useRef<Vec>({ x: 0, y: 0 })
  const [initialBest] = useState(loadBest)
  const game = useRef({ score: 0, popped: 0, best: initialBest, combo: 0, lastPop: 0, spawnTimer: 0 })

  const [paused, setPaused] = useState(false)
  const [slowMo, setSlowMo] = useState(false)
  const [trails, setTrails] = useState(true)
  const [muted, setMuted] = useState(false)
  const [stats, setStats] = useState({ score: 0, popped: 0, best: initialBest })
  const [hasPopped, setHasPopped] = useState(false)

  const settings = useRef({ paused, slowMo, trails, muted })
  useEffect(() => {
    settings.current = { paused, slowMo, trails, muted }
  }, [paused, slowMo, trails, muted])

  const play = useCallback(<K extends keyof typeof sounds>(name: K, ...args: Parameters<(typeof sounds)[K]>) => {
    if (settings.current.muted) return
    ;(sounds[name] as (...a: unknown[]) => void)(...args)
  }, [])

  const spawn = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || planets.current.length >= MAX_ALIVE) return
    const s = sun.current
    const maxR = Math.min(canvas.clientWidth, canvas.clientHeight) / 2 - 30
    const dist = 100 + Math.random() * Math.max(40, maxR - 100)
    const a = Math.random() * Math.PI * 2
    const pos = { x: s.x + Math.cos(a) * dist, y: s.y + Math.sin(a) * dist }
    const v = circularVelocity(pos, s, Math.random() < 0.5)
    const k = 0.9 + Math.random() * 0.15
    const r = SIZE_LIST[Math.floor(Math.random() * SIZE_LIST.length)]
    planets.current.push(makePlanet(pos, { x: v.x * k, y: v.y * k }, r))
  }, [])

  const restart = useCallback(() => {
    for (const p of planets.current) particles.current.push(...burst(p, p.color, 10, 120))
    planets.current = []
    const g = game.current
    g.score = 0
    g.popped = 0
    g.combo = 0
    g.spawnTimer = 0
    for (let i = 0; i < START_COUNT; i++) spawn()
    setStats({ score: 0, popped: 0, best: g.best })
  }, [spawn])

  const explode = useCallback(
    (p: Planet) => {
      planets.current = planets.current.filter((q) => q !== p)
      const g = game.current
      const now = performance.now()
      g.combo = now - g.lastPop < COMBO_WINDOW_MS ? Math.min(g.combo + 1, MAX_COMBO) : 1
      g.lastPop = now
      const points = (POINTS[p.r] ?? 1) * g.combo
      g.score += points
      g.popped++
      if (g.score > g.best) {
        g.best = g.score
        try {
          localStorage.setItem(BEST_KEY, String(g.best))
        } catch {
          // Storage can be unavailable (private mode); the best score just won't persist.
        }
      }
      particles.current.push(...burst(p, p.color, 28, 280), ...burst(p, '#ffffff', 10, 200), ...burst(p, '#ffd36b', 8, 160))
      rings.current.push({ x: p.x, y: p.y, r: p.r, color: p.color, life: 1 })
      popups.current.push({ x: p.x, y: p.y - p.r - 8, text: `+${points}`, life: 1 })
      if (g.combo > 1) popups.current.push({ x: p.x, y: p.y - p.r - 32, text: `Combo x${g.combo}!`, life: 1.2 })
      play('pop')
      if (g.combo > 1) play('combo', g.combo)
      setHasPopped(true)
    },
    [play],
  )

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
    if (!planets.current.length) for (let i = 0; i < START_COUNT; i++) spawn()

    const frame = (now: number) => {
      const rawDt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const { paused, slowMo, trails } = settings.current
      const dt = paused ? 0 : rawDt * (slowMo ? 0.3 : 1)
      const s = sun.current
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const g = game.current

      if (dt > 0) {
        g.spawnTimer += dt
        if (g.spawnTimer >= spawnInterval(g.popped)) {
          g.spawnTimer = 0
          spawn()
        }
        const res = step(planets.current, s, dt, trails)
        planets.current = res.planets
        for (const p of res.events.sunHits) {
          particles.current.push(...burst(p, '#ffd36b', 26, 220), ...burst(p, p.color, 12, 160))
          play('sizzle')
        }
        for (const q of particles.current) {
          q.x += q.vx * dt
          q.y += q.vy * dt
          q.vx *= 0.97
          q.vy *= 0.97
          q.life -= dt * 1.2
        }
        particles.current = particles.current.filter((q) => q.life > 0)
        for (const ring of rings.current) {
          ring.r += 220 * dt
          ring.life -= dt * 2.5
        }
        rings.current = rings.current.filter((ring) => ring.life > 0)
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
        drawCharacter(ctx, p.kind, p.x, p.y, p.r * (0.5 + 0.5 * age), now, p.id)
      }

      for (const ring of rings.current) {
        ctx.globalAlpha = Math.max(0, ring.life)
        ctx.strokeStyle = ring.color
        ctx.lineWidth = 4 * ring.life
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2)
        ctx.stroke()
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
      ctx.font = '800 22px "Baloo 2", system-ui, sans-serif'
      for (const pop of popups.current) {
        ctx.globalAlpha = Math.max(0, Math.min(1, pop.life))
        ctx.fillStyle = '#ffe66d'
        ctx.fillText(pop.text, pop.x, pop.y)
      }
      ctx.globalAlpha = 1

      statTimer += rawDt
      if (statTimer > 0.2) {
        statTimer = 0
        setStats({ score: g.score, popped: g.popped, best: g.best })
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [play, spawn])

  const onPointerDown = (e: React.PointerEvent) => {
    if (settings.current.paused) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const hit = pickAt(planets.current, { x: e.clientX - rect.left, y: e.clientY - rect.top })
    if (hit) explode(hit)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement && (e.key === ' ' || e.key === 'Enter')) return
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      } else if (e.key === 'r') restart()
      else if (e.key === 's') setSlowMo((v) => !v)
      else if (e.key === 't') setTrails((v) => !v)
      else if (e.key === 'm') setMuted((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restart])

  return (
    <div className="app">
      <canvas
        ref={canvasRef}
        className="sky"
        onPointerDown={onPointerDown}
        aria-label="Space. Tap the critters orbiting the sun to pop them."
      />

      <header className="hud">
        <h1>Orbit Playground</h1>
        <div className="stats">
          <span title="Score">⭐ {stats.score}</span>
          <span title="Critters popped">💥 {stats.popped}</span>
          <span title="Best score">🏆 {stats.best}</span>
        </div>
      </header>

      {!hasPopped && (
        <div className="hint" aria-live="polite">
          <p className="hint-big">Tap the critters to pop them!</p>
          <p>Little ones are worth more. Pop them fast for a combo!</p>
        </div>
      )}

      {paused && <div className="paused-badge">Paused</div>}

      <nav className="toolbar" aria-label="Controls">
        <div className="group">
          <button className={`btn ${slowMo ? 'active' : ''}`} onClick={() => setSlowMo((v) => !v)} title="Slow motion (S)">
            🐢 Slow
          </button>
          <button className={`btn ${paused ? 'active' : ''}`} onClick={() => setPaused((v) => !v)} title="Pause (Space)">
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button className="btn primary" onClick={restart} title="Start over (R)">
            🔄 Restart
          </button>
        </div>
        <div className="group">
          <button className={`btn icon ${trails ? 'active' : ''}`} onClick={() => setTrails((v) => !v)} title="Trails (T)">
            〰
          </button>
          <button className="btn icon" onClick={() => setMuted((v) => !v)} title="Sound (M)">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </nav>
    </div>
  )
}
