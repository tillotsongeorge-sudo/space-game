export const CHARACTERS = {
  pumpkin: '#ff8a1f',
  spider: '#9b6bff',
  ghost: '#e8f0ff',
  vampire: '#e0304e',
  bat: '#ff5ca8',
  skull: '#7ee0ff',
  mummy: '#d9c39a',
  witch: '#7ed957',
  cat: '#ffd23f',
} as const

export type CharacterKind = keyof typeof CHARACTERS

const KINDS = Object.keys(CHARACTERS) as CharacterKind[]

export function randomCharacter(): CharacterKind {
  return KINDS[Math.floor(Math.random() * KINDS.length)]
}

type Ctx = CanvasRenderingContext2D

function eye(ctx: Ctx, x: number, y: number, r: number, blink: boolean, iris = '#1b1240', white = true) {
  if (blink) {
    ctx.fillStyle = '#1b1240'
    ctx.beginPath()
    ctx.ellipse(x, y, r, Math.max(0.6, r * 0.2), 0, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  if (white) {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = iris
  ctx.beginPath()
  ctx.arc(x, y + r * 0.1, white ? r * 0.5 : r, 0, Math.PI * 2)
  ctx.fill()
}

function pumpkin(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = '#4a8a2a'
  ctx.fillRect(x - r * 0.1, y - r * 1.05, r * 0.2, r * 0.35)
  ctx.fillStyle = CHARACTERS.pumpkin
  ctx.strokeStyle = '#c85a00'
  ctx.lineWidth = Math.max(1, r * 0.06)
  for (const [dx, rx] of [
    [-0.42, 0.55],
    [0.42, 0.55],
    [0, 0.5],
  ]) {
    ctx.beginPath()
    ctx.ellipse(x + dx * r, y + r * 0.05, rx * r, r * 0.85, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  ctx.fillStyle = '#3a1600'
  for (const side of [-1, 1]) {
    const ex = x + side * r * 0.35
    const ey = y - r * 0.12
    ctx.beginPath()
    ctx.moveTo(ex - r * 0.16, ey + r * 0.1)
    ctx.lineTo(ex + r * 0.16, ey + r * 0.1)
    ctx.lineTo(ex, ey - r * 0.18)
    ctx.closePath()
    ctx.fill()
  }
  ctx.beginPath()
  ctx.moveTo(x - r * 0.55, y + r * 0.22)
  ctx.lineTo(x - r * 0.28, y + r * 0.36)
  ctx.lineTo(x - r * 0.1, y + r * 0.24)
  ctx.lineTo(x + r * 0.1, y + r * 0.36)
  ctx.lineTo(x + r * 0.28, y + r * 0.24)
  ctx.lineTo(x + r * 0.55, y + r * 0.22)
  ctx.quadraticCurveTo(x, y + r * 0.85, x - r * 0.55, y + r * 0.22)
  ctx.fill()
}

function spider(ctx: Ctx, x: number, y: number, r: number, blink: boolean, t: number, seed: number) {
  ctx.strokeStyle = '#6b5a8a'
  ctx.lineWidth = Math.max(1.2, r * 0.1)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const a = -0.65 + i * 0.42 + Math.sin(t / 140 + i * 1.3 + seed) * 0.12
      ctx.beginPath()
      ctx.moveTo(x + side * r * 0.5, y + Math.sin(a) * r * 0.4)
      ctx.lineTo(x + side * Math.cos(a) * r * 1.0, y + Math.sin(a) * r * 1.0 - r * 0.3)
      ctx.lineTo(x + side * Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35 + r * 0.25)
      ctx.stroke()
    }
  }
  ctx.fillStyle = '#2a2238'
  ctx.strokeStyle = CHARACTERS.spider
  ctx.lineWidth = Math.max(1, r * 0.06)
  ctx.beginPath()
  ctx.arc(x, y, r * 0.75, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  for (const side of [-1, 1]) eye(ctx, x + side * r * 0.28, y - r * 0.12, r * 0.22, blink)
  ctx.fillStyle = '#ffffff'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x + side * r * 0.2, y + r * 0.3)
    ctx.lineTo(x + side * r * 0.04, y + r * 0.3)
    ctx.lineTo(x + side * r * 0.12, y + r * 0.52)
    ctx.closePath()
    ctx.fill()
  }
}

function ghost(ctx: Ctx, x: number, y: number, r: number, blink: boolean, t: number, seed: number) {
  const bottom = y + r * 0.8
  const wave = Math.sin(t / 180 + seed) * r * 0.1
  const scallops = 3
  const seg = (r * 1.8) / scallops
  ctx.fillStyle = CHARACTERS.ghost
  ctx.beginPath()
  ctx.arc(x, y - r * 0.1, r * 0.9, Math.PI, 0)
  ctx.lineTo(x + r * 0.9, bottom)
  for (let i = 0; i < scallops; i++) {
    const x0 = x + r * 0.9 - i * seg
    ctx.quadraticCurveTo(x0 - seg / 2, bottom + r * 0.3 + (i % 2 ? wave : -wave), x0 - seg, bottom)
  }
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#1b1240'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(x + side * r * 0.32, y - r * 0.15, r * 0.14, blink ? r * 0.04 : r * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.32, r * 0.14, r * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()
}

function vampire(ctx: Ctx, x: number, y: number, r: number, blink: boolean) {
  ctx.fillStyle = '#b3122e'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x + side * r * 0.9, y + r * 0.1)
    ctx.lineTo(x + side * r * 0.15, y + r * 0.8)
    ctx.lineTo(x + side * r * 1.1, y + r * 1.0)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = '#dfe6f5'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.85, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.fillStyle = '#1b1430'
  ctx.beginPath()
  ctx.moveTo(x - r, y - r)
  ctx.lineTo(x + r, y - r)
  ctx.lineTo(x + r, y - r * 0.3)
  ctx.quadraticCurveTo(x + r * 0.4, y - r * 0.6, x, y - r * 0.2)
  ctx.quadraticCurveTo(x - r * 0.4, y - r * 0.6, x - r, y - r * 0.3)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  for (const side of [-1, 1]) eye(ctx, x + side * r * 0.3, y + r * 0.02, r * 0.16, blink, '#c8102e')
  ctx.strokeStyle = '#1b1430'
  ctx.lineWidth = Math.max(1, r * 0.07)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y + r * 0.12, r * 0.32, 0.2 * Math.PI, 0.8 * Math.PI)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  for (const side of [-1, 1]) {
    const fx = x + side * r * 0.14
    const fy = y + r * 0.4
    ctx.beginPath()
    ctx.moveTo(fx - r * 0.07, fy)
    ctx.lineTo(fx + r * 0.07, fy)
    ctx.lineTo(fx, fy + r * 0.2)
    ctx.closePath()
    ctx.fill()
  }
}

