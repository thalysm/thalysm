// Gera os SVGs do README (versões clara e escura) em assets/.
// Uso: node scripts/build.mjs   (precisa de internet na 1ª vez para baixar as fontes)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets');
const CACHE = path.join(ROOT, 'scripts', '.fonts');

// ───────────────────────── conteúdo ─────────────────────────

const ROLES = ['engenheiro de computação', 'cientista de dados', 'ui/ux designer', 'dev full stack'];
const HERO_CHIPS = ['Flutter', 'Python', 'React', 'FastAPI', 'Figma'];
const MARQUEE = ['DADOS', 'UI/UX', 'MOBILE', 'WEB', 'MACHINE LEARNING', 'DEVOPS', 'DESIGN SYSTEMS'];

const SECTIONS = [
  { slug: 'sobre', n: '01', label: 'SOBRE MIM', hint: '// quem sou eu' },
  { slug: 'stack', n: '02', label: 'STACK', hint: '// ferramentas do dia a dia' },
  { slug: 'projetos', n: '03', label: 'PROJETOS', hint: '// coisas que construí' },
  { slug: 'blog', n: '04', label: 'BLOG', hint: '// escritos recentes' },
  { slug: 'atividade', n: '05', label: 'ATIVIDADE', hint: '// commits por aí' },
];

const EDUCATION = [
  { years: '2024 - 2025', title: 'Pós em Ciência de Dados', place: 'Instituto Federal do Triângulo Mineiro' },
  { years: '2023 - 2024', title: 'Carreira UI/UX Design', place: 'CoderHouse' },
  { years: '2017 - 2022', title: 'Engenharia da Computação', place: 'Instituto Federal do Triângulo Mineiro' },
];

export const PROJECTS = [
  { slug: 'atlas', mono: 'A', color: '#FF7A1A', cat: 'mobile · web · wearables', status: 'no ar', live: true,
    title: 'Atlas', tech: ['Next.js', 'FastAPI', 'MongoDB', 'Flutter'],
    desc: 'Plataforma de treino para musculação e CrossFit: planos e WODs, registro em tempo real, PRs, grupos de competição e apps para relógio.' },
  { slug: 'concord', mono: 'C', color: '#8B7CFF', cat: 'desktop · tempo real', status: 'privado',
    title: 'Concord', tech: ['Flutter', 'Go', 'WebRTC', 'Docker'],
    desc: 'App de voz e chat no estilo Discord, com WebRTC, supressão de ruído (RNNoise) e transcrição local com Whisper.' },
  { slug: 'rachinha', mono: 'R', color: '#FFD23F', cat: 'mobile · web', status: 'no ar', live: true,
    title: 'Rachinha.com', tech: ['Flutter', 'React', 'FastAPI', 'WebSocket'],
    desc: 'Agendamento de quadras e organização de rachas: reservas, times equilibrados por nível, finanças do grupo e chat ao vivo.' },
  { slug: 'growthhub', mono: 'G', color: '#2BD67B', cat: 'saas · ia', status: 'privado',
    title: 'GrowthHub', tech: ['TypeScript', 'IA', 'Automação'],
    desc: 'Gestão de conteúdo para redes sociais com IA: kanban de ideias, agendamento em várias redes e DMs automáticas no Instagram.' },
  { slug: 'duo', mono: 'D', color: '#FF5C8A', cat: 'machine learning', status: 'open source',
    title: 'Duo', tech: ['Python', 'FastAPI', 'Embeddings', 'Docker'],
    desc: 'Recomendação de filmes para duas pessoas com NLP e embeddings: cada um diz o que gosta e o Duo acha o meio-termo.' },
  { slug: 'gameserverhub', mono: 'GS', color: '#5093FE', cat: 'devops · open source', status: 'open source',
    title: 'Game Server Hub', tech: ['Next.js', 'TypeScript', 'Docker'],
    desc: 'Painel para subir, configurar e monitorar servidores de jogos em Docker, sem precisar abrir o terminal.' },
  { slug: 'codau', mono: 'Cd', color: '#14C8B4', cat: 'ui/ux · estudo de caso', status: 'behance',
    title: 'Redesign CODAU', tech: ['Figma', 'UX Research', 'UI'],
    desc: 'Estudo de caso para modernizar o portal de atendimento do CODAU, com uma experiência mais clara e acessível ao cidadão.' },
  { slug: 'bleave', mono: 'bL', color: '#FF6B4A', cat: 'ui/ux · estudo de caso', status: 'behance',
    title: 'bLeave', tech: ['Figma', 'Prototipação', 'UI'],
    desc: 'Rede social simples para compartilhar fotos, vídeos e mensagens, com protótipos interativos e testes de usabilidade.' },
];

