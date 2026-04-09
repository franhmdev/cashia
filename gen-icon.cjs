// Genera apple-touch-icon.png 180×180 con fondo cuadrado — sin dependencias
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

const W = 180, H = 180;
const buf = Buffer.alloc(W * H * 4);

// Fondo purple #7c3aed → rgb(124, 58, 237)
for (let i = 0; i < W * H; i++) {
  buf[i*4+0] = 124; buf[i*4+1] = 58; buf[i*4+2] = 237; buf[i*4+3] = 255;
}

function setPixel(x, y, r, g, b, a) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (y * W + x) * 4;
  const al  = a / 255;
  buf[idx+0] = Math.round(buf[idx+0] * (1 - al) + r * al);
  buf[idx+1] = Math.round(buf[idx+1] * (1 - al) + g * al);
  buf[idx+2] = Math.round(buf[idx+2] * (1 - al) + b * al);
  buf[idx+3] = 255;
}

function stampCircle(cx, cy, radius, r, g, b) {
  const ri = Math.ceil(radius);
  for (let py = Math.floor(cy) - ri - 1; py <= Math.floor(cy) + ri + 1; py++) {
    for (let px = Math.floor(cx) - ri - 1; px <= Math.floor(cx) + ri + 1; px++) {
      const d = Math.sqrt((px - cx)**2 + (py - cy)**2);
      if (d < radius + 1) {
        const a = Math.min(1, (radius + 0.5 - d)) * 255;
        if (a > 0) setPixel(px, py, r, g, b, a);
      }
    }
  }
}

function qBezier(x0, y0, cpx, cpy, x1, y1, w, r, g, b) {
  const steps = Math.ceil(
    Math.max(
      Math.sqrt((cpx-x0)**2+(cpy-y0)**2),
      Math.sqrt((x1-cpx)**2+(y1-cpy)**2)
    ) * 3
  );
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, nt = 1 - t;
    const nx = nt*nt*x0 + 2*nt*t*cpx + t*t*x1;
    const ny = nt*nt*y0 + 2*nt*t*cpy + t*t*y1;
    stampCircle(nx, ny, w / 2, r, g, b);
  }
}

// Escala: SVG viewBox 72×72 → 180×180
const sc = 180 / 72;
const sw = 3.5 * sc; // stroke-width escalado

// Wave: M8 36 Q17 20 27 36  Q36 52 46 36  Q56 20 64 28
qBezier(8*sc, 36*sc,  17*sc, 20*sc, 27*sc, 36*sc, sw, 255, 255, 255);
qBezier(27*sc, 36*sc, 36*sc, 52*sc, 46*sc, 36*sc, sw, 255, 255, 255);
qBezier(46*sc, 36*sc, 56*sc, 20*sc, 64*sc, 28*sc, sw, 255, 255, 255);

// Dot: cx=36 cy=56 r=5
stampCircle(36*sc, 56*sc, 5*sc, 255, 255, 255);

// ─── PNG encoder ──────────────────────────────────────────────────────────────
function crc32(data) {
  let c = 0xFFFFFFFF;
  for (const b of data) { c ^= b; for (let i = 0; i < 8; i++) c = (c & 1) ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; }
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t   = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0; // 8-bit RGB

const rawRows = [];
for (let y = 0; y < H; y++) {
  const row = Buffer.alloc(1 + W * 3);
  row[0] = 0;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    row[1 + x*3]   = buf[i];
    row[1 + x*3+1] = buf[i+1];
    row[1 + x*3+2] = buf[i+2];
  }
  rawRows.push(row);
}

const pngBuf = Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', zlib.deflateSync(Buffer.concat(rawRows))),
  pngChunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, 'public', 'apple-touch-icon.png');
fs.writeFileSync(out, pngBuf);
console.log('✓ Generated', out, `(${pngBuf.length} bytes)`);