function bat(ctx: Ctx, x: number, y: number, r: number, blink: boolean, t: number, seed: number) {
  const f = Math.sin(t / 90 + seed) * 0.3
  ctx.fillStyle = '#3b2f5c'
  ctx.strokeStyle = CHARACTERS.bat
  ctx.lineWidth = Math.max(1, r * 0.05)
  ctx.lineJoin = 'round'
  for (const s of [-1, 1]) {
    const px = (u: number) => x + s * u * r
    const py = (v: number) => y + v * r
    const tip = { u: 1.4, v: -0.45 - f }
    const p1 = { u: 1.0, v: 0.1 - f * 0.5 }
    const p2 = { u: 0.65, v: 0.15 - f * 0.2 }
    ctx.beginPath()
    ctx.moveTo(px(0.3), py(-0.2))
    ctx.quadraticCurveTo(px(0.85), py(-0.75 - f), px(tip.u), py(tip.v))
    ctx.quadraticCurveTo(px((tip.u + p1.u) / 2), py((tip.v + p1.v) / 2 - 0.05), px(p1.u), py(p1.v))
    ctx.quadraticCurveTo(px((p1.u + p2.u) / 2), py((p1.v + p2.v) / 2 - 0.15), px(p2.u), py(p2.v))
    ctx.quadraticCurveTo(px(0.47), py(0.05), px(0.3), py(0.25))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(px(0.12), py(-0.4))
    ctx.lineTo(px(0.38), py(-0.82))
    ctx.lineTo(px(0.45), py(-0.3))
    ctx.closePath()
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(x, y, r * 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  for (const s of [-1, 1]) eye(ctx, x + s * r * 0.2, y - r * 0.08, r * 0.15, blink)
  ctx.fillStyle = '#ffffff'
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x + s * r * 0.15, y + r * 0.18)
    ctx.lineTo(x + s * r * 0.03, y + r * 0.18)
    ctx.lineTo(x + s * r * 0.09, y + r * 0.34)
    ctx.closePath()
    ctx.fill()
  }
}