const POSTS = [
  { slug: 'post-duo', date: '17 NOV 2025', title: 'Como usei Inteligência Artificial para recomendar filmes no Duo?' },
  { slug: 'post-coolify', date: '17 NOV 2025', title: 'Coolify: a forma mais simples (e gratuita) de colocar projetos no ar' },
  { slug: 'post-hello', date: '16 NOV 2025', title: 'Hello World. Bem-vindo ao meu portfólio!' },
];

const LINKS = [
  { slug: 'portfolio', label: 'Portfólio', sub: 'thalys.btreedevs.com.br', icon: 'globe', primary: true },
  { slug: 'blog', label: 'Blog', sub: 'artigos e tutoriais', icon: 'pen' },
  { slug: 'behance', label: 'Behance', sub: '/thalysmarquesc', icon: 'be' },
  { slug: 'instagram', label: 'Instagram', sub: '@thalysmarquesc', icon: 'ig' },
];

const FOOTER = ['OBRIGADO PELA VISITA', 'THALYS MARQUES', 'VOLTE SEMPRE', 'UBERABA · MG'];

// ───────────────────────── tema ─────────────────────────

const THEMES = {
  light: {
    bg: '#F2F2F2', surface: '#FFFFFF', ink: '#0A0A0A', muted: '#5F5F5F', line: '#0A0A0A',
    shadow: '#0A0A0A', accent: '#5093FE', band: '#0A0A0A', onBand: '#F2F2F2', dots: 0.16,
    kw: '#D6336C', str: '#1F6FEB', key: '#0A0A0A', punct: '#8A8A8A', gutter: '#B5B5B5',
  },
  dark: {
    bg: '#161B22', surface: '#0D1117', ink: '#F0F6FC', muted: '#9DA7B3', line: '#F0F6FC',
    shadow: '#5093FE', accent: '#5093FE', band: '#F0F6FC', onBand: '#0D1117', dots: 0.14,
    kw: '#FF7AA8', str: '#8CC0FF', key: '#F0F6FC', punct: '#7D8590', gutter: '#484F58',
  },
};

// ───────────────────────── fontes ─────────────────────────

