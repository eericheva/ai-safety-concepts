// ADDED 2026-10-27: the demo tours of bestiary-interactives.html, after the map pages' demoCursor.ts.
// Each block (The whole bestiary, Zooming in, An idea feeds — and is fed) gets a "Demo: how to read this"
// button. The tour moves a drawn cursor over the block, clicks its tabs and beasts, and stops at notes:
// a yellow frame around one or two elements, an arrow to a card that says what we see and what it means.
// A note stays for its reading time; Next goes on at once, Pause holds it; a real click anywhere else in
// the block ends the tour. Numbers in the notes are read off the page when the note opens, so they stay
// true when the data changes.
(() => {
  const SVG = 'http://www.w3.org/2000/svg'
  const CARD_W = 340
  const CURSOR = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2 L3 18 L7.5 14 L10.5 20.5 L13.2 19.3 L10.3 13 L16.5 13 Z" fill="#efeae2" stroke="#0c0b0a" stroke-width="1.4" stroke-linejoin="round"/></svg><span style="position:absolute;left:-9px;top:-9px;width:22px;height:22px;border:2px solid #d8a24a;border-radius:50%;opacity:0;transform:scale(.4);transition:all .45s;"></span>'
  // CHANGED 2026-11-22: the tour card's buttons are actions, 44px (brand book sizes)
  // CHANGED 2026-11-22: design review: the Demo button and the tour's frames and cards are in the brand gold #d8a24a (was #f2c200)
  // CHANGED 2026-11-22: design review: the blocks are no longer at least 1200px wide; below 1312px (1200 + the gutters) the Demo button heads its block instead of covering its title
  const CSS = `
.bd-cursor{position:absolute;left:0;top:0;width:22px;height:22px;pointer-events:none;z-index:70;opacity:0;transition:transform .75s cubic-bezier(.45,0,.2,1),opacity .3s}
.bd-btn{position:absolute;right:32px;top:30px;z-index:5;padding:6px 12px;background:transparent;border:1px solid #d8a24a;color:#d8a24a;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.bd-btn:hover{background:#d8a24a;color:#0c0b0a}
@media (max-width:1311px){.bd-btn{position:static;order:-1;align-self:flex-start}}
.bd-layer{position:absolute;inset:0;pointer-events:none;z-index:80;opacity:0;transition:opacity .3s}
.bd-layer.on{opacity:1}
.bd-layer svg{position:absolute;left:0;top:0;overflow:visible}
.bd-frame{fill:rgba(216,162,74,.07);stroke:#d8a24a;stroke-width:2}
.bd-arrow{fill:none;stroke:#d8a24a;stroke-width:2;stroke-dasharray:5 4}
.bd-tip{position:absolute;box-sizing:border-box;padding:16px 18px 14px;background:#1b1916;border:1px solid #d8a24a;box-shadow:0 12px 40px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:8px;overflow:hidden}
.bd-layer.on .bd-tip{pointer-events:auto}
.bd-tip b{font:700 15px/1.3 'Unbounded',sans-serif;color:#d8a24a}
.bd-tip p{margin:0;font:400 14px/1.55 'Onest',sans-serif;color:#efeae2;text-wrap:pretty}
.bd-tip div{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
.bd-tip button{min-height:44px;padding:0 12px;background:transparent;border:1px solid #4a4540;color:#cfc8bd;cursor:pointer;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase}
.bd-tip button:last-child{border-color:#d8a24a;color:#d8a24a}
.bd-tip button:hover{background:#d8a24a;color:#0c0b0a}
.bd-tip.held i{opacity:.35}
.bd-tip i{position:absolute;left:0;bottom:0;width:100%;height:3px;background:#d8a24a;transform-origin:left}`

  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const look = (t) => (typeof t === 'function' ? t() : t)
  const txt = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '')

  // A step is ['click', target] | ['hover', target] | ['note', {at: [targets], title, text}]; a target is
  // an element or a function that finds it when the step runs (the page re-renders as the tour clicks).
  // `title` and `text` may be functions too, so a note reads its numbers off the page when it opens.
  // CHANGED 2026-11-02: a note may also list `clear: [targets]`, the elements its text is about that the card
  // must not cover besides the framed ones; a target there may find an element or a list of them.
  // ADDED 2026-11-23: `opts` lets another page use the tour: `button` is a button the page already has (none is made then),
  // `watch` is where a real click ends the tour (the root by default), `controls: false` hides Pause and Next, and
  // `readMs(words)` sets how long a note stays, `scroll: false` keeps the tour from scrolling anything (a page that fits the screen,
  // where scrolling an element into view would scroll a toolbar's hidden overflow instead). A step may also be ['do', fn, ms]: run fn, wait for what it returns, then ms.
  function startDemo(root, tour, opts = {}) {
    const cur = document.createElement('div'); cur.className = 'bd-cursor'; cur.innerHTML = CURSOR
    const ring = cur.querySelector('span')
    /* CHANGED 2026-11-23: the page's own button when it has one (opts.button) */
    const btn = opts.button || Object.assign(document.createElement('button'), { type: 'button', className: 'bd-btn', textContent: '▶ Demo: how to read this' })
    const layer = document.createElement('div'); layer.className = 'bd-layer'
    const svg = document.createElementNS(SVG, 'svg'); layer.appendChild(svg)
    const card = document.createElement('div'); card.className = 'bd-tip'; layer.appendChild(card)
    root.append(...(opts.button ? [] : [btn]), cur, layer)
    let run = 0, playing = false, next = () => {}
    const moveTo = (el) => {
      const a = root.getBoundingClientRect(), b = el.getBoundingClientRect()
      cur.style.transform = `translate(${b.left - a.left + Math.min(b.width * 0.5, 60)}px,${b.top - a.top + b.height * 0.55}px)`
    }
    const showNote = async (n, token) => {
      const els = n.at.map(look).filter((e) => e && e.isConnected)
      if (!els.length) return
      const rs = els.map((e) => e.getBoundingClientRect())
      const top = Math.min(...rs.map((r) => r.top)), bottom = Math.max(...rs.map((r) => r.bottom))
      if (opts.scroll === false) {} /* CHANGED 2026-11-23: see opts.scroll */
      else if (bottom - top < innerHeight - 200) scrollBy({ top: (top + bottom) / 2 - innerHeight / 2, behavior: 'smooth' })
      else els[0].scrollIntoView({ block: 'center', behavior: 'smooth' })
      await wait(650); if (token !== run) return
      moveTo(els[0]); await wait(700); if (token !== run) return
      const a = root.getBoundingClientRect()
      const bs = els.map((e) => { const b = e.getBoundingClientRect(); return { x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height } })
      const W = root.clientWidth, H = root.clientHeight
      const x0 = Math.min(...bs.map((b) => b.x)), x1 = Math.max(...bs.map((b) => b.x + b.w))
      const y0 = Math.min(...bs.map((b) => b.y)), y1 = Math.max(...bs.map((b) => b.y + b.h))
      card.innerHTML = ''
      const t = document.createElement('b'); t.textContent = look(n.title)
      const p = document.createElement('p'); p.textContent = look(n.text)
      const bar = document.createElement('i'), ctl = document.createElement('div')
      const hold = document.createElement('button'); hold.type = 'button'; hold.textContent = 'Pause'
      const go = document.createElement('button'); go.type = 'button'; go.textContent = 'Next ›'
      ctl.append(hold, go); card.append(t, p, ...(opts.controls === false ? [] : [ctl]), bar) /* CHANGED 2026-11-23: see opts.controls */
      // CHANGED 2026-11-02: the card goes where it covers least of what the note is about. Candidates sit
      // right of, left of, below and above the framed union and in the corners and edges of the part of the
      // block on screen, in three widths; each is scored by the area it covers of the frames (weighted 4)
      // and of the note's `clear` elements; ties go to the one nearest the frames, then to the wider card.
      // A card may sit past the top or bottom of the screen if it and the frames still fit on it together:
      // the card is scrolled into view when it opens.
      const rel = (r) => ({ x0: r.left - a.left, y0: r.top - a.top, x1: r.right - a.left, y1: r.bottom - a.top })
      const keep = [...els.map((e) => ({ ...rel(e.getBoundingClientRect()), k: 4, m: 12 })),
        ...(n.clear || []).flatMap((g) => [look(g)].flat()).filter((e) => e && e.isConnected && shown(e))
          .map((e) => ({ ...rel(e.getBoundingClientRect()), k: 1, m: 4 })).filter((r) => r.x1 > r.x0 && r.y1 > r.y0)]
      const V = { x0: Math.max(0, -a.left) + 12, y0: 12, x1: Math.min(W, innerWidth - a.left) - 12, y1: H - 12 }
      const sy0 = Math.max(0, -a.top) + 12, sy1 = Math.min(H, innerHeight - a.top) - 12
      const span = (p0, p1, q0, q1) => Math.max(0, Math.min(p1, q1) - Math.max(p0, q0))
      let best = { s: Infinity }
      for (const w of new Set([CARD_W, 300, 260].map((v) => Math.min(v, V.x1 - V.x0)))) {
        card.style.width = `${w}px`; const h = card.offsetHeight
        const xs = [x1 + 48, x0 - 48 - w, (x0 + x1) / 2 - w / 2, x0, x1 - w, V.x0, V.x1 - w, (V.x0 + V.x1) / 2 - w / 2]
        const ys = [y1 + 40, y0 - 40 - h, (y0 + y1) / 2 - h / 2, y0, y1 - h, sy0, sy1 - h, (sy0 + sy1) / 2 - h / 2]
        for (const qx of xs) for (const qy of ys) {
          const x = Math.max(V.x0, Math.min(V.x1 - w, qx)), y = Math.max(V.y0, Math.min(V.y1 - h, qy))
          const fits = Math.max(y + h, y1) - Math.min(y, y0) <= innerHeight - 24 || (y >= sy0 && y + h <= sy1)
          const s = (fits ? 0 : 1e9) + Math.round(keep.reduce((acc, r) => acc + r.k * span(x, x + w, r.x0 - r.m, r.x1 + r.m) * span(y, y + h, r.y0 - r.m, r.y1 + r.m), 0) / 100)
          const d = Math.round(Math.hypot(Math.max(0, x0 - x - w, x - x1), Math.max(0, y0 - y - h, y - y1)) / 24)
          if (s < best.s || (s === best.s && (d < best.d || (d === best.d && w > best.w)))) best = { s, d, w, h, x, y }
        }
      }
      card.style.width = `${best.w}px`
      const cw = best.w, ch = best.h, cx = best.x, cy = best.y
      card.style.left = `${cx}px`; card.style.top = `${cy}px`
      svg.setAttribute('width', String(W)); svg.setAttribute('height', String(H))
      svg.innerHTML = '<defs><marker id="bd-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#d8a24a"/></marker></defs>'
      const mid = { x: cx + cw / 2, y: cy + ch / 2 }
      const spread = (k) => (bs.length > 1 ? 0.25 + (0.5 * k) / (bs.length - 1) : 0.5)
      bs.forEach((b, k) => {
        const r = document.createElementNS(SVG, 'rect')
        Object.entries({ x: b.x - 4, y: b.y - 4, width: b.w + 8, height: b.h + 8, rx: 4 }).forEach(([q, v]) => r.setAttribute(q, String(v)))
        r.setAttribute('class', 'bd-frame'); svg.appendChild(r)
        const bc = { x: b.x + b.w * spread(k), y: b.y + b.h / 2 }
        const horiz = Math.abs(mid.x - bc.x) - cw / 2 > Math.abs(mid.y - bc.y) - ch / 2
        const s = horiz ? { x: mid.x > bc.x ? b.x + b.w + 6 : b.x - 6, y: bc.y } : { x: bc.x, y: mid.y > bc.y ? b.y + b.h + 6 : b.y - 6 }
        const e = horiz ? { x: mid.x > bc.x ? cx - 4 : cx + cw + 4, y: Math.max(cy + 14, Math.min(cy + ch - 14, bc.y)) }
          : { x: cx + 20 + (cw - 40) * spread(k), y: mid.y > bc.y ? cy - 4 : cy + ch + 4 }
        const c = horiz ? `${(s.x + e.x) / 2} ${s.y}, ${(s.x + e.x) / 2} ${e.y}` : `${s.x} ${(s.y + e.y) / 2}, ${e.x} ${(s.y + e.y) / 2}`
        const path = document.createElementNS(SVG, 'path')
        path.setAttribute('d', `M${s.x} ${s.y} C${c}, ${e.x} ${e.y}`); path.setAttribute('class', 'bd-arrow'); path.setAttribute('marker-end', 'url(#bd-head)')
        svg.appendChild(path)
      })
      layer.classList.add('on')
      if (opts.scroll !== false) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) /* CHANGED 2026-11-23: see opts.scroll */
      // reading time: about 4 words a second, never under 6 s
      const words = (t.textContent + ' ' + p.textContent).split(/\s+/).length
      const ms = opts.readMs ? opts.readMs(words) : Math.max(6000, words * 260) /* CHANGED 2026-11-23: see opts.readMs */
      bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'
      await new Promise((done) => {
        let left = ms, since = 0, timer
        const runOn = () => {
          since = performance.now(); timer = setTimeout(() => next(), left)
          requestAnimationFrame(() => { bar.style.transition = `transform ${left}ms linear`; bar.style.transform = 'scaleX(0)' })
        }
        next = () => { clearTimeout(timer); next = () => {}; done() }
        hold.onclick = () => {
          if (hold.textContent === 'Pause') {
            clearTimeout(timer); left -= performance.now() - since
            bar.style.transition = 'none'; bar.style.transform = `scaleX(${left / ms})`
            hold.textContent = 'Resume'; card.classList.add('held')
          } else { hold.textContent = 'Pause'; card.classList.remove('held'); runOn() }
        }
        runOn(); go.onclick = () => next()
      })
      layer.classList.remove('on'); svg.replaceChildren()
    }
    const stop = () => { run++; playing = false; cur.style.opacity = '0'; layer.classList.remove('on'); svg.replaceChildren(); next() }
    const play = async () => {
      stop(); const token = ++run; playing = true
      await wait(300); cur.style.opacity = '1'
      for (const s of tour(root)) {
        if (token !== run) return
        if (s[0] === 'note') { await showNote(s[1], token); continue }
        if (s[0] === 'do') { await s[1](); await wait(s[2] || 0); continue } /* ADDED 2026-11-23: see opts */
        const el = look(s[1])
        if (!el || !el.isConnected) continue
        const b = el.getBoundingClientRect()
        if (opts.scroll !== false && (b.bottom < 80 || b.top > innerHeight - 80)) { /* CHANGED 2026-11-23: see opts.scroll */ el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await wait(550) }
        moveTo(el); await wait(850); if (token !== run) return
        if (s[0] === 'hover') { el.dispatchEvent(new MouseEvent('mouseenter')); el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); await wait(1100) }
        else {
          ring.style.opacity = '1'; ring.style.transform = 'scale(1)'
          el.click()
          setTimeout(() => { ring.style.opacity = '0'; ring.style.transform = 'scale(.4)' }, 350)
          await wait(s[2] || 1300)
        }
      }
      if (token === run) stop()
    }
    btn.addEventListener('click', (e) => { e.stopPropagation(); play() })
    // a real click in the block, outside the note card and the button, hands the block to the reader
    /* CHANGED 2026-11-23: in opts.watch when given; the tour's own play and stop are returned for a page that drives it */
    ;(opts.watch || root).addEventListener('pointerdown', (e) => { if (playing && e.isTrusted && e.target !== btn && !btn.contains(e.target) && !card.contains(e.target)) stop() }, true)
    return { play, stop }
  }

  // ---- finding things on the page ----
  const all = (root, sel) => [...root.querySelectorAll(sel)]
  // an element on a step of Zooming in that is not shown sits under a parent with opacity 0
  const shown = (e) => { for (let x = e; x; x = x.parentElement) if (x.style && x.style.opacity === '0') return false; return true }
  const byText = (root, sel, re) => () => all(root, sel).find((e) => re.test(txt(e)) && shown(e)) || null
  const spanText = (root, re) => byText(root, 'span', re)
  // The whole bestiary: the beast rows (16px high, clickable), the column heads, the selected chip
  // CHANGED 2026-11-22: design review: a row is a button now, 16px high (24px below 700px); it is told by its 2px left mark
  const wRows = (root) => all(root, 'button[title]').filter((e) => e.style.borderLeftWidth === '2px')
  const wRowNamed = (root, name) => () => wRows(root).find((e) => txt(e) === name) || null
  const firstLit = (root) => () => wRows(root).find((e) => e.style.fontWeight === '700' && e.style.background !== 'rgb(216, 162, 74)') || null
  const faded = (root) => () => wRows(root).find((e) => e.style.color === 'rgb(77, 72, 66)') || null
  // CHANGED 2026-11-02: heads, lit rows and the first rows of a column, for the notes' `clear` lists
  const heads = (root) => () => all(root, 'div').filter((e) => e.style.height === '26px' && e.style.textTransform === 'uppercase')
  const colHead = (root, i) => () => heads(root)()[i] || null
  const litRows = (root) => () => wRows(root).filter((e) => e.style.fontWeight === '700')
  const colRows = (root, i, n) => () => {
    const h = colHead(root, i)(); if (!h) return []
    const b = h.getBoundingClientRect()
    return wRows(root).filter((e) => { const r = e.getBoundingClientRect(); return r.left >= b.left - 4 && r.right <= b.right + 4 && r.top >= b.bottom - 4 })
      .sort((p, q) => p.getBoundingClientRect().top - q.getBoundingClientRect().top).slice(0, n)
  }
  const info = (root) => () => all(root, 'span').find((e) => /feed it|nothing feeds it|feeds them|of its own/.test(txt(e)) && e.children.length === 0) || null
  const selChip = (root) => () => all(root, 'span').find((e) => e.style.background === 'rgb(216, 162, 74)' && e.style.height === '40px') || null /* CHANGED 2026-11-22: the picked beast is 40px (brand book sizes) */
  const hint = (root) => () => all(root, 'span').find((e) => /^columns =/.test(txt(e))) || null

  const BEAST = 'Instrumental convergence'

  const TOURS = {
    '2w': (root) => {
      const tab = (l) => byText(root, 'button', new RegExp(`^${l}$`))
      return [
        ['note', { at: [tab('Time'), tab('Role ladder')], title: 'Five ways to lay out the same 227 ideas',
          text: 'Each tab is an axis. Time and Role ladder have fixed columns: the era an idea comes from, its role in the argument. Logic, Cause and Debate build their columns from the links themselves, step by step.' }],
        ['click', tab('Time')],
        // CHANGED 2026-11-02: `clear` keeps the card off the lit rows
        ['note', { at: [colHead(root, 0), hint(root)], clear: [litRows(root)], title: 'Time: one column per era',
          text: 'Every idea sits in the era it was first put forward. A line runs from an earlier idea to a later one it is linked to; its colour is the kind of link, and genealogical links are drawn bold.' }],
        ['click', wRowNamed(root, BEAST), 1600],
        ['note', { at: [selChip(root), info(root)], title: () => `Picked: ${txt(selChip(root)()).replace(/[←→\d\s]+$/, '')}`,
          text: () => `${txt(info(root)()).split('·').slice(0, 2).join('·').trim()}. Lit rows are its neighbourhood within three links each way; everything else dims. Click any row to move there.` }],
        ['click', tab('Logic')],
        // CHANGED 2026-11-02: `clear` keeps the card off the top rows of both framed columns and the lit rows
        ['note', { at: [colHead(root, 0), colHead(root, 1)], clear: [colRows(root, 0, 14), colRows(root, 1, 14), litRows(root)], title: 'Logic: premises first',
          text: 'Here the columns are steps of reasoning. The first column holds premises nothing logically depends on; each next column holds what follows one step further. A special case stands to the right of the general idea.' }],
        ['note', { at: [faded(root)], title: 'Faded rows: no link of this kind',
          text: 'A faded idea has no logical link of its own. It stands next to the neighbour it is closest to, and its chain grows through that neighbour, one ordinary link away.' }],
        ['click', tab('Debate')],
        // CHANGED 2026-11-02: `clear` keeps the card off every column head and the lit chain
        ['note', { at: [firstLit(root), info(root)], clear: [heads(root), litRows(root)], title: 'Debate: who answers whom',
          text: 'An idea feeds the critique of it; tension, contradiction and alternatives run from the earlier idea to the later one. The lit chain is the argument around the picked idea.' }],
        ['click', tab('Role ladder')],
      ]
    },
    '4a': (root) => {
      const tab = (l) => byText(root, 'button', new RegExp(`${l}$`))
      const follow = () => all(root, 'button').find((e) => e.style.borderColor === 'rgb(216, 162, 74)') || null
      const alongN = spanText(root, /^Alongside · \d+$/)
      const firstAlong = () => { const s = alongN(); let e = s && s.nextElementSibling; while (e && e.tagName !== 'BUTTON') e = e.nextElementSibling; return e }
      // CHANGED 2026-11-02: the step on show in the 1136×600 stage, its parts, and the Follow row's chips
      const step = () => { const s = all(root, 'div').find((e) => e.style.overflow === 'hidden' && e.style.alignSelf === 'center'); return s ? [...s.children].find((e) => e.style.opacity === '1') || null : null }
      const sized = (w, h) => () => all(root, 'div').filter((e) => e.style.position === 'absolute' && e.style.width === w && (!h || e.style.height === h) && shown(e))
      const followRow = () => { const f = follow(); return f && f.parentElement }
      const alongChips = () => { const s = alongN(); return s ? all(s.parentElement, 'button').filter((b) => s.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) : [] }
      const column = (re) => () => { const s = spanText(root, re)(); return s && s.parentElement }
      return [
        // CHANGED 2026-11-02: `clear` keeps the card off the Follow row and the stage
        ['note', { at: [follow, alongN], clear: [followRow, step], title: 'Follow: the picked idea and what sits beside it',
          text: () => `The first chip is the idea picked in The whole bestiary. After it come its ${txt(alongN()).replace(/\D/g, '')} Alongside neighbours: links with no direction, like analogy or same mechanism. Play walks through them one by one.` }],
        ['click', tab('Bestiary')],
        // CHANGED 2026-11-02: the frame is the six rows and their thread, not the tab
        ['note', { at: [step], title: 'Six resolutions of one bestiary',
          text: 'Each row sorts all 227 ideas into groups by one property: canon, weight, link kind, era, role, family. The gold thread follows the picked idea through all six.' }],
        ['click', tab('District')],
        // CHANGED 2026-11-02: `clear` keeps the card off the district on the stage
        ['note', { at: [byText(root, 'button', /^Family · \d+$/), byText(root, 'button', /^Era · \d+$/)], clear: [step], title: 'A district: its group on one layer',
          text: 'The cards are the ideas that share the picked idea’s group on the chosen layer. Switch the layer to see the same idea among its family, its era or its role.' }],
        ['click', tab('Circuit'), 1800],
        // CHANGED 2026-11-02: the caption takes the number only, not the whole "Comes from · N" label
        // CHANGED 2026-11-02: `clear` keeps the card off the centre card and the two sides
        ['note', { at: [spanText(root, /^Comes from · \d+$/), spanText(root, /^Leads to · \d+$/)], clear: [sized('200px', '180px'), sized('300px')], title: 'Circuit: before and after',
          text: () => `${txt(spanText(root, /^Comes from · \d+$/)()).replace(/\D/g, '')} ideas feed it, it leads to ${txt(spanText(root, /^Leads to · \d+$/)()).replace(/\D/g, '')}. Left: premises, causes and earlier ideas. Right: what follows, remedies and later ideas.` }],
        // CHANGED 2026-11-02: `clear` keeps the card off the Alongside chips and the centre card
        ['note', { at: [spanText(root, /links with no direction$/)], clear: [sized('258px'), sized('200px', '180px')], title: 'Alongside: links with no direction',
          text: 'Related, analogy, same mechanism, dual, tension and alternative have no before or after, so they sit under the idea rather than on a side.' }],
        ['click', tab('Pros and cons'), 1800],
        // CHANGED 2026-11-02: the frames are the two columns and the verdict line, not the tab
        ['note', { at: [column(/^\+ Supports/), spanText(root, /^\d+ for · \d+ against/), column(/^− Argues against/)], title: 'Pros and cons',
          text: 'Ideas that support it on one side, ideas that argue with it on the other, with a one-line verdict on the balance.' }],
        ['click', firstAlong, 1600],
        // CHANGED 2026-11-02: `clear` keeps the card off the rebuilt Alongside chips
        ['note', { at: [follow], clear: [alongChips], title: 'Hop to a neighbour',
          text: 'Clicking an Alongside chip makes it the picked idea everywhere on the page, and the Follow row rebuilds around it.' }],
      ]
    },
    '2f': (root) => {
      const tab = (l) => byText(root, 'button', new RegExp(`^${l}$`))
      const head = () => all(root, 'span').find((e) => /fed by|nothing feeds it|of its own/.test(txt(e)) && e.style.fontWeight !== '') || null
      const rootCard = () => all(root, 'div[title]').find((e) => e.style.background === 'rgb(216, 162, 74)' && e.style.position === 'absolute') || null
      // CHANGED 2026-11-02: the tree under the root card, and the root row's search and recent picks
      const tree = () => { const c = rootCard(); return c && c.parentElement }
      const picks = () => { const a = byText(root, 'button', /^All 227/)(); return a ? [...a.parentElement.children].filter((e) => e !== a && e.tagName !== 'SPAN') : [] }
      return [
        // CHANGED 2026-11-09: a new tab regrows the tree by itself; the separate Replay button is gone
        ['click', tab('Logic'), 2600],
        // CHANGED 2026-11-02: `clear` keeps the card off the tree, its count line and the root picks
        ['note', { at: [rootCard], clear: [tree, head, picks], title: 'One idea, grown both ways',
          text: 'The gold card is the picked idea. Each tick adds one link on each side: to the left what feeds it, to the right what it feeds, up to three steps.' }],
        // CHANGED 2026-11-02: `clear` keeps the card off the tree, the column hint and the root picks
        ['note', { at: [head], clear: [tree, hint(root), picks], title: 'The count',
          text: () => `${txt(head())}. The numbers say how much of each side has grown so far and how much there is in all.` }],
        // CHANGED 2026-11-09: a new tab regrows the tree by itself; the separate Replay button is gone
        ['click', tab('Cause'), 2600],
        // CHANGED 2026-11-02: as in The count
        ['note', { at: [rootCard, head], clear: [tree, hint(root), picks], title: 'Same idea, causal chain',
          text: 'On Cause a problem feeds what mitigates or solves it, and a cause feeds what it gives rise to. Dashed lines, when they appear, join an idea with no causal link of its own to the nearest neighbour that has one.' }],
        // CHANGED 2026-11-02: `clear` keeps the card off the search and the recent picks
        ['note', { at: [byText(root, 'button', /^All 227/)], clear: [picks], title: 'Pick any root',
          text: 'Search, the recent picks or the full list grouped by column. A new root here also moves The whole bestiary and Zooming in.' }],
      ]
    },
  }

  // ---- ADDED 2026-11-23: the tour of the Bestiarium Map (bestiary-world.html) ----
  // The map is a canvas: a beast, an island, the gathered neighbours and the flag have no element of their own. A spot stands in
  // for one: its box is asked of the map component (window.__bestiaryWorld, its accessors beastBox, islandBox, councilBox,
  // flagBox) every time it is read, and its click and hover are pointer events sent to the canvas, so they go through the same
  // handlers as a real mouse. Which beast, island or neighbour the tour points at is chosen by a rule from the data: the beast
  // with the most links, the island with the most beasts, the first neighbour in the card, the next beast on a shortest path.
  const worldKit = (cmp) => {
    const cv = () => cmp.cvRef.current
    const fire = (type, x, y) => cv().dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1, isPrimary: true }))
    const spot = (box) => () => {
      if (!box()) return null
      const rect = () => { const b = box(), c = cv().getBoundingClientRect(); return { left: c.left + b.x0, top: c.top + b.y0, right: c.left + b.x1, bottom: c.top + b.y1, width: b.x1 - b.x0, height: b.y1 - b.y0 } }
      const mid = () => { const r = rect(); return [r.left + r.width / 2, r.top + r.height / 2] }
      return { isConnected: true, getBoundingClientRect: rect, scrollIntoView() {},
        click() { const [x, y] = mid(); fire('pointerdown', x, y); fire('pointerup', x, y) },
        dispatchEvent(ev) { if (ev.type === 'mouseover') { const [x, y] = mid(); fire('pointermove', x, y) } } }
    }
    const leave = () => fire('pointerleave', 0, 0)
    // a spot whose centre a panel covers is not shown: a note does not frame it
    const onMap = (sp) => () => { const e = sp(); if (!e) return null; const r = e.getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === cv() ? e : null }
    const free = (b) => { const c = cv().getBoundingClientRect(); return document.elementFromPoint(c.left + (b.x0 + b.x1) / 2, c.top + (b.y0 + b.y1) / 2) === cv() }
    // a DOM element's React onMouseLeave: a mouseout to the page
    const out = (find) => () => { const e = find(); if (e) e.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })) }
    const settle = async () => { const t0 = performance.now(); await wait(250); while (!cmp.settled() && performance.now() - t0 < 4000) await wait(100); await wait(200) }
    const root = cmp.wrapRef.current
    const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth }
    const els = (sel) => all(root, sel).filter(visible)
    const byTxt = (sel, re) => () => els(sel).find((e) => re.test(txt(e))) || null
    const up = (find, k = 1) => () => { let e = find(); for (let i = 0; e && i < k; i++) e = e.parentElement; return e }
    const S = {
      title: byTxt('h1', /^Bestiarium Map$/),
      mode: (l) => byTxt('button', new RegExp(`^${l}$`)),
      help: byTxt('button', /^\?$/),
      intro: up(byTxt('span', /^How this world works$/), 2),
      introGo: byTxt('button', /^Start wandering/),
      tip: () => els('div').find((e) => e.style.pointerEvents === 'none' && e.style.transform === 'translate(16px, 16px)') || null,
      isHead: byTxt('button', /^Islands = .*Neighbouring islands are joined/),
      isPanel: up(() => S.isHead()),
      isOpener: byTxt('button', /^Islands = .*\+$/),
      isList: () => { const p = S.isPanel(); return p && [...p.children].find((e) => e.style.overflowY === 'auto') || null },
      // the colourings: the islands panel's, or the foot of the beast card when the panel is not shown
      grpRow: up(byTxt('span', /^Islands by$/)),
      grpBtn: (l) => () => { const r = S.grpRow(); return r && [...r.querySelectorAll('button')].find((b) => txt(b) === l) || null },
      cbRow: up(byTxt('span', /^Beasts by$/)),
      colLegend: () => { const r = S.cbRow(); return r && r.nextElementSibling },
      search: () => els('input').find((e) => e.placeholder === 'Find a beast…') || null,
      wander: up(byTxt('span', /^Your wanderings$/), 2),
      wCount: () => { const w = S.wander(); return w ? txt(w.children[0].children[1]) : '' },
      card: () => { const a = byTxt('a', /^Read the full entry/)(); return a && a.parentElement.parentElement },
      wiki: byTxt('a', /^Read the full entry in the wiki/), /* ADDED 2026-11-23 */
      cardHead: () => { const a = byTxt('a', /^Read the full entry/)(); return a && a.parentElement },
      arrange: up(byTxt('span', /^Arrange$/)),
      arr: (l) => () => { const r = S.arrange(); return r && [...r.querySelectorAll('button')].find((b) => txt(b) === l) || null },
      secHead: () => { const c = S.card(); return c ? all(c, 'div').find((e) => e.style.padding === '12px 0px 6px') || null : null },
      firstRow: () => { const h = S.secHead(); return h && h.parentElement.querySelector('button') },
      peekBar: byTxt('button', /^← ?Visiting /),
      stepBtn: () => els('button').find((b) => /^Step →$/.test(txt(b))) || null,
      legend: () => cmp.legRef.current && visible(cmp.legRef.current) ? cmp.legRef.current : null,
      legCard: () => { const l = S.legend(); return l && l.querySelector('button[title]') },
      rules: up(byTxt('span', /^New expedition along$/)),
      start: up(byTxt('span', /^Start$/)),
      flag: up(byTxt('span', /^Flag$/)),
      away: up(byTxt('span', /hops? away$|^At the flag$/), 2),
      foot: () => { const h = byTxt('button', /^Hint$/)(); return h && h.parentElement },
      journey: up(byTxt('span', /^Your journey$/)),
      report: up(byTxt('span', /^Expedition report$/)),
      chron: () => cmp.chronRef.current,
    }
    const st = () => cmp.state
    const nm = (id) => cmp.byId.get(id).name
    // the beast with the most links and the island with the most beasts, among those no panel covers (chosen once per tour);
    // the first neighbour in the card; the next hop on a shortest path
    let hubId = null, isl = null
    const hub = () => hubId || (hubId = [...cmp.nodes].sort((a, b) => cmp.adj.get(b.id).length - cmp.adj.get(a.id).length).find((n) => free(cmp.beastBox(n.id))).id)
    const bigIsland = () => isl || (isl = [...cmp.isl].sort((a, b) => b.list.length - a.list.length).find((I) => free(cmp.islandBox(I.k))))
    const firstNb = () => { const sd = cmp.council && cmp.council.sides; return sd ? ['left', 'right', 'top', 'bottom'].map((k) => sd[k][0]).find(Boolean).o : null }
    const nextHop = () => { const q = st().quest, f = st().focus; if (!q || !f || !cmp.nodes) return null; const d = q.distT.get(f); if (!d) return null
      return cmp.adj.get(f).filter((e) => cmp.ok(e, q.rule)).map((e) => (e.a === f ? e.b : e.a)).find((o) => q.distT.get(o) === d - 1) || null }
    const P = {
      hub: spot(() => cmp.beastBox(hub())),
      island: spot(() => cmp.islandBox(bigIsland().k)),
      council: spot(() => st().focus && cmp.council ? cmp.councilBox() : null),
      nb: spot(() => { const o = st().peek || firstNb(); return o ? cmp.beastBox(o) : null }),
      next: spot(() => { const o = nextHop(); return o ? cmp.beastBox(o) : null }),
      hint: spot(() => cmp.hintId && st().quest ? cmp.beastBox(cmp.hintId) : null),
      flag: spot(() => st().quest ? cmp.flagBox() : null),
    }
    return { S, P, fire, leave, out, settle, st, nm, hub, bigIsland, firstNb, nextHop, onMap }
  }

  const worldTour = (cmp) => {
    const { S, P, leave, out, settle, st, nm, hub, bigIsland, onMap } = worldKit(cmp)
    /* ADDED 2026-11-23: the card's sections as the page writes them ("Older ideas · 4, ..."), and the first legend card's name */
    const sides = () => all(S.card(), 'div').filter((e) => e.style.padding === '12px 0px 6px').map((h) => txt(h).replace(/\s*(\d+)$/, ' · $1')).join(', ')
    const legName = () => S.legCard().children[0].children[1]
    let kind = ''
    // the gathered neighbours when no panel covers them (on a phone the card does), else the given element
    const councilOr = (alt) => () => onMap(P.council)() || alt()
    const toTop = (find) => () => { const e = find(); if (e) cmp.cardRef.current.scrollTop = e.offsetTop - 8 }
    const narrow = () => cmp.W < 708
    const hop = [['click', P.next, 900], ['click', P.next, 600], ['do', settle]]
    return [
      ['do', async () => { cmp.setState({ intro: false }); if (st().mode !== 'explore' || st().focus) cmp.setMode('explore'); else cmp.fitWorld(); await settle() }],
      ['note', { at: [S.title, S.mode('Wander')], clear: [S.mode('Expedition'), S.mode('Chronicle')], title: 'Three ways to use the map',
        text: 'Wander: click beasts and read about them. Expedition: a game, get from one beast to a flag along the links. Chronicle: watch the bestiary grow era by era. The lit switch is the mode you are in.' }],
      ['click', S.help, 900],
      ['note', { at: [S.intro], title: 'How this world works',
        text: 'The ? button opens this short guide: islands are families of ideas, beasts are ideas, lines are the links between them.' }],
      ['click', S.introGo, 900],
      ['hover', P.island],
      ['note', { at: [P.island, S.tip], title: 'Islands are families of ideas',
        text: () => { const I = bigIsland(); return `Each island holds the ideas on one topic. ${I.label} has ${I.list.length} of the ${cmp.nodes.length} beasts. Hover an island to see which islands it shares the most links with: bridges join near ones, ships and planes far ones.` } }],
      ['do', leave],
      ['click', () => (narrow() ? S.isOpener() : null), 900],
      ['note', { at: [S.isList], title: 'The islands panel',
        text: () => `All ${cmp.isl.length} islands with the number of beasts on each. Click one to fly to it.` }],
      ['note', { at: [S.grpRow], title: 'Islands by',
        text: 'Regroups the beasts onto new islands: by family (the default), by era, by role in the argument or by canon. The beasts walk, sail or fly to their new homes.' }],
      ['click', S.grpBtn('Era'), 2600],
      ['click', S.grpBtn('Family'), 2600],
      ['note', { at: [S.cbRow, S.colLegend], title: 'Colours by role',
        text: () => `A beast's body colour is its role in the argument; the legend names them: ${[...S.colLegend().children].map(txt).join(', ')}. Bigger beasts are the core canon. Beasts by Family, Era or Canon recolours them.` }],
      ['click', () => (narrow() ? S.isHead() : null), 900],
      ['note', { at: [S.search, S.wander], title: 'The left panel',
        text: () => `Find a beast… searches by name. Your wanderings keeps every beast you visit; it holds ${S.wCount()} now. ← Back steps back, Clear trail forgets the trail.` }],
      ['hover', P.hub],
      ['note', { at: [S.tip], clear: [P.hub], title: 'Hover a beast',
        text: () => `The tooltip gives its island, name, role, weight and era, and its number of links: ${txt(S.tip()).match(/(\d+) links/)[1]} for ${nm(hub())}.` }],
      ['do', leave],
      ['click', P.hub, 600], ['do', settle],
      ['note', { at: [P.council], clear: [S.card], title: 'Click a beast: its neighbours gather',
        text: () => `${all(S.card(), 'span').filter((e) => e.style.color === 'rgb(154, 148, 139)' && /^\d+$/.test(txt(e))).reduce((a, e) => a + +txt(e), 0)} neighbours come to it: what it comes from on the left, what it leads to on the right, what argues with it above, kin and echoes below. The coloured base under a guest is its home island.` }],
      ['note', { at: [S.cardHead], title: 'The beast card',
        text: 'Island, name, role, weight and era, a short summary, who proposed the idea, and a link to its full entry in the wiki. × closes the card.' }],
      /* ADDED 2026-11-23: the wiki link, framed on its own (owner: the map exists so people read the essays) */
      ['note', { at: [S.wiki], clear: [S.cardHead], title: 'Read the full entry',
        text: () => `Read the full entry in the wiki ↗ opens the full essay on ${nm(st().focus)} in a new tab: what the idea is, who proposed it, how it links to the others. The map is here to help you find the essay you want to read.` }],
      ['note', { at: [S.arrange], title: 'Arrange',
        text: 'Relation places neighbours by kind of link. Time puts older ideas on the left and newer ones on the right; Role puts problems on the left and solutions on the right.' }],
      /* CHANGED 2026-11-23: Time, then Role, then back to Relation, with a note on the gathered neighbours after Time and after Role
         (owner: the tour clicked through Arrange without showing what moved); the card's lists are read off the page */
      ['click', S.arr('Time'), 600], ['do', settle],
      ['note', { at: [councilOr(S.arrange)], clear: [S.card], title: 'Arrange: Time',
        text: () => `The neighbours moved by era: older ideas on the left, newer ones on the right, the same era below. The card’s lists follow: ${sides()}.` }],
      ['click', S.arr('Role'), 600], ['do', settle],
      ['note', { at: [councilOr(S.arrange)], clear: [S.card], title: 'Arrange: Role',
        text: () => `Now by role: problems on the left, solutions on the right, claims and critiques above, lenses and evidence below. The card: ${sides()}.` }],
      ['click', S.arr('Relation'), 600], ['do', settle],
      ['do', toTop(S.secHead), 300],
      ['note', { at: [S.secHead, S.firstRow], title: 'Its neighbours, by side',
        text: () => `${txt(S.secHead()).replace(/\s*(\d+)$/, ' · $1')}: each row says how the two are linked, here “${txt(S.firstRow().children[1].children[1].children[0])}”. The number in the box is the one over the beast on the map.` }],
      ['note', { at: [S.legend], clear: [P.council], title: 'How to read the lines',
        text: () => `${S.legend().querySelectorAll('button[title]').length} kinds of link reach this beast, each with its own line: beads for logic, dashes for cause, a zigzag for debate, dots for kin, paw prints for history. Hover a kind to light up its lines, click it to hide them.` }],
      ['hover', S.legCard],
      /* ADDED 2026-11-23: a click on a kind hides its links and a second click brings them back, each with its note (owner: the
         tour only said so); the kind's name and count are read off its legend card before it is hidden */
      ['do', () => { kind = txt(legName()) }],
      ['click', S.legCard, 900],
      ['note', { at: [S.legCard, onMap(P.council)], clear: [S.card], title: 'Links hidden',
        text: () => `${kind.replace(/ · /, ': ')} links. A click on its card hid them on the map, and the card now says “${txt(legName()).replace(/^.* · /, '')}”. Show all links brings every kind back at once.` }],
      ['click', S.legCard, 900],
      ['note', { at: [S.legCard, onMap(P.council)], clear: [S.card], title: 'Links back',
        text: () => `A second click brings them back: ${txt(legName())}.` }],
      ['do', out(S.legCard), 300],
      ['click', P.nb, 900],
      ['note', { at: [onMap(P.nb), S.peekBar], clear: [S.cardHead], title: 'One click reads a neighbour',
        text: () => `The card now shows ${nm(st().peek)}, and its top bar leads back to ${nm(st().focus)}. A second click on the beast, or Step → in its row, moves there.` }],
      ['click', P.nb, 600], ['do', settle],
      ['note', { at: [S.wander], title: 'Your wanderings',
        text: () => `The trail now holds ${S.wCount()}. Click a stop to go back to it.` }],
      ['click', S.mode('Expedition'), 600], ['do', settle],
      ['note', { at: [S.rules], title: 'New expedition along',
        text: 'Each switch starts a new expedition with its own rule: Any link, Logic chain (Roots only), Cause chain (Currents only), Through time (Lineage only). The lit one is the rule now.' }],
      ['note', { at: [S.start, S.flag], title: 'Start and flag',
        text: () => `You stand on ${nm(st().quest.s)}. The flag is ${nm(st().quest.t)}, ${st().quest.best} hops away. Under it: a short summary and the flag's neighbours, so you know what to look for.` }],
      ['note', { at: [P.flag], title: 'The flag on the map',
        text: 'A gold flag marks it, or a gold arrow at the edge points to it. The flag’s island has a moving gold outline, and small gold flags mark neighbours that live there.' }],
      ['note', { at: [S.away], title: 'Hops away',
        text: () => `${txt(S.away().children[0].children[0])} from here. Hops made counts your hops; best possible is the shortest route.` }],
      ['click', P.next, 900],
      ['click', () => S.stepBtn() || P.next(), 600], ['do', settle],
      ['note', { at: [S.away, S.journey], title: 'One hop',
        text: () => `${txt(S.away().children[0].children[0])}: ${txt(S.away().children[0].children[1]).toLowerCase()}. Your journey lists each hop and how the two beasts are linked.` }],
      ['click', byText(document, 'button', /^Hint$/), 900],
      ['note', { at: [onMap(P.hint), S.foot], title: 'Hint, Undo, Give up',
        text: () => `Hint rings the next beast on a shortest path in gold: ${nm(cmp.hintId)}. Undo steps back one hop. Give up shows a shortest route.` }],
      ...hop, ...hop, ...hop, ...hop,
      ['note', { at: [S.away, byText(document, 'button', /^Show expedition report$/)], title: 'At the flag',
        text: () => `${nm(st().quest.t)} reached in ${st().quest.hops} hops; the best possible is ${st().quest.best}. Fireworks, and the report is ready.` }],
      ['click', byText(document, 'button', /^Show expedition report$/), 900],
      ['note', { at: [S.report], title: 'Expedition report',
        text: () => `${st().result.grade}. Your route and a shortest route stand side by side, every hop with its link.` }],
      ['click', byText(document, 'button', /^New expedition →$/), 600], ['do', settle],
      ['click', byText(document, 'button', /^Give up$/), 900],
      ['note', { at: [S.report], title: 'Give up',
        text: 'Shows a shortest route to the flag. Keep trying closes the report and lights a hint; New expedition → starts another.' }],
      ['click', byText(document, 'button', /^Keep trying$/), 900],
      ['click', S.mode('Chronicle'), 2400],
      ['note', { at: [S.chron], title: 'Chronicle',
        text: () => `The bestiary grows era by era, from myths to the LLM era, each new idea walking out of the older one it descends from. ▶ plays it, the slider picks an era, the count says how many beasts are alive by then: all ${cmp.nodes.length} in the LLM era.` }],
      ['click', S.mode('Wander'), 600],
      /* ADDED 2026-11-23: the closing note points to the next thing to do: open a beast and read its essay */
      ['click', P.hub, 600], ['do', settle],
      ['note', { at: [S.wiki], clear: [S.cardHead], title: 'Next: read an essay',
        text: () => `Every beast is an essay. Open any beast, ${nm(st().focus)} for example, and Read the full entry in the wiki ↗. Click anywhere to take over the map.` }],
    ]
  }

  const bootWorld = () => {
    const cmp = window.__bestiaryWorld, btn = document.querySelector('button[title="Demo: how to read this"]')
    if (!cmp || !btn) { setTimeout(bootWorld, 300); return }
    document.head.append(Object.assign(document.createElement('style'), { textContent: CSS }))
    const root = Object.assign(document.createElement('div'), { style: 'position:fixed;inset:0;pointer-events:none;z-index:60' })
    document.body.append(root)
    window.BestiaryDemo.playWorld = startDemo(root, () => worldTour(cmp), { button: btn, watch: document, scroll: false }).play /* CHANGED 2026-11-23: the intro overlay's Watch the demo button plays it */
  }

  // ADDED 2026-11-23: the page names its tour on the script tag (data-tour="world" on the Bestiarium Map); no name is the interactives
  const PAGE = document.currentScript.dataset.tour || 'interactives'
  const boot = () => {
    const ready = ['2w', '4a', '2f'].every((id) => { const e = document.getElementById(id); return e && e.querySelector('button') })
    if (!ready) { setTimeout(boot, 300); return }
    document.head.append(Object.assign(document.createElement('style'), { textContent: CSS }))
    for (const id of Object.keys(TOURS)) startDemo(document.getElementById(id), TOURS[id])
  }
  /* CHANGED 2026-11-23: each page boots its own tour; window.BestiaryDemo lets a script drive the engine (the Expedition video) */
  window.BestiaryDemo = { startDemo, wait, txt, worldKit }
  document.addEventListener('DOMContentLoaded', () => setTimeout(PAGE === 'world' ? bootWorld : boot, 300))
})()