function skull(ctx: Ctx, x: number, y: number, r: number, blink: boolean) {
  ctx.fillStyle = '#f4f1e6'
  ctx.beginPath()
  ctx.arc(x, y - r * 0.12, r * 0.82, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x - r * 0.45, y + r * 0.25, r * 0.9, r * 0.55, r * 0.18)
  ctx.fill()
  ctx.fillStyle = '#2a2238'
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(x + s * r * 0.3, y - r * 0.12, r * 0.22, r * 0.26, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  if (!blink) {
    ctx.fillStyle = CHARACTERS.skull
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(x + s * r * 0.3, y - r * 0.08, r * 0.08, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.fillStyle = '#2a2238'
  ctx.beginPath()
  ctx.moveTo(x, y + r * 0.12)
  ctx.lineTo(x - r * 0.1, y + r * 0.3)
  ctx.lineTo(x + r * 0.1, y + r * 0.3)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#2a2238'
  ctx.lineWidth = Math.max(0.8, r * 0.05)
  ctx.beginPath()
  ctx.moveTo(x - r * 0.32, y + r * 0.55)
  ctx.lineTo(x + r * 0.32, y + r * 0.55)
  for (const dx of [-0.2, 0, 0.2]) {
    ctx.moveTo(x + dx * r, y + r * 0.42)
    ctx.lineTo(x + dx * r, y + r * 0.7)
  }
  ctx.stroke()
}

function mummy(ctx: Ctx, x: number, y: number, r: number, blink: boolean, t: number, seed: number) {
  const sway = Math.sin(t / 220 + seed) * r * 0.15
  ctx.strokeStyle = '#e8dcc0'
  ctx.lineWidth = Math.max(1.5, r * 0.16)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x + r * 0.45, y + r * 0.6)
  ctx.quadraticCurveTo(x + r * 0.8 + sway, y + r * 0.9, x + r * 0.6 + sway, y + r * 1.25)
  ctx.stroke()
  ctx.fillStyle = '#e8dcc0'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.85, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.strokeStyle = '#c4ad82'
  ctx.lineWidth = Math.max(0.8, r * 0.06)
  for (const [y0, tilt] of [
    [-0.7, 0.15],
    [-0.45, -0.12],
    [0.3, 0.1],
    [0.55, -0.15],
    [0.78, 0.08],
  ]) {
    ctx.beginPath()
    ctx.moveTo(x - r, y + (y0 - tilt) * r)
    ctx.lineTo(x + r, y + (y0 + tilt) * r)
    ctx.stroke()
  }
  ctx.fillStyle = '#3a2a1a'
  ctx.fillRect(x - r, y - r * 0.28, r * 2, r * 0.42)
  ctx.restore()
  eye(ctx, x - r * 0.3, y - r * 0.07, r * 0.2, blink)
  eye(ctx, x + r * 0.32, y - r * 0.07, r * 0.14, blink)
}

function witch(ctx: Ctx, x: number, y: number, r: number, blink: boolean) {
  ctx.fillStyle = '#9b6bff'
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(x + s * r * 0.68, y + r * 0.2, r * 0.22, r * 0.5, s * 0.25, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = CHARACTERS.witch
  ctx.beginPath()
  ctx.arc(x, y + r * 0.15, r * 0.72, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2b1f45'
  ctx.beginPath()
  ctx.moveTo(x - r * 0.55, y - r * 0.4)
  ctx.quadraticCurveTo(x - r * 0.1, y - r * 0.9, x + r * 0.5, y - r * 1.4)
  ctx.quadraticCurveTo(x + r * 0.2, y - r * 0.9, x + r * 0.55, y - r * 0.4)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#ff8a1f'
  ctx.fillRect(x - r * 0.48, y - r * 0.62, r * 0.98, r * 0.14)
  ctx.fillStyle = '#2b1f45'
  ctx.beginPath()
  ctx.ellipse(x, y - r * 0.42, r * 1.05, r * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()
  for (const s of [-1, 1]) eye(ctx, x + s * r * 0.27, y + r * 0.02, r * 0.15, blink)
  ctx.fillStyle = '#5bb83a'
  ctx.beginPath()
  ctx.ellipse(x + r * 0.04, y + r * 0.26, r * 0.11, r * 0.16, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2b1f45'
  ctx.lineWidth = Math.max(1, r * 0.07)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y + r * 0.28, r * 0.32, 0.25 * Math.PI, 0.75 * Math.PI)
  ctx.stroke()
}

function cat(ctx: Ctx, x: number, y: number, r: number, blink: boolean) {
  ctx.fillStyle = '#2a2533'
  ctx.strokeStyle = '#8a7bb0'
  ctx.lineWidth = Math.max(1, r * 0.05)
  ctx.lineJoin = 'round'
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x + s * r * 0.2, y - r * 0.6)
    ctx.lineTo(x + s * r * 0.68, y - r * 1.05)
    ctx.lineTo(x + s * r * 0.8, y - r * 0.25)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(x, y, r * 0.82, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ff8fb3'
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x + s * r * 0.36, y - r * 0.62)
    ctx.lineTo(x + s * r * 0.64, y - r * 0.88)
    ctx.lineTo(x + s * r * 0.7, y - r * 0.45)
    ctx.closePath()
    ctx.fill()
  }
  for (const s of [-1, 1]) {
    const ex = x + s * r * 0.32
    const ey = y - r * 0.1
    if (blink) {
      ctx.strokeStyle = CHARACTERS.cat
      ctx.lineWidth = Math.max(1, r * 0.06)
      ctx.beginPath()
      ctx.moveTo(ex - r * 0.16, ey)
      ctx.lineTo(ex + r * 0.16, ey)
      ctx.stroke()
      continue
    }
    ctx.fillStyle = CHARACTERS.cat
    ctx.beginPath()
    ctx.ellipse(ex, ey, r * 0.18, r * 0.14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.ellipse(ex, ey, r * 0.04, r * 0.13, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#ff8fb3'
  ctx.beginPath()
  ctx.moveTo(x - r * 0.08, y + r * 0.12)
  ctx.lineTo(x + r * 0.08, y + r * 0.12)
  ctx.lineTo(x, y + r * 0.22)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#d8d0ee'
  ctx.lineWidth = Math.max(0.7, r * 0.035)
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (const s of [-1, 1]) {
    for (const dy of [-0.06, 0.06]) {
      ctx.moveTo(x + s * r * 0.25, y + r * (0.22 + dy))
      ctx.lineTo(x + s * r * 0.85, y + r * (0.18 + dy * 2.5))
    }
  }
  ctx.moveTo(x, y + r * 0.22)
  ctx.quadraticCurveTo(x - r * 0.08, y + r * 0.36, x - r * 0.16, y + r * 0.28)
  ctx.moveTo(x, y + r * 0.22)
  ctx.quadraticCurveTo(x + r * 0.08, y + r * 0.36, x + r * 0.16, y + r * 0.28)
  ctx.stroke()
}

export function drawCharacter(ctx: Ctx, kind: CharacterKind, x: number, y: number, r: number, t: number, seed: number) {
  const blink = Math.sin(t / 900 + seed * 1.7) > 0.985
  switch (kind) {
    case 'pumpkin':
      return pumpkin(ctx, x, y, r)
    case 'spider':
      return spider(ctx, x, y, r, blink, t, seed)
    case 'ghost':
      return ghost(ctx, x, y, r, blink, t, seed)
    case 'vampire':
      return vampire(ctx, x, y, r, blink)
    case 'bat':
      return bat(ctx, x, y, r, blink, t, seed)
    case 'skull':
      return skull(ctx, x, y, r, blink)
    case 'mummy':
      return mummy(ctx, x, y, r, blink, t, seed)
    case 'witch':
      return witch(ctx, x, y, r, blink)
    case 'cat':
      return cat(ctx, x, y, r, blink)
  }
}