const FACES = {
  p400: ['Poppins', 400], p600: ['Poppins', 600], p800: ['Poppins', 800],
  m500: ['JetBrains Mono', 500], m800: ['JetBrains Mono', 800],
};
const glyphs = {}; // face -> Set de caracteres usados em todos os SVGs
const MONO = 0.6;  // avanço do JetBrains Mono em em
const monoW = (s, size, ls = 0) => [...s].length * (size * MONO + ls);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function canvas(th) {
  const faces = new Set();
  const use = (face, str) => {
    faces.add(face);
    glyphs[face] ??= new Set();
    for (const ch of str) glyphs[face].add(ch);
  };
  const text = (x, y, str, { face = 'p400', size = 16, fill = th.ink, anchor, ls, attrs = '' } = {}) => {
    use(face, str);
    return `<text x="${x}" y="${y}" font-family="${face}" font-size="${size}" fill="${fill}"` +
      `${anchor ? ` text-anchor="${anchor}"` : ''}${ls ? ` letter-spacing="${ls}"` : ''} ${attrs}>${esc(str)}</text>`;
  };
  // caixa "brutalista": borda grossa + sombra sólida deslocada
  const box = (x, y, w, h, { fill = th.surface, stroke = th.line, sw = 3, shadow = th.shadow, off = 8, attrs = '' } = {}) =>
    (off ? `<rect x="${x + off}" y="${y + off}" width="${w}" height="${h}" fill="${shadow}"/>` : '') +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${attrs}/>`;
  const chip = (x, y, label, { size = 15, h = 36, pad = 14, fill = th.surface, color = th.ink, off = 4 } = {}) => {
    const w = monoW(label, size) + pad * 2;
    return { w, svg: box(x, y, w, h, { fill, sw: 2.5, off }) + text(x + pad, y + h / 2 + size * 0.36, label, { face: 'm500', size, fill: color }) };
  };
  const arrow = (x, y, s, color = '#0A0A0A', sw = 3.5) =>
    `<path d="M${x + s * 0.3} ${y + s * 0.7}L${x + s * 0.7} ${y + s * 0.3}M${x + s * 0.38} ${y + s * 0.3}H${x + s * 0.7}V${y + s * 0.62}" ` +
    `fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="square"/>`;
  const doc = (w, h, title, body, css = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>` +
    `<style>/*FONTS:${[...faces].join(',')}*/${css}</style>${body}</svg>`;
  return { text, box, chip, arrow, doc, use };
}

// faixa de texto rolando infinitamente (mono, larguras exatas)
function marquee(c, th, items, { y, size = 22, ls = 2, fill = th.onBand, width = 1200, speed = 55, name = 'mq' }) {
  let x = 0, parts = '';
  for (const it of items) {
    parts += c.text(x, y, it, { face: 'm800', size, fill, ls });
    x += monoW(it, size, ls) + 20;
    const cy = y - size * 0.36;
    parts += `<rect x="${x}" y="${cy - 6}" width="12" height="12" fill="${th.accent}" transform="rotate(45 ${x + 6} ${cy})"/>`;
    x += 12 + 26;
  }
  const seg = x;
  const copies = Math.ceil(width / seg) + 1;
  let g = '';
  for (let i = 0; i < copies; i++) g += `<g transform="translate(${i * seg} 0)">${parts}</g>`;
  const css = `.${name}{animation:${name} ${(seg / speed).toFixed(2)}s linear infinite}@keyframes ${name}{to{transform:translateX(-${seg}px)}}`;
  return { svg: `<g class="${name}">${g}</g>`, css };
}

function wrap(str, max) {
  const lines = [''];
  for (const word of str.split(' ')) {
    const cur = lines[lines.length - 1];
    if ((cur + ' ' + word).trim().length > max) lines.push(word);
    else lines[lines.length - 1] = (cur + ' ' + word).trim();
  }
  return lines;
}

// ───────────────────────── peças ─────────────────────────

const avatar = `data:image/png;base64,${(await readFile(path.join(OUT, 'src', 'avatar.png'))).toString('base64')}`;

