export const CHARACTERS = {
  frog: '#5ccf5a',
  pumpkin: '#ff8a1f',
  spider: '#9b6bff',
  ghost: '#e8f0ff',
  vampire: '#e0304e',
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

function frog(ctx: Ctx, x: number, y: number, r: number, blink: boolean) {
  ctx.fillStyle = CHARACTERS.frog
  ctx.beginPath()
  ctx.arc(x, y + r * 0.1, r * 0.9, 0, Math.PI * 2)
  ctx.arc(x - r * 0.42, y - r * 0.55, r * 0.34, 0, Math.PI * 2)
  ctx.arc(x + r * 0.42, y - r * 0.55, r * 0.34, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#9be88f'
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.45, r * 0.5, r * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  for (const side of [-1, 1]) eye(ctx, x + side * r * 0.42, y - r * 0.58, r * 0.24, blink)
  ctx.strokeStyle = '#1d5e22'
  ctx.lineWidth = Math.max(1, r * 0.08)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y - r * 0.05, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,120,160,0.5)'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(x + side * r * 0.6, y + r * 0.15, r * 0.12, 0, Math.PI * 2)
    ctx.fill()
  }
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

export function drawCharacter(ctx: Ctx, kind: CharacterKind, x: number, y: number, r: number, t: number, seed: number) {
  const blink = Math.sin(t / 900 + seed * 1.7) > 0.985
  switch (kind) {
    case 'frog':
      return frog(ctx, x, y, r, blink)
    case 'pumpkin':
      return pumpkin(ctx, x, y, r)
    case 'spider':
      return spider(ctx, x, y, r, blink, t, seed)
    case 'ghost':
      return ghost(ctx, x, y, r, blink, t, seed)
    case 'vampire':
      return vampire(ctx, x, y, r, blink)
  }
}