function header(th) {
  const c = canvas(th);
  const [W, H, X, Y, CW, CH] = [1200, 560, 4, 4, 1176, 540];
  let css = '', b = '';
  b += `<defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="${th.ink}" opacity="${th.dots}"/></pattern>` +
    `<clipPath id="card"><rect x="${X}" y="${Y}" width="${CW}" height="${CH}"/></clipPath>` +
    `<path id="ring" d="M690 158m-57 0a57 57 0 1 1 114 0a57 57 0 1 1-114 0"/></defs>`;
  b += c.box(X, Y, CW, CH, { fill: th.bg, sw: 4, off: 12 });
  b += `<rect x="${X}" y="${Y}" width="${CW}" height="${CH}" fill="url(#dots)"/>`;

  // barra de navegação, igual ao portfólio
  b += `<rect x="${X}" y="${Y}" width="${CW}" height="60" fill="${th.surface}" stroke="${th.line}" stroke-width="4"/>`;
  b += `<rect x="26" y="28" width="13" height="13" fill="${th.accent}" stroke="${th.line}" stroke-width="2"/>` +
    `<rect x="47" y="28" width="13" height="13" fill="${th.ink}" stroke="${th.line}" stroke-width="2"/>` +
    `<rect x="68" y="28" width="13" height="13" fill="none" stroke="${th.line}" stroke-width="2"/>`;
  b += c.text(102, 40, 'thalys.btreedevs.com.br', { face: 'm500', size: 15, fill: th.muted });
  b += c.box(716, 17, 90, 32, { sw: 3, off: 4 }) + c.text(761, 39, 'Início', { face: 'p600', size: 15, fill: th.accent, anchor: 'middle' });
  b += c.text(834, 39, 'Currículo', { face: 'p600', size: 15, fill: th.muted });
  b += c.text(942, 39, 'Projetos', { face: 'p600', size: 15, fill: th.muted });
  b += c.text(1036, 39, 'Blog', { face: 'p600', size: 15, fill: th.muted });
  b += c.text(1098, 39, 'PT', { face: 'p600', size: 15, fill: th.accent });
  b += c.text(1124, 39, '|', { face: 'p400', size: 15, fill: th.muted });
  b += c.text(1138, 39, 'EN', { face: 'p600', size: 15, fill: th.muted });

  // nome
  b += c.text(60, 128, 'Olá, meu nome é', { face: 'p400', size: 22, fill: th.accent });
  b += c.text(56, 228, 'Thalys', { face: 'p800', size: 100 });
  b += c.text(56, 330, 'Marques', { face: 'p800', size: 100 });

  // selo giratório
  b += `<circle cx="696" cy="164" r="80" fill="${th.shadow}"/><circle cx="690" cy="158" r="80" fill="${th.surface}" stroke="${th.line}" stroke-width="3"/>`;
  c.use('m800', 'ENGENHARIA · DADOS · DESIGN · ');
  b += `<g class="spin"><text font-family="m800" font-size="13" letter-spacing="2" fill="${th.ink}"><textPath href="#ring" xlink:href="#ring" textLength="352" lengthAdjust="spacing">ENGENHARIA · DADOS · DESIGN · </textPath></text></g>`;
  b += `<circle cx="690" cy="158" r="36" fill="${th.accent}" stroke="${th.line}" stroke-width="3"/>`;
  b += c.text(690, 167, 'TM', { face: 'p800', size: 24, fill: '#0A0A0A', anchor: 'middle' });
  css += `.spin{transform-box:view-box;transform-origin:690px 158px;animation:spin 18s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

  // linha "digitando" com os papéis
  const RY = 392, FS = 26, X0 = 60 + monoW('> ', FS), T = 12, slot = T / ROLES.length;
  b += c.text(60, RY, '>', { face: 'm500', size: FS, fill: th.accent });
  ROLES.forEach((role, i) => {
    const n = [...role].length, w = monoW(role, FS);
    const delay = i === 0 ? 0 : -(T - i * slot);
    b += `<clipPath id="rc${i}"><rect class="ty${i}" x="${X0 - w}" y="${RY - 34}" width="${w}" height="46"/></clipPath>`;
    b += `<g class="vis" style="animation-delay:${delay}s">` +
      `<g clip-path="url(#rc${i})">${c.text(X0, RY, role, { face: 'm500', size: FS })}</g>` +
      `<g class="ty${i}"><rect class="blink" x="${X0 + 3}" y="${RY - 25}" width="13" height="31" fill="${th.accent}"/></g></g>`;
    css += `.ty${i}{animation:ty${i} ${T}s steps(${n}) infinite;animation-delay:${delay}s}` +
      `@keyframes ty${i}{0%{transform:translateX(0)}9%{transform:translateX(${w}px)}20%{transform:translateX(${w}px)}24%,100%{transform:translateX(0)}}`;
  });
  css += `.vis{opacity:0;animation:vis ${T}s steps(1) infinite}@keyframes vis{0%{opacity:1}24.5%,100%{opacity:0}}` +
    `.blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;

  // chips
  let cx = 60;
  for (const label of HERO_CHIPS) { const ch = c.chip(cx, 420, label); b += ch.svg; cx += ch.w + 12; }

  // avatar
  b += `<rect x="832" y="112" width="300" height="319" fill="${th.shadow}"/>`;
  b += `<image href="${avatar}" xlink:href="${avatar}" x="820" y="100" width="300" height="319"/>`;
  b += `<rect x="820" y="100" width="300" height="319" fill="none" stroke="${th.line}" stroke-width="8"/>`;
  b += c.box(1088, 78, 54, 54, { sw: 3, off: 5 });
  b += `<path class="spark" d="M1115 89Q1118 102 1131 105Q1118 108 1115 121Q1112 108 1099 105Q1112 102 1115 89Z" fill="${th.accent}" stroke="${th.line}" stroke-width="2"/>`;
  css += `.spark{transform-box:fill-box;transform-origin:center;animation:spark 2.4s ease-in-out infinite}@keyframes spark{50%{transform:scale(.72) rotate(45deg)}}`;
  // adesivo
  b += `<g transform="translate(770 392)"><g class="wig">${c.box(0, 0, 200, 44, { fill: th.accent, sw: 3, off: 5 })}` +
    `${c.text(100, 29, 'UBERABA · MG', { face: 'm800', size: 16, fill: '#0A0A0A', anchor: 'middle', ls: 1 })}</g></g>`;
  css += `.wig{transform-box:fill-box;transform-origin:center;transform:rotate(-7deg);animation:wig 3s ease-in-out infinite}@keyframes wig{50%{transform:rotate(-3deg)}}`;

  // faixa rolando
  const mq = marquee(c, th, MARQUEE, { y: 522, name: 'mq' });
  b += `<g clip-path="url(#card)"><rect x="${X}" y="484" width="${CW}" height="60" fill="${th.band}"/>${mq.svg}</g>`;
  b += `<line x1="${X}" y1="484" x2="${X + CW}" y2="484" stroke="${th.line}" stroke-width="4"/>`;
  b += `<rect x="${X}" y="${Y}" width="${CW}" height="${CH}" fill="none" stroke="${th.line}" stroke-width="4"/>`;
  css += mq.css;

  return c.doc(W, H, 'Olá, meu nome é Thalys Marques. Engenheiro de Computação, Ciência de Dados e UI/UX.', b, css);
}

function section(th, s) {
  const c = canvas(th);
  const size = 30, labelW = monoW(s.label, size, 1) + 44;
  let b = '';
  b += c.box(4, 10, 76, 64, { fill: th.ink, off: 6 });
  b += c.text(42, 53, s.n, { face: 'm800', size: 28, fill: th.accent, anchor: 'middle' });
  b += c.box(92, 10, labelW, 64, { off: 6 });
  b += c.text(114, 53, s.label, { face: 'm800', size, ls: 1 });
  const lx = 92 + labelW + 30;
  b += c.text(lx, 50, s.hint, { face: 'm500', size: 16, fill: th.muted });
  const hx = lx + monoW(s.hint, 16) + 20;
  b += `<line x1="${hx}" y1="44" x2="1180" y2="44" stroke="${th.line}" stroke-width="3"/><rect x="1176" y="38" width="12" height="12" fill="${th.accent}" stroke="${th.line}" stroke-width="2"/>`;
  return c.doc(1200, 90, `${s.n} ${s.label}`, b);
}

function about(th) {
  const c = canvas(th);
  const FS = 19, LH = 34;
  const S = (s) => ['str', `"${s}"`], K = (s) => ['key', s], P = (s) => ['punct', s], KW = (s) => ['kw', s], N = (s) => ['ink', s];
  const lines = [
    [KW('const '), N('thalys'), P(' = {')],
    [N('  '), K('cargo'), P(': '), S('Engenheiro de Computação'), P(',')],
    [N('  '), K('base'), P(': '), S('Uberaba, MG'), P(',')],
    [N('  '), K('foco'), P(': [')],
    [N('    '), S('Ciência de Dados & ML'), P(',')],
    [N('    '), S('UI/UX Design'), P(',')],
    [N('    '), S('Mobile & Web'), P(',')],
    [N('  '), P('],')],
    [N('  '), K('construindo'), P(': ['), S('Atlas'), P(', '), S('Concord'), P(', '), S('GrowthHub'), P('],')],
    [N('  '), K('missao'), P(': '), S('problema complexo -> produto simples'), P(',')],
    [P('};')],
  ];
  const colors = { str: th.str, key: th.key, punct: th.punct, kw: th.kw, ink: th.ink };
  let b = '';
  // janela de código
  const WX = 4, WY = 50, WW = 716, WH = 470;
  b += c.box(WX, WY, WW, WH, { fill: th.surface, sw: 4, off: 12 });
  b += `<rect x="${WX}" y="${WY}" width="${WW}" height="48" fill="${th.bg}" stroke="${th.line}" stroke-width="4"/>`;
  b += `<rect x="24" y="${WY + 18}" width="12" height="12" fill="${th.accent}" stroke="${th.line}" stroke-width="2"/>` +
    `<rect x="44" y="${WY + 18}" width="12" height="12" fill="${th.ink}" stroke="${th.line}" stroke-width="2"/>` +
    `<rect x="64" y="${WY + 18}" width="12" height="12" fill="none" stroke="${th.line}" stroke-width="2"/>`;
  b += c.text(WX + WW / 2, WY + 30, 'sobre-mim.ts', { face: 'm500', size: 15, fill: th.muted, anchor: 'middle' });
  const top = WY + 92;
  lines.forEach((parts, i) => {
    const y = top + i * LH;
    b += c.text(54, y, String(i + 1), { face: 'm500', size: FS, fill: th.gutter, anchor: 'end' });
    let x = 76;
    for (const [kind, str] of parts) {
      b += c.text(x, y, str, { face: 'm500', size: FS, fill: colors[kind], attrs: 'xml:space="preserve"' });
      x += monoW(str, FS);
    }
    if (i === lines.length - 1) b += `<rect class="blink" x="${x + 4}" y="${y - 19}" width="11" height="25" fill="${th.accent}"/>`;
  });

  // formação
  const FX = 768;
  b += c.text(FX, 32, 'FORMAÇÃO', { face: 'm800', size: 18, ls: 2 });
  b += `<line x1="${FX + monoW('FORMAÇÃO', 18, 2) + 14}" y1="26" x2="1180" y2="26" stroke="${th.line}" stroke-width="3"/>`;
  EDUCATION.forEach((e, i) => {
    const y = WY + i * 160;
    b += c.box(FX, y, 410, 136, { sw: 3, off: 8 });
    b += `<rect x="${FX}" y="${y}" width="10" height="136" fill="${th.accent}" stroke="${th.line}" stroke-width="3"/>`;
    b += c.text(FX + 32, y + 38, e.years, { face: 'm500', size: 15, fill: th.accent });
    b += c.text(FX + 32, y + 76, e.title, { face: 'p800', size: 22 });
    b += c.text(FX + 32, y + 108, e.place, { face: 'p400', size: 14, fill: th.muted });
  });
  const css = `.blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;
  return c.doc(1200, 540, 'Sobre mim: Engenheiro de Computação em Uberaba, MG, focado em dados, UI/UX, mobile e web.', b, css);
}

function card(th, p, i) {
  const c = canvas(th);
  const [X, Y, W, H] = [4, 4, 570, 318];
  let b = '', css = '';
  b += c.box(X, Y, W, H, { sw: 4, off: 12 });
  // monograma
  b += c.box(30, 30, 66, 66, { fill: p.color, sw: 3, off: 5 });
  b += c.text(63, p.mono.length > 1 ? 73 : 76, p.mono, { face: 'p800', size: p.mono.length > 1 ? 26 : 34, fill: '#0A0A0A', anchor: 'middle' });
  // categoria e status
  const tag = p.cat.toUpperCase();
  const tw = monoW(tag, 12, 1) + 22;
  b += `<rect x="118" y="32" width="${tw}" height="28" fill="${th.bg}" stroke="${th.line}" stroke-width="2"/>`;
  b += c.text(129, 51, tag, { face: 'm500', size: 12, ls: 1 });
  if (p.live) {
    b += `<circle class="pulse" cx="126" cy="80" r="9" fill="#22C55E" opacity=".35"/><circle cx="126" cy="80" r="5" fill="#22C55E"/>`;
    css += `.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1.6s ease-out infinite}@keyframes pulse{from{transform:scale(.6);opacity:.6}to{transform:scale(1.8);opacity:0}}`;
  } else {
    b += `<rect x="121" y="75" width="10" height="10" fill="none" stroke="${th.muted}" stroke-width="2"/>`;
  }
  b += c.text(140, 85, p.status, { face: 'm500', size: 13, fill: th.muted });
  // número
  b += `<text x="546" y="84" font-family="m800" font-size="48" fill="none" stroke="${th.line}" stroke-width="1.6" text-anchor="end">${String(i + 1).padStart(2, '0')}</text>`;
  c.use('m800', '0123456789');
  // título e descrição
  b += c.text(30, 152, p.title, { face: 'p800', size: 34 });
  const lines = wrap(p.desc, 58);
  if (lines.length > 3) console.warn(`! descrição de "${p.title}" tem ${lines.length} linhas`);
  lines.slice(0, 3).forEach((l, k) => { b += c.text(30, 186 + k * 24, l, { face: 'p400', size: 15.5, fill: th.muted }); });
  // tecnologias
  let x = 30;
  for (const t of p.tech) { const ch = c.chip(x, 266, t, { size: 13, h: 30, pad: 11, fill: th.bg, off: 3 }); b += ch.svg; x += ch.w + 10; }
  // botão
  b += c.box(500, 256, 48, 44, { fill: p.color, sw: 3, off: 4 });
  b += p.status === 'privado'
    ? `<rect x="513" y="276" width="22" height="16" fill="#0A0A0A"/><path d="M517 276v-5a7 7 0 0 1 14 0v5" fill="none" stroke="#0A0A0A" stroke-width="3"/>`
    : c.arrow(504, 258, 40);
  return c.doc(600, 340, `${p.title}: ${p.desc}`, b, css);
}

function post(th, p) {
  const c = canvas(th);
  let b = '';
  b += c.box(4, 4, 1170, 72, { sw: 3, off: 8 });
  const ch = c.chip(24, 22, p.date, { size: 14, h: 34, pad: 12, fill: th.bg, color: th.accent, off: 0 });
  b += ch.svg;
  b += c.text(24 + ch.w + 26, 47, p.title, { face: 'p600', size: 19 });
  b += c.box(1112, 18, 44, 40, { fill: th.accent, sw: 3, off: 4 }) + c.arrow(1116, 18, 38, '#0A0A0A', 3.2);
  return c.doc(1200, 88, p.title, b);
}

function button(th, l) {
  const c = canvas(th);
  const fill = l.primary ? th.accent : th.surface;
  const ink = l.primary ? '#0A0A0A' : th.ink;
  let b = c.box(4, 4, 284, 80, { fill, sw: 3, off: 8 });
  b += `<rect x="18" y="18" width="52" height="52" fill="${l.primary ? th.surface : th.accent}" stroke="${th.line}" stroke-width="3"/>`;
  const ic = l.primary ? th.ink : '#0A0A0A';
  const icons = {
    globe: `<circle cx="44" cy="44" r="15" fill="none" stroke="${ic}" stroke-width="3"/><ellipse cx="44" cy="44" rx="6.5" ry="15" fill="none" stroke="${ic}" stroke-width="2.5"/><path d="M29 44H59" stroke="${ic}" stroke-width="2.5"/>`,
    pen: `<path d="M31 57l3-11L50 30l8 8-16 16z" fill="none" stroke="${ic}" stroke-width="3" stroke-linejoin="round"/><path d="M46 34l8 8" stroke="${ic}" stroke-width="3"/>`,
    be: c.text(44, 51, 'Be', { face: 'p800', size: 20, fill: ic, anchor: 'middle' }),
    ig: `<rect x="30" y="30" width="28" height="28" rx="8" fill="none" stroke="${ic}" stroke-width="3"/><circle cx="44" cy="44" r="6.5" fill="none" stroke="${ic}" stroke-width="3"/><circle cx="52.5" cy="35.5" r="2" fill="${ic}"/>`,
  };
  b += icons[l.icon];
  b += c.text(86, 44, l.label, { face: 'p800', size: 20, fill: ink });
  b += c.text(86, 64, l.sub, { face: 'm500', size: 11.5, fill: l.primary ? '#0A0A0A' : th.muted });
  b += c.arrow(254, 14, 24, ink, 2.8);
  return c.doc(300, 96, l.label, b);
}

function footer(th) {
  const c = canvas(th);
  const mq = marquee(c, th, FOOTER, { y: 70, size: 24, name: 'fq', speed: 45, width: 1300 });
  const b = `<g transform="rotate(-1.6 600 60)"><rect x="-40" y="34" width="1280" height="54" fill="${th.accent}" stroke="${th.line}" stroke-width="4"/></g>` +
    `<g transform="rotate(1.2 600 60) translate(0 -8)"><rect x="-40" y="40" width="1280" height="56" fill="${th.band}" stroke="${th.line}" stroke-width="4"/>` +
    `<g transform="translate(-40 0)">${mq.svg}</g></g>`;
  return c.doc(1200, 130, 'Obrigado pela visita!', b, mq.css);
}

// ───────────────────────── build ─────────────────────────

const files = {};
for (const [name, th] of Object.entries(THEMES)) {
  files[`header-${name}`] = header(th);
  files[`about-${name}`] = about(th);
  files[`footer-${name}`] = footer(th);
  for (const s of SECTIONS) files[`section-${s.slug}-${name}`] = section(th, s);
  PROJECTS.forEach((p, i) => { files[`card-${p.slug}-${name}`] = card(th, p, i); });
  for (const p of POSTS) files[`${p.slug}-${name}`] = post(th, p);
  for (const l of LINKS) files[`btn-${l.slug}-${name}`] = button(th, l);
}

// baixa do Google Fonts só os glifos usados (subset) e embute em base64
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
await mkdir(CACHE, { recursive: true });
const fontCss = {};
for (const [face, set] of Object.entries(glyphs)) {
  const [family, weight] = FACES[face];
  const chars = [...set].sort().join('');
  const key = createHash('sha1').update(face + chars).digest('hex').slice(0, 12);
  const file = path.join(CACHE, `${face}-${key}.woff2`);
  if (!existsSync(file)) {
    const q = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(chars)}`;
    const cssText = await (await fetch(q, { headers: { 'User-Agent': UA } })).text();
    const url = cssText.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) throw new Error(`fonte não encontrada para ${face}: ${cssText.slice(0, 200)}`);
    await writeFile(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  fontCss[face] = `@font-face{font-family:${face};font-weight:normal;src:url(data:font/woff2;base64,${(await readFile(file)).toString('base64')}) format("woff2")}`;
}

let total = 0;
for (const [name, svg] of Object.entries(files)) {
  const out = svg.replace(/\/\*FONTS:([^*]*)\*\//, (_, list) => list.split(',').filter(Boolean).map((f) => fontCss[f]).join(''));
  await writeFile(path.join(OUT, `${name}.svg`), out);
  total += out.length;
}
console.log(`${Object.keys(files).length} SVGs gerados em assets/ (${(total / 1024).toFixed(0)} KB)`);
