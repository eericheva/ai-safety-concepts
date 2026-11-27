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
.bd-tip i{position:absolute;left:0;bottom:0;width:100%;height:3px;background:#d8a24a;transform-origin:left}
.bd-layer.bd-find .bd-frame{fill:rgba(255,107,94,.08);stroke:#ff6b5e}
.bd-layer.bd-find .bd-arrow{stroke:#ff6b5e}
.bd-layer.bd-find .bd-tip{border-color:#ff6b5e;box-shadow:0 0 0 2px #ff6b5e,0 12px 40px rgba(0,0,0,.55)}
.bd-layer.bd-find .bd-tip b{color:#ff6b5e}
.bd-layer.bd-find .bd-tip{overflow:visible}
.bd-tip em{position:absolute;left:-1px;bottom:100%;margin-bottom:2px;padding:5px 9px;background:#ff6b5e;color:#0c0b0a;white-space:nowrap;font:700 10px/1 'JetBrains Mono',monospace;font-style:normal;letter-spacing:.08em;text-transform:uppercase}` /* ADDED 2026-11-24: a note with finding: true is one of the page's results (owner): red, the how-to notes stay gold */

  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const look = (t) => (typeof t === 'function' ? t() : t)
  const txt = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '')

  // A step is ['click', target] | ['hover', target] | ['note', {at: [targets], title, text}]; a target is
  // an element or a function that finds it when the step runs (the page re-renders as the tour clicks).
  // `title` and `text` may be functions too, so a note reads its numbers off the page when it opens.
  // ADDED 2026-11-24: a note with `finding: true` is one of the page's results (owner): its card, frames and arrows are red and it says
  // "Interesting finding" on a tab above its card; the how-to notes stay gold. Two per tour, three on the map.
  // CHANGED 2026-11-02: a note may also list `clear: [targets]`, the elements its text is about that the card
  // must not cover besides the framed ones; a target there may find an element or a list of them.
  // ADDED 2026-11-23: `opts` lets another page use the tour: `button` is a button the page already has (none is made then),
  // `watch` is where a real click ends the tour (the root by default), `controls: false` hides Pause and Next, and
  // `readMs(words)` sets how long a note stays, `scroll: false` keeps the tour from scrolling the page (a page that fits the screen,
  // where scrolling an element into view would scroll a toolbar's hidden overflow instead). A step may also be ['do', fn, ms]: run fn, wait for what it returns, then ms.
  /* ADDED 2026-11-23 (stage 1 of the tours' rebuild): `hold()` is called when a tour starts and returns the function that puts the page
     back as it was (picked idea, tab, root; on the map: mode, beast, grouping, camera); it runs when the tour ends or is stopped.
     A note with `dep: true` is skipped when the click or hover before it was not carried out. A click or hover is carried out only
     when the point the cursor is drawn at lies on the target and nothing covers it; otherwise the step is skipped and the console
     says so (console.debug). */
  function startDemo(root, tour, opts = {}) {
    const cur = document.createElement('div'); cur.className = 'bd-cursor'; cur.innerHTML = CURSOR
    const ring = cur.querySelector('span')
    /* CHANGED 2026-11-23: the page's own button when it has one (opts.button) */
    const btn = opts.button || Object.assign(document.createElement('button'), { type: 'button', className: 'bd-btn', textContent: '▶ Demo: how to read this' })
    const layer = document.createElement('div'); layer.className = 'bd-layer'
    const svg = document.createElementNS(SVG, 'svg'); layer.appendChild(svg)
    const card = document.createElement('div'); card.className = 'bd-tip'; layer.appendChild(card)
    root.append(...(opts.button ? [] : [btn]), cur, layer)
    let run = 0, playing = false, next = () => {}, back = () => {}, did = true
    const moved = new Map()
    /* ADDED 2026-11-23: the cursor and the note layer are placed from the root's padding box, so positions are taken from it,
       not from its border box (the blocks have a 4px top and a 1px left border: every cursor and frame stood 4px low, 1px right) */
    const org = () => { const a = root.getBoundingClientRect(); return { left: a.left + root.clientLeft, top: a.top + root.clientTop } }
    /* ADDED 2026-11-23: the boxes that clip an element (a sideways strip .bscroll, a list .zcol, the stage, a panel of the map) */
    const clips = (el) => { const out = []; for (let x = el.parentElement; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') out.push(x) } return out }
    const inner = (x) => { const q = x.getBoundingClientRect(); return { left: q.left + x.clientLeft, top: q.top + x.clientTop, right: q.left + x.clientLeft + x.clientWidth, bottom: q.top + x.clientTop + x.clientHeight } }
    /* ADDED 2026-11-23: scrolls the element's own scrollers, innermost first, by as little as shows it (centred when it is larger than
       the scroller, or when `mid` asks: a panel's sticky foot may cover a target that stands at the scroller's edge); where each
       stood is kept in `moved` and put back when the tour stops. The page itself is not scrolled here. */
    const reveal = (el, mid) => clips(el).forEach((x) => {
      const c = getComputedStyle(x), r = el.getBoundingClientRect(), q = inner(x), m = 16
      const by = (lo, hi, a, b) => (mid || hi - lo > b - a - 2 * m ? (lo + hi) / 2 - (a + b) / 2 : lo < a + m ? lo - a - m : hi > b - m ? hi - b + m : 0)
      const dx = /auto|scroll/.test(c.overflowX) ? by(r.left, r.right, q.left, q.right) : 0, dy = /auto|scroll/.test(c.overflowY) ? by(r.top, r.bottom, q.top, q.bottom) : 0
      if (!dx && !dy) return
      if (!moved.has(x)) moved.set(x, [x.scrollLeft, x.scrollTop])
      x.scrollLeft += dx; x.scrollTop += dy
    })
    /* ADDED 2026-11-23: the part of an element that is on show: its box cut by its clipping boxes and by the screen's sides
       (and by the screen's top and bottom on a page the tour does not scroll) */
    const seen = (el) => {
      const r = el.getBoundingClientRect(); let x0 = Math.max(r.left, 4), y0 = r.top, x1 = Math.min(r.right, document.documentElement.clientWidth - 4), y1 = r.bottom /* 4: a frame is drawn 4px around its box */
      if (opts.scroll === false) { y0 = Math.max(y0, 0); y1 = Math.min(y1, innerHeight) }
      for (const x of el.parentElement ? clips(el) : []) { const q = inner(x); x0 = Math.max(x0, q.left); y0 = Math.max(y0, q.top); x1 = Math.min(x1, q.right); y1 = Math.min(y1, q.bottom) }
      return { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 }
    }
    const onShow = (el) => { const b = seen(el); return b.width > 1 && b.height > 1 && b.bottom > 0 && b.top < innerHeight }
    /* CHANGED 2026-11-23: where the cursor points on a target: a spot of the map says so itself (the point its event goes to); else
       inside the part on show, at mid-height for a target under 28px high (on a 16px row 55% of the height plus the arrow's own
       offset reached the next row). `aim` gives the point only when the target is what lies under it. */
    const point = (el) => { if (el.point) return el.point(); const b = seen(el); return [b.left + Math.min(b.width * 0.5, 60), b.top + b.height * (b.height < 28 ? 0.5 : 0.55)] }
    const aim = (el) => { if (el.aim) return el.aim(); const p = point(el), u = document.elementFromPoint(p[0], p[1]); return u && (u === el || el.contains(u)) ? p : null }
    /* CHANGED 2026-11-23: the arrow's tip (3px right, 2px below the cursor box's corner) is drawn on the point itself */
    const moveTo = (p) => { const o = org(); cur.style.transform = `translate(${p[0] - o.left - 3}px,${p[1] - o.top - 2}px)` }
    const showNote = async (n, token) => {
      let els = n.at.map(look).filter((e) => e && e.isConnected)
      if (!els.length) return
      /* ADDED 2026-11-23: the framed elements are scrolled into their strips before anything is measured, the first one last */
      ;[...els].reverse().forEach(reveal)
      const rs = els.map(seen)
      const top = Math.min(...rs.map((r) => r.top)), bottom = Math.max(...rs.map((r) => r.bottom))
      if (opts.scroll === false) {} /* CHANGED 2026-11-23: see opts.scroll */
      else if (bottom - top < innerHeight - 200) scrollBy({ top: (top + bottom) / 2 - innerHeight / 2, behavior: 'smooth' })
      else els[0].scrollIntoView({ block: 'center', behavior: 'smooth' })
      await wait(650); if (token !== run) return
      /* ADDED 2026-11-23: an element with nothing on show is not framed; a note with nothing to frame is not opened */
      els = els.filter((e) => e.isConnected && onShow(e))
      /* ADDED 2026-11-23: on a page with sideways strips, a second target of which less than 60% is on show is not framed (a sliver of a frame at the strip's edge says nothing); the note's text names it */
      const part = (e) => { const b = seen(e), r = e.getBoundingClientRect(); return (b.width * b.height) / (r.width * r.height) }
      if (opts.scroll !== false) els = els.filter((e, k) => !k || part(e) > 0.6)
      if (!els.length) return
      moveTo(point(els[0])); await wait(700); if (token !== run) return
      const a = org() /* CHANGED 2026-11-23: see org */
      const bs = els.map((e) => { const b = seen(e); return { x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height } }) /* CHANGED 2026-11-23: a frame is cut to the part on show */
      const W = root.clientWidth, H = root.clientHeight
      const x0 = Math.min(...bs.map((b) => b.x)), x1 = Math.max(...bs.map((b) => b.x + b.w))
      const y0 = Math.min(...bs.map((b) => b.y)), y1 = Math.max(...bs.map((b) => b.y + b.h))
      card.innerHTML = ''
      layer.classList.toggle('bd-find', !!n.finding) /* ADDED 2026-11-24 */
      const t = document.createElement('b'); t.textContent = look(n.title)
      const k = document.createElement('em'); k.textContent = '★ Interesting finding'
      const p = document.createElement('p'); p.textContent = look(n.text)
      const bar = document.createElement('i'), ctl = document.createElement('div')
      const hold = document.createElement('button'); hold.type = 'button'; hold.textContent = 'Pause'
      const go = document.createElement('button'); go.type = 'button'; go.textContent = 'Next ›'
      ctl.append(hold, go); card.append(...(n.finding ? [k] : []), t, p, ...(opts.controls === false ? [] : [ctl]), bar) /* CHANGED 2026-11-23: see opts.controls */
      // CHANGED 2026-11-02: the card goes where it covers least of what the note is about. Candidates sit
      // right of, left of, below and above the framed union and in the corners and edges of the part of the
      // block on screen, in three widths; each is scored by the area it covers of the frames (weighted 4)
      // and of the note's `clear` elements; ties go to the one nearest the frames, then to the wider card.
      // A card may sit past the top or bottom of the screen if it and the frames still fit on it together:
      // the card is scrolled into view when it opens.
      const rel = (r) => ({ x0: r.left - a.left, y0: r.top - a.top, x1: r.right - a.left, y1: r.bottom - a.top })
      const keep = [...els.map((e) => ({ ...rel(seen(e)), k: 4, m: 12 })),
        ...(n.clear || []).flatMap((g) => [look(g)].flat()).filter((e) => e && e.isConnected && shown(e))
          .map((e) => ({ ...rel(seen(e)), k: 1, m: 4 })).filter((r) => r.x1 > r.x0 && r.y1 > r.y0)] /* CHANGED 2026-11-23: the parts on show */
      const V = { x0: Math.max(0, -a.left) + 12, y0: 12, x1: Math.min(W, document.documentElement.clientWidth - a.left) - 12, y1: H - 12 }
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
      svg.innerHTML = `<defs><marker id="bd-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${n.finding ? '#ff6b5e' : '#d8a24a'}"/></marker></defs>`
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
    /* CHANGED 2026-11-23: a stopped tour puts the strips it scrolled and the page's state back (`asIs` leaves the state: the reader
       clicked a control of the page, and the click must land on what the reader sees) */
    const stop = (asIs) => {
      const was = playing; run++; playing = false; cur.style.opacity = '0'; layer.classList.remove('on'); svg.replaceChildren(); next()
      if (!was) return
      if (!asIs) { moved.forEach(([l, t], x) => { x.scrollLeft = l; x.scrollTop = t }); back() }
      moved.clear()
    }
    const play = async () => {
      stop(); const token = ++run; playing = true; did = true; back = () => {}
      await wait(300); if (token !== run) return
      back = opts.hold ? opts.hold() : back /* ADDED 2026-11-23: see opts.hold; after the wait, so a tour restarted mid-way keeps the state the stop above put back */
      cur.style.opacity = '1'
      for (const s of tour(root)) {
        if (token !== run) return
        if (s[0] === 'note') { if (!s[1].dep || did) await showNote(s[1], token); continue } /* CHANGED 2026-11-23: see `dep` */
        if (s[0] === 'do') { await s[1](() => token === run); await wait(s[2] || 0); continue } /* ADDED 2026-11-23: see opts */ /* CHANGED 2026-11-23 (stage 2): fn is given a function that says whether this tour still plays, for a step that waits or types */
        /* ADDED 2026-11-23: ['leave', target] takes the pointer off an element the tour hovered (a hover of the page stays until its element is left) */
        if (s[0] === 'leave') { const el = look(s[1]); if (el) { el.dispatchEvent(new MouseEvent('mouseleave')); el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })) } await wait(s[2] || 400); continue }
        /* CHANGED 2026-11-23: the target's strips are scrolled first; the cursor goes to a point that lies on the target, and waits
           for a target that is still moving (a beast walking on the map); a target that is covered, off screen or gone is skipped */
        did = false
        const el = look(s[1])
        if (!el || !el.isConnected) continue
        const b = el.getBoundingClientRect()
        if (opts.scroll !== false && (b.bottom < 80 || b.top > innerHeight - 80)) { /* CHANGED 2026-11-23: see opts.scroll */ el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await wait(550) }
        reveal(el); if (!aim(el)) reveal(el, true)
        let p = aim(el)
        for (let k = 0; p && k < 5; k++) {
          moveTo(p); await wait(850); if (token !== run) return
          const q = el.isConnected ? aim(el) : null
          if (q && Math.hypot(q[0] - p[0], q[1] - p[1]) < 2) break
          p = k < 4 ? q : null
        }
        if (!p) { console.debug(`bestiary-demo: skipped ${s[0]}, its target is covered, off screen or moving`); continue }
        did = true
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
    const mine = (e) => e.target === btn || btn.contains(e.target) || card.contains(e.target)
    ;(opts.watch || root).addEventListener('pointerdown', (e) => { if (playing && e.isTrusted && !mine(e)) stop(getComputedStyle(e.target).cursor === 'pointer' || !!e.target.closest('a,button,input')) }, true)
    /* ADDED 2026-11-23: while a tour plays, the real pointer's moves, enters and leaves do not reach the block: a real leave cleared
       the tour's hover (Zooming in's zLeave) and a real hover replaced it */
    for (const t of ['mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousemove', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave', 'pointermove'])
      (opts.watch || root).addEventListener(t, (e) => { if (playing && e.isTrusted && !mine(e)) e.stopPropagation() }, true)
    return { play, stop }
  }

  // ---- finding things on the page ----
  const all = (root, sel) => [...root.querySelectorAll(sel)]
  // an element on a step of Zooming in that is not shown sits under a parent with opacity 0
  const shown = (e) => { for (let x = e; x; x = x.parentElement) if (x.style && x.style.opacity === '0') return false; return true }
  const byText = (root, sel, re) => () => all(root, sel).find((e) => re.test(txt(e)) && shown(e)) || null
  const spanText = (root, re) => byText(root, 'span', re)
  // The whole bestiary: the idea rows (16px high, clickable), the column heads, the selected chip
  // CHANGED 2026-11-22: design review: a row is a button now, 16px high (24px below 700px); it is told by its 2px left mark
  const wRows = (root) => all(root, 'button[title]').filter((e) => e.style.borderLeftWidth === '2px')
  // CHANGED 2026-11-02: heads and lit rows, for the notes' `clear` lists
  const heads = (root) => () => all(root, 'div').filter((e) => e.style.height === '26px' && e.style.textTransform === 'uppercase')
  const litRows = (root) => () => wRows(root).filter((e) => e.style.fontWeight === '700')
  const info = (root) => () => all(root, 'span').find((e) => /feed it|nothing feeds it|feeds them|feed them|of its own|stays inside/.test(txt(e)) && e.children.length === 0 && e.style.fontWeight !== '700') || null /* CHANGED 2026-11-23: also the line of an idea placed by a neighbour ("feed them"); never the count line of An idea feeds — and is fed */
  const selChip = (root) => () => all(root, 'span').find((e) => e.style.background === 'rgb(216, 162, 74)' && e.style.height === '40px') || null /* CHANGED 2026-11-22: the picked beast is 40px (brand book sizes) */

  /* ADDED 2026-11-23: the page's component (window.__bestiaryInteractives). The tours read from it what the page itself computed
     (the axes with their columns and the reach of every idea, the layers of Zooming in, the links), so every idea a tour points at
     is chosen by a rule and every number is counted when its note opens. The state a tour changes is put back when it ends.
     While a tour plays, Zooming in's own Play is paused. */
  const page = () => window.__bestiaryInteractives
  const ideas = () => page().state.data.length
  const nm = (id) => page().by[id].name
  const picked = () => page().state.sel
  const axis = () => page().axes[page().state.ax]
  /* an idea has a tree of its own on an axis when it has a link the axis keeps; the others are placed by a neighbour (`bridge`) */
  const own = (g, m) => !(m in g.bridge)
  const reach = (g, m) => g.steps[m][0] + g.steps[m][1]
  const most = (list, f) => list.reduce((a, b) => (f(b) > f(a) ? b : a), list[0])
  const pct = (a, b) => Math.round((100 * a) / b)
  const holdPage = (root) => () => {
    const c = page(), before = c.state, live = ['data', 'W', 'RH', 'tick']
    c.setState({ zPlay: false })
    return () => { c.auto.z = 0; c.setState({ ...Object.fromEntries(Object.keys(c.state).filter((k) => !live.includes(k)).map((k) => [k, before[k]])), zHover: root.matches(':hover') }); c.zRestart() }
  }

  /* CHANGED 2026-11-23 (stage 2 of the tours' rebuild): the three tours are built anew from the findings the blind checks confirmed.
     Each opens on one result, gives every other result a short chapter (the clicks that make the page show it, then one note)
     and ends on the block's strongest one. The first target of a note is the one its strip is scrolled to; a second target that
     does not fit beside it is not framed, and the text names it. */
  const TOURS = {
    '2w': (root) => {
      const tab = (l) => byText(root, 'button', new RegExp(`^${l}$`))
      const row = (id) => () => { const m = id(); return (m && wRows(root).find((e) => txt(e) === nm(m))) || null }
      const head = (k) => () => heads(root)()[k()] || null
      const selRow = row(picked)
      const last = () => axis().n - 1
      /* lit rows of every column for the picked idea, the idea itself left out */
      const litCols = () => { const g = axis(), seen = page().near(g, picked()).seen; return g.C.map((c) => c.filter((m) => m !== picked() && seen.has(m)).length) }
      const fed = () => axis().steps[picked()][0], feeds = () => axis().steps[picked()][1]
      const fadedOn = (k) => page().axes[k].ghost.size
      /* the rules that pick the ideas: the first row of the last column (rows stand by reach, widest first); the idea that feeds
         the most among those with links of their own; the widest and the next widest idea of the first column */
      const lastFirst = () => axis().C[last()][0]
      const feeders = () => { const g = axis(); return Object.keys(g.steps).filter((m) => own(g, m)).sort((p, q) => g.steps[q][1] - g.steps[p][1]) }
      const openers = () => { const g = axis(); return g.C[0].filter((m) => own(g, m)).sort((p, q) => g.steps[q][1] - g.steps[p][1]) }
      const firstFaded = () => axis().C[0].find((m) => axis().ghost.has(m))
      const sizes = () => axis().C.map((c) => c.length)
      const kMax = () => sizes().indexOf(Math.max(...sizes())), kMin = () => sizes().indexOf(Math.min(...sizes()))
      const kLit = () => litCols().indexOf(Math.max(...litCols()))
      const away = () => (/one link away: ([^·]+)/.exec(txt(info(root)())) || [])[1]
      /* ADDED 2026-11-23 (after the blind verification): an idea feeds "more than any other" only when no other idea of the tab, placed by a neighbour or not, feeds as many */
      const tops = (m) => { const g = axis(); return Object.keys(g.steps).every((o) => o === m || g.steps[o][1] < g.steps[m][1]) }
      return [
        // 1. Time: the newest ideas draw on every era
        ['click', tab('Time')],
        ['click', row(lastFirst), 1600],
        ['note', { dep: true, at: [selRow, selChip(root)], clear: [litRows(root)],
          /* CHANGED 2026-11-23 (after the blind verification): the first column of Time holds the myths and the ideas with no date, so it is not counted as an era */
          title: () => { const c = axis().col[picked()]; return `${nm(picked())}: fed from ${litCols().slice(1, c).filter((x) => x).length} of the ${c - 1} dated eras before it` },
          text: () => { const g = axis(), c = g.col[picked()], l = litCols(), dated = l.slice(1, c)
            return `On Time a column is an era, and ${nm(picked())} stands in the newest one, ${g.labels[c]}. The click lit what feeds it within three steps: ${fed()} of ${ideas()} ideas. ${dated.reduce((a, x) => a + x, 0)} of them stand in ${dated.filter((x) => x).length} of the ${c - 1} dated eras to its left.${l[0] ? ` The other ${l[0]} stand under ${g.labels[0]}, the column of myths and of ideas with no date.` : ''}` } }],
        // 2. Logic: most of the first column is not premises
        ['click', tab('Logic')],
        ['note', { at: [row(firstFaded), head(() => 0)], clear: [() => wRows(root).filter((e) => axis().C[0].some((m) => nm(m) === txt(e)))],
          title: () => { const c = axis().C[0]; return `${c.filter((m) => axis().ghost.has(m)).length} of the ${c.length} ideas under ${axis().labels[0]} are faded` },
          text: () => { const g = axis(), c = g.C[0]; return `On Logic a column is a step of reasoning, and the first column, ${g.labels[0]}, holds ${c.length} ideas. From this row down they are faded: ${c.filter((m) => g.ghost.has(m)).length} of the ${c.length} have no logical link of their own. The page puts such an idea in the column of its nearest linked neighbour, or in the first column when it has none. On the whole tab ${g.ghost.size} of ${ideas()} ideas are faded.` } }],
        // 3. Role ladder: the longest and the shortest column, and the idea that feeds the most
        ['click', tab('Role ladder')],
        ['note', { at: [head(kMax), head(kMin)], clear: [heads(root), () => [kMax(), kMin()].flatMap((k) => all(heads(root)()[k].parentElement, 'button'))],
          title: () => `${axis().labels[kMax()]}: ${sizes()[kMax()]} ideas. ${axis().labels[kMin()]}: ${sizes()[kMin()]}`,
          text: () => `On Role ladder a column is a role in the argument. The longest column is ${axis().labels[kMax()]}, ${sizes()[kMax()]} of ${ideas()} ideas. The shortest is ${axis().labels[kMin()]}, ${sizes()[kMin()]} of ${ideas()}: about ${Math.round(sizes()[kMax()] / sizes()[kMin()])} ideas of the first role for each idea of the second.` }],
        ['click', row(() => feeders()[0]), 1600],
        ['note', { dep: true, at: [selRow, head(kLit)], clear: [litRows(root), selChip(root), info(root)], /* CHANGED 2026-11-23: the card keeps off the chip and the line with the idea's numbers */
          title: () => `${nm(picked())} feeds ${feeds()} of ${ideas()} ideas`,
          text: () => `${fed() ? `${fed()} ideas feed it on this tab, and it` : 'Nothing feeds it on this tab, and it'} feeds ${feeds()} ideas within three steps${tops(picked()) ? ', more than any other idea on Role ladder' : ''}. ${litCols()[kLit()]} of the ${feeds()} stand under ${axis().labels[kLit()]}, a column of ${sizes()[kLit()]} ideas.` }],
        // 4. Debate: the idea that opens the largest argument
        ['click', tab('Debate')],
        ['click', row(() => openers()[0]), 1600],
        ['note', { finding: true, dep: true, at: [selRow, info(root)], clear: [litRows(root)],
          title: () => (tops(picked()) ? `${nm(picked())} opens the largest argument: ${feeds()} ideas` : `${nm(picked())}: ${feeds()} ideas answer it`),
          text: () => `On Debate a column is a turn of the argument: an idea feeds its critique. ${fed() ? '' : `Nothing feeds ${nm(picked())} here. `}${feeds()} of ${ideas()} ideas answer it within three steps, ${litCols()[1]} of them in the next column.${openers()[1] ? ` The next widest opener, ${nm(openers()[1])}, feeds ${axis().steps[openers()[1]][1]}.` : ''}` }],
        // 5. Cause: the longest chain, and the one idea it ends in
        ['click', tab('Cause')],
        ['note', { at: [head(last), row(lastFirst)],
          title: () => `Cause: ${axis().n} columns, ${axis().n - 1} steps from the first to the last`,
          text: () => { const g = axis(), nl = page().axes.logic.n, nd = page().axes.debate.n, c = g.C[last()]
            return `Logic has ${nl} columns and Debate ${nd}. Cause has ${g.n}${g.n > Math.max(nl, nd) ? ': the longest chain of links in the bestiary is causal' : ''}. Its last column, ${g.labels[last()]}, holds ${c.length} of ${ideas()} ideas${c.length === 1 ? `: ${nm(c[0])}` : ''}.` } }],
        ['click', row(lastFirst), 1600],
        ['note', { finding: true, dep: true, at: [selRow, selChip(root), info(root)], clear: [litRows(root)],
          title: () => `${nm(picked())}: ${fed()} ideas lead here, ${feeds() ? `it feeds ${feeds()}` : 'nothing leads on'}`,
          text: () => `${nm(picked())} ${axis().C[last()].length === 1 ? 'is the only idea' : 'stands'} in the last column of Cause. ${fed()} of ${ideas()} ideas feed it within three steps, ${litCols()[0]} of them under ${axis().labels[0]}, and it feeds ${feeds() || 'nothing'}.` }],
        // 6. Debate again, with the end of the causal chain still picked: the thinnest tab
        ['click', tab('Debate')],
        ['note', { at: [info(root), selChip(root)],
          title: () => (axis().ghost.has(picked()) ? `${nm(picked())} has no debate link of its own` : `The debate around ${nm(picked())}`),
          text: () => { const F = fadedOn('debate'), Fc = fadedOn('cause'), Fl = fadedOn('logic')
            const lead = axis().ghost.has(picked())
              ? `${picked() === page().axes.cause.C[page().axes.cause.n - 1][0] ? `${nm(picked())} closes the longest causal chain, and the bestiary records no debate link for it.` : `The bestiary records no debate link for ${nm(picked())}.`} ${away() ? `The page lights its nearest linked neighbour instead: ${away().trim()}. The numbers on the chip, ←${fed()} ${feeds()}→, are that neighbour's reach.` : 'It has no linked neighbour to light either.'}`
              : `${fed()} ideas feed it on Debate and it feeds ${feeds()}.`
            return `${lead} ${F} of ${ideas()} ideas are faded like this on Debate, against ${Fc} on Cause and ${Fl} on Logic${F > Math.max(Fc, Fl) ? ': of the three link tabs, Debate covers the fewest ideas' : ''}.` } }],
      ]
    },
    '4a': (root) => {
      const P = page, by = () => P().by
      const tab = (l) => byText(root, 'button', new RegExp(`^${l}$`))
      const label = (re) => { const s = spanText(root, re)(); let e = s && s.nextElementSibling; while (e && e.tagName !== 'BUTTON') e = e.nextElementSibling; return e }
      const follow = () => label(/^Follow$/) /* the chip of the idea picked on the page */
      const alongChips = () => { const s = spanText(root, /^Alongside · \d+$/)(); return s ? all(s.parentElement, 'button').filter((b) => s.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) : [] }
      const stage = () => all(root, 'div').find((e) => e.style.overflow === 'hidden' && e.style.alignSelf === 'center')
      const level = (i) => stage().children[i]
      const cap = () => byText(root, 'button', /^‹$/)().nextElementSibling.children[0]
      /* the layer on show (Canon, Role, Family…): its field, label and group names; the groups' sizes; the links */
      const lay = () => P().zCache.l0[P().state.zM]
      const size = (k) => P().state.data.filter((n) => n[lay().f] === k).length
      const links = () => P().edgesList
      const inside = (f) => links().filter(([p, q]) => by()[p][f] === by()[q][f]).length
      /* the roads of a group, as the page counts them: links with one end in it, by the group of the other end, widest first */
      const roads = (k) => { const f = lay().f, c = {}; links().forEach(([p, q]) => { const a = by()[p][f], b = by()[q][f]; if (a !== b && (a === k || b === k)) { const o = a === k ? b : a; c[o] = (c[o] || 0) + 1 } }); return Object.entries(c).sort((a, b) => b[1] - a[1]) }
      const mine = () => by()[picked()][lay().f]
      const top = () => roads(mine())[0][0]
      /* the Bestiary step: the row with the fewest groups; the Layer and District steps: the layer buttons, the islands */
      const coarsest = () => most([...level(0).children].filter((e) => e.tagName === 'DIV' && e.style.cursor === 'pointer'), (e) => -parseInt(txt(e.children[1])))
      const mapBtn = (l) => byText(root, 'button', new RegExp(`^${l} · \\d+$`))
      const isles = () => [...all(level(1), 'div').filter((e) => e.style.borderRadius === '42%'), ...all(level(1), 'span')] /* every island and its label */
      const island = (k) => () => all(level(1), 'div').filter((e) => e.style.borderRadius === '42%')[P().zCache['l1' + lay().f].isl.findIndex((s) => s.k === k())] || null
      /* an island is hovered at its left rim: its middle is covered by its tiles, which are other, clickable elements */
      const rim = (isl) => () => { const e = isl(); return e && { parentElement: e.parentElement, get isConnected() { return e.isConnected }, contains: (u) => u === e, dispatchEvent: (ev) => e.dispatchEvent(ev),
        getBoundingClientRect: () => { const r = e.getBoundingClientRect(); return new DOMRect(r.left + 1, r.top + r.height / 2 - 6, 6, 12) } } }
      const cards = () => [...level(2).children].filter((e) => e.style.height === '112px')
      const card = (id) => () => cards().find((e) => txt(e) === nm(id())) || null
      const litCard = () => cards().find((e) => e.style.opacity === '1' && txt(e) !== nm(picked())) || null
      /* the Circuit step: the rows of Leads to; a remedy is a row marked mitigates or solves */
      const outRows = () => [...level(3).children].filter((e) => e.style.width === '300px' && e.style.left === '796px')
      const remedies = () => outRows().filter((r) => /^(mitigates|solves)$/.test(txt(r.lastElementChild)))
      const num = (re) => +txt(spanText(root, re)()).replace(/\D/g, '')
      /* Pros and cons: the verdict line, the two columns of cards, and the same balance counted for any idea */
      const verdict = spanText(root, /^\d+ for · \d+ against/)
      const col = (re) => () => { const s = spanText(root, re)(); return s ? all(s.parentElement, '.zcol > div') : [] }
      const pos = col(/^\+ Supports/), neg = col(/^− Argues against/)
      const cardName = (c) => txt(c.children[1].children[0]), cardRel = (c) => txt(c.children[1].children[1]), cardText = (c) => txt(c.children[1].children[2])
      const sides = (id) => { const C = P().constructor, a = by()[id].adj; return [a.filter((e) => C.POS.includes(e[1])).length, a.filter((e) => C.NEG.includes(e[1])).length] }
      /* ADDED 2026-11-23 (after the blind verification): the page lists every link of a contesting kind under Argues against at both of its
         ends. Only a kind the page stores with a direction (its DIRT table: "a critiques b") says who argues with whom: `aimed` are the
         critiques of an idea, `ownCrit` the critiques it makes itself */
      const C = () => P().constructor
      const negs = (id) => by()[id].adj.filter((e) => C().NEG.includes(e[1]))
      const aimed = (id) => negs(id).filter((e) => C().DIRT.includes(e[1]) && e[3] === -1), ownCrit = (id) => negs(id).filter((e) => C().DIRT.includes(e[1]) && e[3] === 1)
      const hop = () => { const names = neg().map(cardName), ch = alongChips(); return ch.find((b) => names.includes(txt(b))) || ch[0] || null }
      let first, hovered
      return [
        // the stage is put on the picked idea's Bestiary step: Play may have moved it to a neighbour
        ['click', follow, 900],
        ['do', () => { first = picked() }],
        // 1. the coarsest layer: two canons and the links between them
        ['click', coarsest, 1700],
        ['note', { dep: true, at: [island(mine), island(() => Object.keys(lay().nm).find((k) => k !== mine()))], clear: [cap, isles],
          title: () => `${lay().l}: ${Object.keys(lay().nm).map(size).join(' and ')} ideas, ${links().length - inside(lay().f)} links between them`,
          text: () => { const L = lay(), ks = Object.keys(L.nm), n = ideas(), cross = links().length - inside(L.f), mix = Math.round(100 * (1 - ks.reduce((s, k) => s + (size(k) / n) ** 2, 0)))
            return `Zooming in follows one idea, here ${nm(picked())}, from all ${n} ideas down to who argues with it. The coarsest layer, ${L.l}, cuts the bestiary into ${ks.length} groups: ${ks.map((k, i) => `${L.nm[k]} with ${size(k)}${i ? '' : ` of ${n} ideas`}`).join(', ')}. ${cross} of the ${links().length} links (${pct(cross, links().length)}%) join ideas of different groups. If links ignored the groups, about ${mix}% would.` } }],
        // 2. the Role layer: the widest road, and where it comes back from
        ['click', mapBtn('Role'), 1700],
        ['note', { dep: true, at: [island(mine), island(top)], clear: [cap, isles],
          title: () => { const r = roads(mine()); return `${lay().nm[mine()]}: ${r[0][1]} links to ${lay().nm[r[0][0]]}${r[1] ? `, ${r[1][1]} to ${lay().nm[r[1][0]]}` : ''}` },
          text: () => { const L = lay(), r = roads(mine()); return `On the ${L.l} layer ${nm(picked())} stands in ${L.nm[mine()]}, with ${size(mine())} of the ${ideas()} ideas. The widest road from ${L.nm[mine()]} goes to ${L.nm[r[0][0]]}: ${r[0][1]} of the ${links().length} links.${r[1] ? ` The next widest goes to ${L.nm[r[1][0]]}, ${r[1][1]}.` : ''}` } }],
        ['do', () => { hovered = top() }],
        ['hover', rim(island(top))],
        ['note', { dep: true, at: [island(() => hovered), cap], clear: [isles],
          title: () => { const L = lay(), b = roads(hovered)[0]; return b[0] === mine() ? `From ${L.nm[hovered]} the widest road leads back to ${L.nm[mine()]}` : `From ${L.nm[hovered]} the widest road leads to ${L.nm[b[0]]}` },
          text: () => { const L = lay(), b = roads(hovered)[0], others = Object.keys(L.nm).filter((k) => k !== mine()), to = others.filter((k) => roads(k)[0][0] === mine()).length
            return `With the pointer on ${L.nm[hovered]} the roads are drawn from it. ${b[0] === mine() ? `Its widest road is the same ${b[1]} links, back to ${L.nm[mine()]}.` : `Its widest road has ${b[1]} links and leads to ${L.nm[b[0]]}, not back to ${L.nm[mine()]}.`}${to > 1 ? ` ${L.nm[mine()]} is the first destination of ${to} of the ${others.length} other groups on this layer.` : ''}` } }],
        // 3. District: how many of its links stay inside its family
        ['click', tab('District'), 1500],
        ['click', mapBtn('Family'), 1700],
        ['note', { dep: true, at: [card(picked), litCard], clear: [cap],
          title: () => { const a = by()[picked()].adj; return `${a.filter((e) => by()[e[0]].fam === mine()).length} of the ${a.length} links of ${nm(picked())} stay inside ${lay().nm[mine()]}` }, /* CHANGED 2026-11-23: the title names the idea */
          text: () => { const a = by()[picked()].adj, k = a.filter((e) => by()[e[0]].fam === mine()).length, fams = new Set(a.map((e) => by()[e[0]].fam)).size, g = size(mine()), all = links().length, same = inside('fam')
            return `${g} ideas share the family ${lay().nm[mine()]} with ${nm(picked())}${cards().length < g ? `; the ${cards().length} closest are shown` : ''}. The lit cards are ${nm(picked())} and its neighbours here. ${k} of its ${a.length} links stay inside the family, the other ${a.length - k} lead to ${fams - 1} other families. Across the bestiary ${same} of the ${all} links (${pct(same, all)}%) stay inside one family; for ${nm(picked())} it is ${pct(k, a.length)}%.` } }],
        // 4. Circuit: what it leads to, and how much of that is a remedy
        ['click', tab('Circuit'), 1800],
        ['hover', () => remedies()[0] || outRows()[0] || null],
        ['note', { finding: true, dep: true, at: [() => remedies()[0] || outRows()[0], spanText(root, /^Leads to · \d+$/), spanText(root, /^Comes from · \d+$/)], clear: [outRows, () => [...level(3).children].filter((e) => e.style.width === '200px')],
          title: () => (remedies().length ? `${nm(picked())}: ${remedies().length} of the ${outRows().length} ideas it leads to are remedies` : `${num(/^Comes from · \d+$/)} ideas lead in, ${outRows().length} lead out`),
          text: () => { const r = remedies(), hov = r[0] || outRows()[0]
            return `${num(/^Comes from · \d+$/)} ideas lead into ${nm(picked())} and it leads to ${outRows().length}.${r.length ? ` ${r.length} of the ${outRows().length} are marked mitigates or solves: answers to it, not effects of it.` : ''} The pointer is on one row, ${txt(hov.children[1])}, and the page dims the others.` } }],
        ['leave', () => remedies()[0] || outRows()[0] || null],
        // 5. Pros and cons: the balance, the dissent, and the opponent's own balance
        ['click', tab('Pros and cons'), 1800],
        ['note', { dep: true, at: [verdict, spanText(root, /^\+ Supports/)], clear: [cap, pos, neg],
          title: () => `${nm(picked())}: ${pos().length} for, ${neg().length} against`,
          text: () => { const r = pos().filter((c) => /^(mitigates|solves)$/.test(cardRel(c))).length
            return `${pos().length} ideas support ${nm(picked())} or build on it, ${neg().length} argue${neg().length === 1 ? 's' : ''} with it: the verdict line reads ${txt(verdict()).split('·').pop().trim()}.${r ? ` The page counts an idea that mitigates or solves it as building on it, so ${r} of the ${pos().length} on the left are its remedies.` : ''}` } }],
        ['hover', () => neg()[0] || null],
        ['note', { dep: true, at: [() => neg()[0]],
          title: () => (neg().length === 1 ? `The one dissent: ${cardName(neg()[0])}` : `${neg().length} ideas argue with it`),
          text: () => { const c = neg()[0], none = P().state.data.filter((n) => !sides(n.id)[1]).length
            return `${cardName(c)}, ${cardRel(c)}: ${cardText(c).split(/(?<=[.!?])\s/)[0]} Most ideas have no such link: ${none} of ${ideas()} have no link of a contesting kind (${C().NEG.map((t) => C().REL[t]).join(', ')}) at either end.` } }],
        ['leave', () => neg()[0] || null],
        ['click', hop, 1500],
        ['click', tab('Pros and cons'), 1800],
        /* CHANGED 2026-11-23 (after the blind verification): the closing note says what the count of "against" is made of (links with no
           direction, the idea's own critiques, critiques aimed at it) and ends on the count that has a direction */
        ['note', { finding: true, at: [verdict], clear: [follow, pos, neg, () => verdict().parentElement], /* the last: the card of the idea itself, its name and picture */
          title: () => { const b = sides(picked()), t = aimed(picked()).length; return `${nm(picked())}: ${b[0]} for, ${b[1]} against, ${t || 'none'} aimed at it` },
          text: () => { const d = P().state.data, id = picked(), bal = (n) => sides(n.id)[0] - sides(n.id)[1], a = sides(first), b = sides(id)
            const ng = negs(id), o = ownCrit(id), t = aimed(id), u = ng.length - o.length - t.length, link = ng.find((e) => e[0] === first)
            const lead = id === first ? '' : `${nm(first)} has ${a[0]} for and ${a[1]} against. ${link ? 'Its opponent' : 'Its neighbour'}, ${nm(id)}, shows ${b[0]} for and ${b[1]} against. `
            const flat = u ? `${u} of the ${b[1]} against ${u === 1 ? 'is a link' : 'are links'} with no direction${link && !C().DIRT.includes(link[1]) ? `, ${u === 1 ? '' : 'one of them '}“${C().REL[link[1]]}” with ${nm(first)}` : ''}, counted against both ideas. ` : ''
            const self = o.length ? `${o.length} ${o.length === 1 ? `is its own critique of ${nm(o[0][0])}` : 'are its own critiques of other ideas'}. ` : ''
            return `${lead}${flat}${self}${t.length ? `${t.length} of the ${b[1]} ${t.length === 1 ? 'is a critique' : 'are critiques'} aimed at it` : `No critique is aimed at ${nm(id)}`}. Across the bestiary ${d.filter((n) => aimed(n.id).length).length} of ${d.length} ideas are critiqued by another idea. Counting a contesting link at either end, as the page does, ${d.filter((n) => bal(n) > 0).length} have more for than against, ${d.filter((n) => bal(n) === 0).length} as many and ${d.filter((n) => bal(n) < 0).length} more against.` } }],
      ]
    },
    '2f': (root) => {
      const P = page
      const tab = (l) => byText(root, 'button', new RegExp(`^${l}$`))
      const chips = () => all(root, 'button').filter((e) => e.style.height === '40px' && e.children.length === 1 && e.children[0].tagName === 'SPAN')
      const chip = (id) => () => chips()[P().state.recent.indexOf(id())] || null
      const cards = () => all(root, '.bscroll div[title]').filter((e) => e.style.height === '26px')
      const card = (id) => () => { const m = id(); return (m && cards().find((e) => txt(e) === nm(m))) || null }
      const rootCard = card(picked)
      const count = () => all(root, 'span').find((e) => e.style.alignSelf === 'flex-start' && e.style.fontWeight === '700') || null /* the count line */
      const emptyLine = () => all(root, 'span').find((e) => /^Along /.test(txt(e)) && /dashed/.test(e.style.border)) || null
      const allBtn = byText(root, 'button', /^All \d+/)
      const item = (id) => () => all(root, '.zcol button.bidea').find((e) => txt(e.children[0]) === nm(id())) || null
      const listTitle = () => all(root, 'span').find((e) => /^All \d+ ideas by /.test(txt(e))) || null
      const fed = () => axis().steps[picked()][0], feeds = () => axis().steps[picked()][1]
      /* the tree grows one link a side per tick; a note about it waits until it has grown (the page's own count, at most 20 s) */
      const grown = () => new Promise((done) => { const t0 = Date.now(), k = setInterval(() => { if (P().state.fStep >= P().fTotal || Date.now() - t0 > 20000) { clearInterval(k); done() } }, 150) })
      /* the rules that pick the ideas: of the recent picks, the one with the widest tree of its own;
         the idea of the tree that stands furthest to the right; the idea with the widest tree of its own on the whole tab */
      const widest = () => { const g = axis(), r = P().state.recent; return most(r.some((m) => own(g, m)) ? r.filter((m) => own(g, m)) : r, (m) => reach(g, m)) }
      /* CHANGED 2026-11-23 (after the blind verification): the idea of the Debate note is one with an empty tree on the tab on show: the first
         of the recent picks that has one, else, of all such ideas, the one with the most links, picked from the full list. The note is
         opened only on that idea with its empty tree on show (it took the smallest tree among the recent picks, empty or not) */
      const zero = () => { const g = axis(), z = (m) => !reach(g, m), r = P().state.recent.filter(z); return r.length ? r[0] : most(Object.keys(g.steps).filter(z), (m) => P().by[m].adj.length) }
      const empty = () => !!none && picked() === none && !reach(axis(), none)
      const far = () => { const g = axis(), t = P().near(g, picked()).tree.filter((e) => e.dir > 0); return t.length ? most(t, (e) => g.col[e.far]).far : null }
      const topIdea = () => { const g = axis(); return most(Object.keys(g.steps).filter((m) => own(g, m)), (m) => reach(g, m)) }
      const empties = () => Object.keys(axis().steps).filter((m) => !reach(axis(), m)).length
      const roleLabel = (m) => P().constructor.ROLE[P().by[m].role][0]
      /* an idea flips between two tabs when it only feeds on one and is only fed on the other */
      const flips = (m) => { const a = P().axes.role, b = P().axes.cause; return own(a, m) && own(b, m) && !a.steps[m][0] && a.steps[m][1] > 0 && b.steps[m][0] > 0 && !b.steps[m][1] }
      let start, end, none
      return [
        // 1. Cause: the widest tree among the recent picks, and where it ends
        ['click', tab('Cause')],
        ['click', chip(widest), 1300],
        ['do', () => { start = picked(); end = far(); return grown() }],
        ['note', { dep: true, at: [card(() => end), rootCard], clear: [count, cards],
          title: () => `Cause: ${nm(start)} reaches ${fed() + feeds()} of ${ideas()} ideas`,
          text: () => { const g = axis(); return `The gold card is the picked idea. To its left stand the ideas that feed it, to its right the ideas it feeds, up to three links each way. On Cause ${fed()} ideas lead to ${nm(start)} and ${feeds()} follow from it.${end ? ` The furthest card of its tree is ${nm(end)}, in the column ${g.labels[g.col[end]]}${g.col[end] === g.n - 1 ? `, the last of the ${g.n} columns` : ''}.` : ''}` } }],
        // 2. the far end of that tree, grown from itself
        ['click', card(() => end), 1300],
        ['do', grown],
        ['note', { finding: true, dep: true, at: [rootCard, count], clear: [cards],
          title: () => `${nm(picked())}: ${fed()} ideas lead in, ${feeds() ? `${feeds()} lead out` : 'nothing leads out'}`,
          text: () => { const g = axis(); return `The same tree, grown from ${nm(picked())}: ${fed()} of ${ideas()} ideas lead to it within three causal links, and it feeds ${feeds() || 'nothing'}.${feeds() ? '' : ' On Cause it is an end point.'}${g.C[g.col[picked()]].length === 1 ? ` It is the only idea in the column ${g.labels[g.col[picked()]]}.` : ''}` } }],
        // 3. the first idea again, on Logic
        ['click', chip(() => start), 1300],
        ['click', tab('Logic')],
        ['do', grown],
        ['note', { at: [() => (picked() === start ? rootCard() : null), () => (picked() === start ? count() : null)], clear: [cards],
          title: () => `${nm(start)}: ${fed() + feeds()} ideas on Logic, ${reach(P().axes.cause, start)} on Cause`,
          text: () => { const c = P().axes.cause.steps[start]; return `The same idea, with only the logical links kept: ${fed()} lead to it and ${feeds()} follow${feeds() === 1 ? 's' : ''} from it. On Cause it was ${c[0]} and ${c[1]}. One idea has a tree of ${fed() + feeds()} ideas as a step of reasoning and a tree of ${c[0] + c[1]} as a cause.` } }],
        // 4. Debate: an idea with an empty tree
        ['click', tab('Debate')],
        ['do', () => { none = zero() }],
        ['click', () => (!none ? null : P().state.recent.includes(none) ? chip(() => none)() : allBtn()), 1300],
        ['click', () => (none && picked() !== none ? item(() => none)() : null), 1300],
        ['do', grown],
        ['note', { at: [() => (empty() ? emptyLine() : null), () => (empty() ? chip(picked)() : null)],
          title: () => `Debate: nothing grows from ${nm(picked())}`,
          text: () => `The tree is empty, and the line below says why: ${nm(picked())} has no debate link, and no idea linked to it has one. It is not alone: ${empties()} of ${ideas()} ideas have an empty tree on Debate.` }],
        // 5. Role ladder: the same idea, joined through its neighbours
        ['click', tab('Role ladder')],
        ['do', grown],
        ['note', { at: [rootCard, count], clear: [cards],
          title: () => { const b = axis().bridge[picked()] || []; return b.length ? `Role ladder: ${fed()} ideas feed its ${b.length} neighbour${b.length === 1 ? '' : 's'}, none feeds it` : `Role ladder: fed by ${fed()}, feeds ${feeds() || 'nothing'}` },
          text: () => { const b = axis().bridge[picked()] || []
            return b.length ? `Every link of ${nm(picked())} stays inside its own column, ${roleLabel(picked())}, so on Role ladder it has no tree of its own. The dashed line${b.length === 1 ? ' joins' : 's join'} it to ${b.map(nm).join(' and ')}. ${fed()} ideas feed ${b.length === 1 ? 'that neighbour' : `those ${b.length}`}, up to two links back${feeds() ? `, and ${feeds()} follow from them` : ''}: the number on its chip is its neighbours' reach.`
              : `Sorted by role in the argument, ${fed()} ideas feed ${nm(picked())} and it feeds ${feeds() || 'nothing'}, within three links each way.` } }],
        // 6. the full list: the widest tree on Role ladder
        ['click', allBtn, 900],
        ['note', { dep: true, at: [item(topIdea), listTitle], clear: [() => all(root, '.zcol')],
          title: () => `The widest tree on Role ladder: ${nm(topIdea())}, ${reach(axis(), topIdea())} of ${ideas()}`,
          text: () => `The list holds all ${ideas()} ideas in the columns of this tab. The number beside a name is how many ideas it reaches within three links. Among the ideas with a tree of their own the largest is ${reach(axis(), topIdea())}, beside ${nm(topIdea())}.` }],
        ['click', item(topIdea), 1300],
        ['do', grown],
        ['note', { dep: true, at: [rootCard, count], clear: [cards],
          title: () => `${nm(picked())}: ${fed() ? `${fed()} feed it` : 'nothing feeds it'}, it feeds ${feeds()}`,
          text: () => `On Role ladder ${nm(picked())} is ${fed() ? 'mostly' : 'only'} a source: ${fed() ? `${fed()} idea${fed() === 1 ? ' feeds' : 's feed'} it` : 'nothing feeds it'} and it feeds ${feeds()} of ${ideas()} ideas within three links, the widest reach on this tab.` }],
        // 7. the same idea on Cause: a source on one tab, an end point on the other
        ['click', tab('Cause')],
        ['do', grown],
        ['note', { finding: true, at: [rootCard, count], clear: [cards],
          title: () => (flips(picked()) ? 'A source on Role ladder, an end point on Cause' : `${nm(picked())} on Cause: fed by ${fed()}, feeds ${feeds()}`),
          text: () => { const r = P().axes.role.steps[picked()], fl = P().state.data.filter((d) => flips(d.id)).map((d) => d.id)
            return `${nm(picked())} on Role ladder: ${r[0] ? `${r[0]} ideas feed it` : 'nothing feeds it'}, it feeds ${r[1]}. On Cause: ${fed() ? `${fed()} ideas feed it` : 'nothing feeds it'}, it feeds ${feeds() || 'nothing'}. ${flips(picked()) ? `The idea and its links are the same; only the reading of "feeds" changed. ${fl.length} of ${ideas()} ideas only feed on Role ladder and are only fed on Cause${picked() === most(fl, (m) => P().axes.role.steps[m][1]) ? `, and ${nm(picked())} has the widest tree of them` : ''}.` : 'A tree is a reading of one tab, not a property of the idea.'}` } }],
      ]
    },
  }

  // ---- ADDED 2026-11-23: the tour of the Bestiarium Map (bestiary-world.html) ----
  // The map is a canvas: a beast, an island, the gathered neighbours and the flag have no element of their own. A spot stands in
  // for one: its box is asked of the map component (window.__bestiaryWorld, its accessors beastBox, islandBox, councilBox,
  // flagBox) every time it is read, and its click and hover are pointer events sent to the canvas, so they go through the same
  // handlers as a real mouse. Which beast or island the tour points at is chosen by a rule from the data when the step runs.
  const worldKit = (cmp) => {
    const cv = () => cmp.cvRef.current
    const fire = (type, x, y) => cv().dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1, isPrimary: true }))
    /* CHANGED 2026-11-23: a box is free when its centre and its four corners are on the canvas: on screen and under no panel
       (only the centre was tested: an island half off the map was hovered, a beast under a panel was clicked) */
    const free = (b) => { const c = cv().getBoundingClientRect(); return [[.5, .5], [0, 0], [1, 0], [0, 1], [1, 1]].every(([u, v]) => document.elementFromPoint(c.left + b.x0 + 1 + (b.x1 - b.x0 - 2) * u, c.top + b.y0 + 1 + (b.y1 - b.y0 - 2) * v) === cv()) }
    /* CHANGED 2026-11-23: a spot points at its centre, the point its click and hover go to, so the engine draws the cursor there.
       It can be aimed at (clicked, hovered) only while its box is free and, when `is(x, y)` is given, the map itself picks the
       spot's beast or island at that point; otherwise the engine skips the step and the tour's own fallback, a row of a panel, is used. */
    const spot = (box, is) => () => {
      if (!box()) return null
      const rect = () => { const b = box(), c = cv().getBoundingClientRect(); return { left: c.left + b.x0, top: c.top + b.y0, right: c.left + b.x1, bottom: c.top + b.y1, width: b.x1 - b.x0, height: b.y1 - b.y0 } }
      const mid = () => { const r = rect(); return [r.left + r.width / 2, r.top + r.height / 2] }
      const at = () => { const b = box(); return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2] }
      return { isConnected: true, getBoundingClientRect: rect, scrollIntoView() {}, point: mid,
        aim: () => (free(box()) && (!is || is(...at())) ? mid() : null),
        click() { const [x, y] = mid(); fire('pointerdown', x, y); fire('pointerup', x, y) },
        dispatchEvent(ev) { if (ev.type === 'mouseover') { const [x, y] = mid(); fire('pointermove', x, y) } } }
    }
    const beast = (id) => spot(() => { const o = id(); return o ? cmp.beastBox(o) : null }, (x, y) => cmp.pickAt(x, y) === id())
    /* CHANGED 2026-11-23 (stage 2): any island, by its key; it is hovered at its centre, where no beast stands */
    const island = (k) => spot(() => { const o = k(); return o && cmp.islBy[o] ? cmp.islandBox(o) : null }, (x, y) => !cmp.pickAt(x, y) && cmp.famAt(x, y) === k())
    const leave = () => fire('pointerleave', 0, 0)
    // a spot a panel covers, or one partly off the map, is not shown: a note does not frame it
    const onMap = (sp) => () => { const e = sp(); if (!e) return null; const r = e.getBoundingClientRect(), c = cv().getBoundingClientRect(); return free({ x0: r.left - c.left, y0: r.top - c.top, x1: r.right - c.left, y1: r.bottom - c.top }) ? e : null } /* CHANGED 2026-11-23: the whole box, see free */
    // a DOM element's React onMouseLeave: a mouseout to the page
    const out = (find) => () => { const e = find(); if (e) e.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })) }
    const settle = async () => { const t0 = performance.now(); await wait(250); while (!cmp.settled() && performance.now() - t0 < 4000) await wait(100); await wait(200) }
    const root = cmp.wrapRef.current
    const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth }
    const els = (sel) => all(root, sel).filter(visible)
    const byTxt = (sel, re) => () => els(sel).find((e) => re.test(txt(e))) || null
    const up = (find, k = 1) => () => { let e = find(); for (let i = 0; e && i < k; i++) e = e.parentElement; return e }
    const st = () => cmp.state
    const nm = (id) => cmp.byId.get(id).name
    /* ADDED 2026-11-23 (stage 2): an island's name as the map, the islands panel and the colour legend write it ("Mind"), in the
       grouping on show; a family's name whatever the grouping */
    const short = (k) => cmp.groupTables(st().grp || 'family').FSHORT[k]
    const famShort = (f) => cmp.groupTables('family').FSHORT[f]
    const S = {
      title: byTxt('h1', /^Bestiarium Map$/),
      mode: (l) => byTxt('button', new RegExp(`^${l}$`)),
      tip: () => els('div').find((e) => e.style.pointerEvents === 'none' && e.style.transform === 'translate(16px, 16px)') || null,
      isHead: byTxt('button', /^Islands = .*Neighbouring islands are joined/),
      isPanel: up(() => S.isHead()),
      isOpener: byTxt('button', /^Islands = .*\+$/),
      isList: () => { const p = S.isPanel(); return p && [...p.children].find((e) => e.style.overflowY === 'auto') || null },
      isRow: (k) => () => { const l = S.isList(), o = k(); return l && o ? [...l.children].find((b) => txt(b.children[1].children[0]) === short(o)) || null : null }, /* ADDED 2026-11-23 (stage 2): an island's row in the islands panel */
      // the colourings: the islands panel's, or the foot of the beast card when the panel is not shown
      grpRow: up(byTxt('span', /^Islands by$/)),
      grpBtn: (l) => () => { const r = S.grpRow(); return r && [...r.querySelectorAll('button')].find((b) => txt(b) === l) || null },
      cbRow: up(byTxt('span', /^Beasts by$/)),
      cbBtn: (l) => () => { const r = S.cbRow(); return r && [...r.querySelectorAll('button')].find((b) => txt(b) === l) || null }, /* ADDED 2026-11-23 (stage 2) */
      colLegend: () => { const r = S.cbRow(); return r && r.nextElementSibling },
      search: () => els('input').find((e) => e.placeholder === 'Find a beast…') || null,
      found: (id) => () => { const i = S.search(); return i ? all(i.parentElement, 'button').find((b) => txt(b.children[0]) === nm(id())) || null : null }, /* ADDED 2026-11-23 (stage 2): a row of the search results */
      card: () => { const a = byTxt('a', /^Read the full entry/)(); return a && a.parentElement.parentElement },
      wiki: byTxt('a', /^Read the full entry in the wiki/), /* ADDED 2026-11-23 */
      cardHead: () => { const a = byTxt('a', /^Read the full entry/)(); return a && a.parentElement },
      arrange: up(byTxt('span', /^Arrange$/)),
      arr: (l) => () => { const r = S.arrange(); return r && [...r.querySelectorAll('button')].find((b) => txt(b) === l) || null },
      peekBar: byTxt('button', /^← ?Visiting /),
      legend: () => cmp.legRef.current && visible(cmp.legRef.current) ? cmp.legRef.current : null,
      /* CHANGED 2026-11-23 (stage 2): the legend's cards; the one with the most links of the beast; the one of a kind, by its name */
      legCards: () => { const l = S.legend(); return l ? all(l, 'button[title]') : [] },
      legMax: () => most(S.legCards(), (b) => parseInt(txt(b).split(' · ')[1]) || 0) || null,
      legOf: (name) => () => S.legCards().find((b) => txt(b.children[0]).startsWith(name() + ' · ')) || null,
      rules: up(byTxt('span', /^New expedition along$/)),
      start: up(byTxt('span', /^Start$/)),
      flag: up(byTxt('span', /^Flag$/)),
      foot: () => { const h = byTxt('button', /^Hint$/)(); return h && h.parentElement },
      /* ADDED 2026-11-23 (stage 2): the report's verdict and its graph "All shortest routes" (CHANGED 2026-11-27, was the column "A shortest route"); the Chronicle bar and its play button */
      grade: () => { const s = byTxt('span', /^Expedition report$/)(); return s && s.nextElementSibling },
      route: up(byTxt('span', /^All shortest routes$/)),
      yours: up(byTxt('span', /^Your route$/)), /* ADDED 2026-11-23 */
      chron: () => cmp.chronRef.current,
      chronPlay: () => cmp.chronRef.current && cmp.chronRef.current.querySelector('button'),
    }
    const P = {
      beast, island,
      council: spot(() => st().focus && cmp.council ? cmp.councilBox() : null),
      hint: spot(() => cmp.hintId && st().quest ? cmp.beastBox(cmp.hintId) : null),
    }
    const nextHop = () => { const q = st().quest, f = st().focus; if (!q || !f || !cmp.nodes) return null; const d = q.distT.get(f); if (!d) return null
      return cmp.adj.get(f).filter((e) => cmp.ok(e, q.rule)).map((e) => (e.a === f ? e.b : e.a)).find((o) => q.distT.get(o) === d - 1) || null }
    /* CHANGED 2026-11-23: `row(id)` and `step(id)` are a neighbour's row in the beast card and its Step → button, the fallback
       when the beast itself cannot be clicked on the map */
    const row = (id) => () => { const c = S.card(), o = id(); return c && o ? all(c, 'button[title="Step to this beast"]').map((b) => b.previousElementSibling).find((b) => txt(b.children[1].children[0].children[0]) === nm(o)) || null : null }
    const step = (id) => () => { const r = row(id)(); return r && r.nextElementSibling.style.display !== 'none' ? r.nextElementSibling : null }
    const or = (sp, alt) => () => { const e = sp(); return e && e.aim() ? e : alt() }
    /* CHANGED 2026-11-23 (stage 2): a spot that a panel covers, or that is partly off the screen, is brought onto the free part of the
       map by moving the camera, as a reader drags the map: the screen is sampled every 12px for points where the canvas is on top,
       and the spot's box goes to the nearest place where it fits with 14px to spare. Where it fits nowhere (a phone with a panel
       open) nothing moves, and the step that follows is skipped or takes its fallback. */
    const bring = (sp) => async () => {
      const e = sp(); if (!e || e.aim()) return
      const r = e.getBoundingClientRect(), g = 12, kx = Math.ceil((r.width + 28) / g), ky = Math.ceil((r.height + 28) / g), nx = Math.floor(innerWidth / g), ny = Math.floor(innerHeight / g)
      const I = Array.from({ length: ny + 1 }, () => new Int32Array(nx + 1)) /* I[j][i]: the number of free points above and left of (i, j) */
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) I[j + 1][i + 1] = (document.elementFromPoint(i * g + g / 2, j * g + g / 2) === cv() ? 1 : 0) + I[j][i + 1] + I[j + 1][i] - I[j][i]
      const bx = r.left + r.width / 2, by = r.top + r.height / 2; let best = null
      for (let j = 0; j + ky <= ny; j++) for (let i = 0; i + kx <= nx; i++) {
        if (I[j + ky][i + kx] - I[j][i + kx] - I[j + ky][i] + I[j][i] < kx * ky) continue
        const x = (i + kx / 2) * g, y = (j + ky / 2) * g, d = Math.hypot(x - bx, y - by)
        if (!best || d < best.d) best = { d, x, y }
      }
      if (!best) return
      const z = cmp.cam.z; cmp.camT = { x: cmp.cam.x + (bx - best.x) / z, y: cmp.cam.y + (by - best.y) / z, z }
      await settle()
    }
    /* ADDED 2026-11-23 (stage 2): a step that waits for the page (the Chronicle reaching an era), at most `cap` ms, and one that
       types into a field as a keyboard does; both give up when the tour is stopped (`on` is the engine's "still playing") */
    const until = (fn, cap = 20000) => (on) => new Promise((done) => { const t0 = Date.now(), k = setInterval(() => { if (!on() || fn() || Date.now() - t0 > cap) { clearInterval(k); done() } }, 100) })
    const type = (find, text) => async (on) => {
      const e = find(), s = text(), set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      for (let i = 1; e && on() && i <= s.length; i++) { set.call(e, s.slice(0, i)); e.dispatchEvent(new Event('input', { bubbles: true })); await wait(45) }
    }
    /* ADDED 2026-11-23: what the tour changes on the map, put back when it ends or is stopped: mode, beast, expedition, era, hidden
       links, Arrange, grouping, colouring, the search field, the side panels, the trail of Your wanderings and the camera. The
       intro overlay is not reopened. */
    const hold = () => {
      const { mode, focus, peek, quest, result, showReport, era, groups, arr, q, grp, colorBy, fold, isOpen } = st(), cam = { ...cmp.cam }, trail = cmp.wpath
      return () => {
        clearInterval(cmp.playT); cmp.hintId = null; cmp.groupHov = null; cmp.saveTrail(trail); cmp.setGrouping(grp || 'family'); cmp.setColorBy(colorBy || 'role')
        cmp.setState({ mode, focus, peek, quest, result, showReport, era, groups, arr, q, fold, isOpen, playing: false, hover: null, intro: false }, () => { cmp.buildCouncil(); if (focus) cmp.frameFocus(); else cmp.camT = cam })
      }
    }
    return { S, P, fire, leave, out, settle, st, nm, short, famShort, nextHop, onMap, row, step, or, bring, until, type, hold }
  }

  /* CHANGED 2026-11-23 (stage 2 of the tours' rebuild): the map's tour is built anew from the findings the blind check confirmed.
     Five chapters, numbered in the note titles: the islands (the widest route, the two large islands with no link, the same beasts
     by era and by canon), one beast and its neighbours (the hub, the kinds of link, hiding links and showing them again, Arrange through Time, Role
     and Relation, one click to read a neighbour and a second to step, the wiki link), the Expedition played to the flag and its
     report, the Chronicle paused at its half and played to the end, and a closing note on the result to take away, with the link
     to an essay. Every beast and island is picked by a rule over cmp.nodes, cmp.edges, cmp.isl and cmp.routes when its step runs,
     and every number is counted when its note opens. Below 708px the side panels cover the map: the tour puts them away (the
     page's `fold`) and shows them for the steps that use them; `hold` puts them back. */
  const worldTour = (cmp) => {
    const { S, P, leave, out, settle, st, nm, short, famShort, onMap, nextHop, row, step, or, bring, until, type } = worldKit(cmp)
    const narrow = () => cmp.W < 708
    const fold = (on) => () => { if (narrow()) cmp.setState({ fold: on }) }
    const N = () => cmp.nodes.length, E = () => cmp.edges.length
    const word = (n) => ['no', 'one', 'two', 'three', 'four', 'five', 'six'][n] || String(n)
    const ord = (n) => (['', '1st', '2nd', '3rd'][n] || `${n}th`)
    const count = (list, f) => { const c = {}; list.forEach((x) => { const k = f(x); c[k] = (c[k] || 0) + 1 }); return Object.entries(c).sort((a, b) => b[1] - a[1]) }
    const deg = (id) => cmp.adj.get(id).length
    const nbs = (id) => [...new Set(cmp.adj.get(id).map((e) => (e.a === id ? e.b : e.a)))].map((o) => cmp.byId.get(o))
    const isRole = (l) => (n) => n.roleL === l
    /* islands and the routes between them, in the grouping on show */
    const size = (k) => cmp.islBy[k].list.length
    const rank = (k) => 1 + cmp.isl.filter((I) => I.list.length > size(k)).length
    const partners = (k) => cmp.routes.filter((r) => r.a === k || r.b === k).sort((p, q) => q.c - p.c)
    const leaving = (k) => partners(k).reduce((a, r) => a + r.c, 0)
    const other = (r, k) => (r.a === k ? r.b : r.a)
    const tie = () => most(cmp.routes, (r) => r.c) /* the route with the most links */
    const lone = () => { /* the two islands with no route between them and the largest product of sizes, the larger first */
      const ps = cmp.isl.flatMap((A, i) => cmp.isl.slice(i + 1).map((B) => [A.k, B.k])).filter(([a, b]) => !cmp.routes.some((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a)))
      return { none: ps.length, pair: ps.length ? most(ps, ([a, b]) => size(a) * size(b)).sort((a, b) => size(b) - size(a)) : null }
    }
    /* Islands by Era: the era island of 20 beasts or more in which one family has the largest share */
    const dom = () => most(cmp.isl.filter((I) => I.list.length >= 20).map((I) => { const [f, c] = count(I.list, (n) => n.family)[0]; return { k: I.k, f, c, n: I.list.length } }), (d) => d.c / d.n)
    /* the beast with the most links; failure modes and the solutions beside them */
    const hub = () => most(cmp.nodes, (n) => deg(n.id)).id
    const fails = () => cmp.nodes.filter(isRole('Failure mode'))
    const sols = (id) => nbs(id).filter(isRole('Solution'))
    const bare = () => fails().filter((n) => !sols(n.id).length) /* failure modes with no solution among their neighbours */
    const WO = { Core: 0, Major: 1, Supporting: 2 }
    /* the neighbour the tour reads and steps to: a failure mode with no solution beside it, the one with the most links; else the first neighbour */
    const gapOf = (id) => { const g = nbs(id).filter((n) => bare().includes(n)); return (g.length ? most(g, (n) => deg(n.id)) : nbs(id)[0]).id }
    /* the beast of the closing note: a failure mode with no solution beside it, the core canon first, then the most links */
    const endId = () => [...bare()].sort((a, b) => WO[a.w] - WO[b.w] || deg(b.id) - deg(a.id) || a.name.localeCompare(b.name))[0].id
    /* how far apart two beasts are along the Expedition's links, and the largest group one kind of link holds together */
    const far = () => { let max = 0, sum = 0, pairs = 0; cmp.nodes.forEach((n) => cmp.bfs(n.id, 'any').dist.forEach((d) => { if (d) { max = Math.max(max, d); sum += d; pairs++ } })); return { max, avg: sum / pairs, all: pairs === N() * (N() - 1) } }
    const piece = (rule) => Math.max(...cmp.nodes.map((n) => cmp.bfs(n.id, rule).dist.size))
    /* the Chronicle: beasts alive by an era, the last era by which under half are alive, the eras on the map */
    const alive = (e) => cmp.nodes.filter((n) => n.ei <= e).length
    const lastEra = () => Math.max(...cmp.nodes.map((n) => n.ei))
    const halfEra = () => { let e = 0; while (alive(e + 1) < N() / 2) e++; return e }
    const eraName = () => txt(S.chron().children[1].children[0].children[0]) /* the era the bar names */
    /* the card's sections as the page writes them ("Older ideas · 4, ...") */
    const sides = () => all(S.card(), 'div').filter((e) => e.style.padding === '12px 0px 6px').map((h) => txt(h).replace(/\s*(\d+)$/, ' · $1')).join(', ')
    // the gathered neighbours when no panel covers them (on a phone the card does), else the given element
    const councilOr = (alt) => () => onMap(P.council)() || alt()
    /* a sentence about the gathered neighbours when the map shows them, another when the card covers them (a phone) */
    const seen = (a, b) => (onMap(P.council)() ? a : b)
    let tieK, loneK, domK, hubId, gapId, kind, kindName, kindN, wasOpen
    const isl = (k) => P.island(k), islOr = (k) => () => onMap(isl(k))() || S.isRow(k)()
    /* of the islands given, the first that can be hovered on the map, after the camera has brought it out from under a panel */
    const pick = async (keys) => { for (const k of keys) { await bring(isl(() => k))(); if (isl(() => k)().aim()) return k } return keys[0] }
    const kindCount = (k) => cmp.edges.filter((e) => e.g === k).length
    const focused = () => cmp.byId.get(st().focus)
    /* a hop of the Expedition: the next beast on a shortest route is brought onto the free map and clicked twice (once reads it,
       twice steps); where the map cannot be clicked there, its row in the card and the row's Step → */
    let going
    const hop = [['do', () => { going = !!nextHop(); return bring(P.beast(nextHop))() }], ['click', or(P.beast(nextHop), row(nextHop)), 900], ['click', or(P.beast(nextHop), step(nextHop)), 600], ['do', () => (going ? settle() : null)]] /* CHANGED 2026-11-23: a hop past the flag does not wait */
    const btn = (re) => byText(document, 'button', re)
    /* ADDED 2026-11-23 (after the blind verification) */
    const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`)
    /* the tooltip is titled with the island's full name, the map and the panel write the short one: a note that frames the tooltip says so */
    const full = (k) => (S.tip() && cmp.islBy[k].label !== short(k) ? ` In the tooltip ${short(k)} is written in full: ${cmp.islBy[k].label}.` : '')
    /* the fewest newest eras that together hold three quarters of the beasts (Islands by Era lists the eras in order of time) */
    const late = () => { let k = 0, n = 0; while (n < 0.75 * N()) n += cmp.isl.at(-1 - k++).list.length; return { k, n } }
    /* the switches of New expedition along, in the order of the page's table of rules: the rule, the switch's label, the largest group the rule joins */
    const rules = () => { const b = all(S.rules(), 'button').map(txt); return cmp.ruleKeys().map((k, i) => ({ l: b[i], n: piece(k) })) }
    const setup = ['do', async () => { cmp.setState({ intro: false, fold: narrow(), q: '', arr: 'rel', groups: { A: true, B: true, C: true, D: true, E: true, F: true } }); cmp.setGrouping('family'); cmp.setColorBy('role'); cmp.setMode('explore'); await settle() }]
    /* CHANGED 2026-11-23 (after the blind verification): a chapter is a function of its title prefix, numbered by its place in this list ("2 of 5 · ") */
    const chapters = [
      // ---- the islands ----
      (c) => [
      ['do', async () => { const r = tie(); tieK = await pick([r.a, r.b].sort((a, b) => leaving(a) - leaving(b))) }], /* the end for which the route is the larger share of its links */
      ['hover', or(isl(() => tieK), S.isRow(() => tieK))],
      ['note', { dep: true, at: [islOr(() => tieK), S.tip],
        title: () => { const r = tie(); return `${c}${short(tieK)} and ${short(other(r, tieK))}: ${r.c} links, the widest route` },
        text: () => { const r = tie(), p = partners(tieK), x = cmp.routes.reduce((a, q) => a + q.c, 0)
          return `${N()} ideas, the beasts, live on ${cmp.isl.length} islands, one per family of ideas. ${x} of the ${E()} links cross between islands, along ${cmp.routes.length} routes. The widest joins ${short(tieK)} and ${short(other(r, tieK))}: ${r.c} links, which is ${r.c} of the ${leaving(tieK)} links that leave ${short(tieK)}${p[1] ? (() => { const t = p.slice(1).filter((q) => q.c === p[1].c).map((q) => short(other(q, tieK))); return `; its next partner${t.length > 1 ? 's' : ''}, ${list(t)}, get${t.length > 1 ? '' : 's'} ${p[1].c}${t.length > 1 ? ' each' : ''}` })() : ''}.${full(tieK)}` } }], /* CHANGED 2026-11-23: partners tied for the second place are all named */
      ['do', leave],
      ['do', async () => { const l = lone(); loneK = l.pair ? await pick(l.pair) : null }],
      ['hover', or(isl(() => loneK), S.isRow(() => loneK))],
      ['note', { finding: true, dep: true, at: [islOr(() => loneK), S.tip],
        title: () => { const [a, b] = lone().pair; return `${c}${short(a)} and ${short(b)} share no link` },
        text: () => { const l = lone(), [a, b] = l.pair, n = cmp.isl.length
          return `${short(a)} (${size(a)} beasts) and ${short(b)} (${size(b)}) are the ${ord(rank(a))} and ${ord(rank(b))} largest of the ${n} islands, and no link joins them. ${l.none} of the ${(n * (n - 1)) / 2} pairs of islands share no link; this is the largest such pair.${S.tip() ? ` The tooltip lists the islands ${short(loneK)} does link to.` : ''}${full(loneK)}` } }],
      ['do', leave],
      /* the islands panel holds Islands by and Beasts by: below 708px it is opened from the left panel, from 708 to 1099px by its
         own head; the tour closes it again after the chapter where it had to open it */
      ['do', fold(false), 400],
      ['do', () => { wasOpen = !!S.isList() }],
      ['click', () => (wasOpen ? null : S.isOpener() || S.isHead()), 900],
      ['click', S.grpBtn('Era'), 2600], ['do', settle],
      ['click', S.cbBtn('Family'), 800],
      ['note', { at: [() => (narrow() ? null : S.isList()), ...Array.from({ length: lastEra() + 1 }, (_, i) => () => (narrow() && i < late().k ? S.isRow(() => cmp.isl.at(-1 - i).k)() : null))], clear: [() => (narrow() ? null : [S.grpRow(), S.cbRow(), S.colLegend()])], /* below 708px the rows of the last eras: the whole list leaves the card no room */ /* CHANGED 2026-11-23: how many eras are "the last" is a rule, see late */
        title: () => `${c}By era: ${late().n} of ${N()} beasts in the last ${word(late().k)} eras`,
        text: () => { const big = most(cmp.isl, (I) => I.list.length)
          return `Islands by Era moved every beast to the era its idea comes from, and Beasts by Family coloured it by its family. ${short(big.k)} is the largest era: ${big.list.length} of the ${N()} beasts. The last ${word(late().k)} of the ${cmp.isl.length} eras hold ${late().n} of ${N()} (${pct(late().n, N())}%).` } }],
      ['do', async () => { domK = dom().k; await bring(isl(() => domK))() }],
      ['hover', or(isl(() => domK), S.isRow(() => domK))],
      ['note', { dep: true, at: [islOr(() => domK), S.tip], clear: [S.colLegend],
        title: () => { const d = dom(); return `${c}${short(d.k)}: ${d.c} of ${d.n} beasts are ${famShort(d.f)}` },
        text: () => { const d = dom(), mine = cmp.nodes.filter((n) => n.family === d.f), top = Math.max(...mine.map((n) => n.ei)), later = lastEra() - top
          return `${d.c} of the ${d.n} beasts of ${short(d.k)} belong to one family, ${famShort(d.f)}: the largest share a family has in an era of 20 beasts or more. The newest ${famShort(d.f)} beast is from ${short(cmp.isl.find((I) => I.list.some((n) => n.ei === top)).k)}${later ? `; none of the ${mine.length} is from the ${later === 1 ? 'era' : `${word(later)} eras`} after it` : ''}.${full(domK)}` } }],
      ['do', leave],
      ['click', S.grpBtn('Canon'), 2600], ['do', settle],
      ['note', { at: [() => (narrow() ? S.isRow(() => cmp.isl[0].k)() : S.isList()), () => (narrow() ? S.isRow(() => cmp.isl[1].k)() : null)], clear: [S.grpRow],
        title: () => `${c}By canon: ${cmp.routes[0].c} of ${E()} links join the two`,
        text: () => { const [a, b] = [...cmp.isl].sort((p, q) => q.list.length - p.list.length), c = cmp.routes[0].c
          return `Islands by Canon makes two continents: ${short(a.k)} with ${a.list.length} of the ${N()} beasts and ${short(b.k)} with ${b.list.length}. One route joins them, and it carries ${c} of the ${E()} links (${pct(c, E())}%). Islands by Role groups the same beasts by their role in the argument.` } }],
      ['click', S.grpBtn('Family'), 2600], ['do', settle],
      ['click', S.cbBtn('Role'), 800],
      ['click', () => (wasOpen ? null : S.isHead()), 700],
      ['do', fold(true), 400],

      ],
      // ---- one beast and its neighbours ----
      (c) => [
      ['do', async () => { hubId = hub(); await bring(P.beast(() => hubId))() }],
      ['click', P.beast(() => hubId), 600], ['do', settle],
      ['note', { finding: true, dep: true, at: [councilOr(S.cardHead)], clear: [S.card, S.cardHead],
        title: () => { const f = st().focus; return `${c}${nm(f)}: ${deg(f)} links, neighbours from ${count(nbs(f), (n) => n.family).length} of ${cmp.isl.length} islands` },
        text: () => { const f = st().focus, ds = cmp.nodes.map((n) => deg(n.id)).sort((a, b) => a - b), by = count(nbs(f), (n) => n.family), home = focused().family, at = (by.find(([k]) => k === home) || [0, 0])[1]
          return `${seen('The click gathered its neighbours around it.', 'The click opened its card.')} ${nm(f)} has ${deg(f)} links${deg(f) === ds[ds.length - 1] ? `, the most of the ${N()} beasts` : ''}; the median beast has ${ds[Math.floor(ds.length / 2)]}. Its ${nbs(f).length} neighbours come from ${by.length} of the ${cmp.isl.length} islands${by[0][0] !== home ? `, and ${short(by[0][0])} sends more of them (${by[0][1]}) than its own island, ${short(home)} (${at})` : ''}.` } }],
      ['hover', S.legMax],
      ['do', () => { kind = cmp.groupHov; const b = S.legMax(); kindName = txt(b.children[0]).split(' · ')[0]; kindN = +txt(b.children[0]).split(' · ')[1] }],
      ['note', { dep: true, at: [S.legOf(() => kindName), onMap(P.council)], clear: [S.card, S.cardHead],
        title: () => `${c}${nm(st().focus)}: ${kindN} of ${deg(st().focus)} links are ${kindName}`, /* CHANGED 2026-11-23: the title names the beast */
        text: () => { const v = S.legOf(() => kindName)().children[1], top = 'ABCDEF'.split('').every((k) => kindCount(k) <= kindCount(kind))
          return `How to read the lines names the kinds of link that reach ${nm(st().focus)}, each with its own line. The pointer is on ${kindName}${v ? ` (${txt(v)})` : ''}${seen(', and those lines are lit', '')}: ${kindN} of its ${deg(st().focus)} links. On the whole map ${kindName} are ${kindCount(kind)} of the ${E()} links${top ? ', the most common kind' : ''}.` } }],
      /* a click on a kind hides its links and a second click brings them back, each with its note (owner, 23 Nov) */
      ['click', S.legOf(() => kindName), 900], ['do', settle],
      ['note', { dep: true, at: [S.legOf(() => kindName), onMap(P.council)], clear: [S.card, S.cardHead],
        title: () => `${c}${kindName} hidden: ${cmp.council.map.size} of ${nbs(st().focus).length} neighbours stay`,
        text: () => `A click on the card hid the ${kindName} links. ${cmp.council.map.size} of the ${nbs(st().focus).length} neighbours stay around ${nm(st().focus)}, and the card now reads “${txt(S.legOf(() => kindName)().children[0]).split(' · ')[1]}”. Show all links brings every kind back at once.` }],
      ['click', S.legOf(() => kindName), 900], ['do', settle],
      ['note', { dep: true, at: [S.legOf(() => kindName), onMap(P.council)], clear: [S.card, S.cardHead],
        title: () => `${c}${kindName} back: ${cmp.council.map.size} neighbours again`,
        text: () => `A second click on the same card brings the links back: ${txt(S.legOf(() => kindName)().children[0])}, and ${cmp.council.map.size} neighbours around ${nm(st().focus)} again.` }],
      ['do', out(S.legOf(() => kindName)), 300],
      /* Arrange through Time, Role and back to Relation, with a note on what moved after each (owner, 23 Nov) */
      ['click', S.arr('Time'), 600], ['do', settle],
      ['note', { dep: true, at: [councilOr(S.arrange)], clear: [S.card, S.cardHead],
        title: () => { const f = focused(), ns = nbs(f.id); return `${c}Arrange: Time. ${ns.filter((n) => n.ei > f.ei).length} of the ${ns.length} neighbours are newer than ${f.name}` },
        text: () => `${seen('The neighbours moved by era', 'Time sorts the neighbours by era')}: older ideas to the left, newer ones to the right, the same era below. The card’s lists follow: ${sides()}.` }],
      ['click', S.arr('Role'), 600], ['do', settle],
      ['note', { dep: true, at: [councilOr(S.arrange)], clear: [S.card, S.cardHead],
        title: () => { const f = st().focus; return `${c}Arrange: Role. ${sols(f).length} solutions beside ${nm(f)}` },
        text: () => { const f = st().focus, s = sols(f), by = count(s, (n) => n.family), fm = focused().roleL === 'Failure mode', best = fm && fails().every((n) => sols(n.id).length <= s.length)
          return `${seen('Now they stand by role', 'Role sorts them by role')}: problems to the left, solutions to the right, claims and critiques above, lenses and evidence below. The card: ${sides()}.${fm && s.length ? ` ${nm(f)} is a failure mode with ${s.length} solutions among its neighbours${best ? `, the most of the ${fails().length} failure modes on the map` : ''}; ${by[0][1]} of the ${s.length} live on ${short(by[0][0])}.` : ''}` } }],
      /* one click reads a neighbour, a second steps to it (owner, 23 Nov); Arrange stays on Role, so the next card is read by role */
      ['do', async () => { gapId = gapOf(st().focus); await bring(P.beast(() => gapId))() }],
      ['click', or(P.beast(() => gapId), row(() => gapId)), 900],
      ['note', { dep: true, at: [onMap(P.beast(() => gapId)), S.peekBar], clear: [S.cardHead],
        title: `${c}One click reads a neighbour`,
        text: () => `The card now shows ${nm(st().peek)}, and the bar at its top leads back to ${nm(st().focus)}: nothing has moved yet. A second click on the beast, or Step → in its row, moves there.` }],
      ['click', or(P.beast(() => gapId), step(() => gapId)), 600], ['do', settle],
      ['note', { dep: true, at: [councilOr(S.cardHead)], clear: [S.card, S.cardHead],
        title: () => { const f = st().focus; return bare().includes(focused()) ? `${c}${nm(f)}: ${deg(f)} links, none to a solution` : `${c}A second click steps to ${nm(f)}` },
        text: () => { const f = st().focus
          return `The second click stepped to ${nm(f)}.${bare().includes(focused()) ? ` It is a failure mode with ${deg(f)} links, and none of them goes to a solution: its card lists ${sides()}. ${nm(hubId)}, one step back, has ${sols(hubId).length}.` : ` Its card lists ${sides()}.`}` } }],
      ['click', S.arr('Relation'), 600], ['do', settle],
      ['note', { dep: true, at: [councilOr(S.arrange)], clear: [S.card, S.cardHead],
        title: `${c}Arrange: Relation`,
        text: () => `Arrange: Relation puts the neighbours back by kind of link: what it comes from on the left, what it leads to on the right, what argues with it above, kin and echoes below. The card: ${sides()}.` }],
      /* the wiki link, framed on its own (owner: the map exists so people read the essays) */
      ['note', { at: [S.wiki], clear: [S.cardHead],
        title: `${c}Read the full entry`,
        text: () => `Read the full entry in the wiki ↗ opens the essay on ${nm(st().focus)} in a new tab: what the idea is, who proposed it and how it is argued.` }],

      ],
      // ---- the Expedition ----
      (c) => [
      ['click', S.mode('Expedition'), 600], ['do', settle], ['do', fold(false), 400],
      ['note', { at: [S.start, () => (narrow() ? null : S.flag())], clear: [S.flag],
        title: () => `${c}Expedition: ${st().quest.best} hops to the flag`,
        text: () => { const q = st().quest, d = far()
          return `A game on the same links: walk from ${nm(q.s)} to the flag, ${nm(q.t)}. The shortest route takes ${q.best} hops. ${d.all ? `Every beast can be reached from every other: no two are more than ${d.max} hops apart` : `No two linked beasts are more than ${d.max} hops apart`}, and an average pair is ${d.avg.toFixed(1)} hops apart. Links that only share a theme do not count.` } }],
      ['note', { at: [S.rules],
        /* CHANGED 2026-11-23 (after the blind verification): the switches are read from the page's table of rules and sorted by the group they join; the last sentence speaks of the switches, not of all kinds of link */
        title: () => `${c}One kind of link: ${list(rules().filter((r) => r.n < N()).map((r) => r.n).sort((a, b) => b - a))} of ${N()} beasts`,
        text: () => { const rs = rules(), part = rs.filter((r) => r.n < N()).sort((a, b) => b.n - a.n), whole = rs.filter((r) => r.n === N())
          return `The switches under New expedition along start a new game on one kind of link. The largest group of beasts that one kind joins: ${list(part.map((r, i) => `${r.n}${i ? '' : ` of ${N()}`} on ${r.l}`))}.${whole.length ? ` Of the ${word(rs.length)} switches only ${list(whole.map((r) => r.l))} join${whole.length === 1 ? 's' : ''} all ${N()}.` : ''}` } }],
      ['click', btn(/^Hint$/), 900],
      /* CHANGED 2026-11-23 (after the blind verification): below 708px the left panel covered the ring the note names: the panel is put away and the ringed beast brought onto the free map first */
      ['do', fold(true), 400], ['do', bring(P.hint)],
      ['note', { dep: true, at: [onMap(P.hint), S.foot],
        title: () => `${c}Hint: ${nm(cmp.hintId)}`,
        text: () => `Hint rings the next beast on a shortest route in gold, here ${nm(cmp.hintId)}.${S.foot() ? ' Undo steps back one hop, and Give up shows a shortest route.' : ' In the panel, Undo steps back one hop and Give up shows a shortest route.'}` }],
      ...Array.from({ length: far().max }, () => hop).flat(), /* CHANGED 2026-11-23: as many hops as the two beasts furthest apart need; a hop past the flag has no target and is passed over */
      ['do', fold(false), 400],
      /* at the flag the left panel offers the report; where the walk did not get there, Give up opens it with a shortest route */
      ['click', () => (st().result ? null : btn(/^Give up$/)()), 900],
      ['click', btn(/^Show expedition report$/), 900],
      ['note', { at: [S.grade, S.route], clear: [() => (narrow() ? null : S.yours())], /* CHANGED 2026-11-23: the card keeps off Your route where there is room beside it */
        title: () => { const q = st().quest, r = st().result; return r.gave ? `${c}Shortest routes: ${q.best} hops` : `${c}${r.grade}: ${q.hops} hops, ${q.best} at best` },
        text: () => { const q = st().quest, r = st().result
          return `${r.gave ? `Give up opened the report: the flag, ${nm(q.t)}, was ${q.best} hops from ${nm(q.s)}.` : `${nm(q.t)} reached in ${q.hops} hops; the shortest possible route takes ${q.best}.`} The graph draws every shortest route at once: ${r.g.routes === 1 ? 'here there is one' : `here ${r.g.routes} of them`}, through ${r.g.beasts} beasts, a column per hop and a line per link. A click on a beast opens it on the map.` } }], /* CHANGED 2026-11-27: the report draws every shortest route */
      ['click', () => btn(/^Close$/)() || btn(/^Keep trying$/)(), 700],

      ],
      // ---- the Chronicle ----
      (c) => [
      ['do', fold(true), 400],
      ['click', S.mode('Chronicle'), 600],
      ['hover', S.chronPlay],
      ['do', until(() => st().era >= halfEra() || !st().playing)],
      ['click', S.chronPlay, 600], ['do', settle],
      ['note', { at: [S.chron],
        title: () => { const a = alive(st().era), k = lastEra() - st().era; return st().era === halfEra() ? `${c}Over half the bestiary arrives in the last ${word(k)} eras` : `${c}Chronicle: ${a} of ${N()} beasts by ${eraName()}` },
        text: () => { const a = alive(st().era), k = lastEra() - st().era
          return `Chronicle grows the map era by era, and the demo paused it at ${eraName()}: ${a} of the ${N()} beasts are alive. The other ${N() - a} arrive in the last ${k === 1 ? 'era' : `${word(k)} eras`}.` } }],
      ['click', S.chronPlay, 600],
      ['do', until(() => !st().playing && st().era === lastEra())], ['do', settle],
      ['note', { at: [S.chron],
        title: () => { const e = lastEra(), by = count(cmp.nodes.filter((n) => n.ei === e), (n) => n.family).sort((a, b) => b[1] / size(b[0]) - a[1] / size(a[0])); return `${c}${eraName()}: ${by[0][1]} of ${size(by[0][0])} ${short(by[0][0])} beasts, ${by[1][1]} of ${size(by[1][0])} ${short(by[1][0])}` },
        text: () => { const e = lastEra(), born = cmp.nodes.filter((n) => n.ei === e), by = count(born, (n) => n.family).sort((a, b) => b[1] / size(b[0]) - a[1] / size(a[0])), r = tie(), same = [by[0][0], by[1][0]].every((k) => k === r.a || k === r.b)
          return `${born.length} of the ${N()} beasts are from ${eraName()}. By the share of an island that is this new, ${short(by[0][0])} leads with ${by[0][1]} of its ${size(by[0][0])} beasts, then ${short(by[1][0])} with ${by[1][1]} of ${size(by[1][0])}; the next, ${short(by[2][0])}, has ${by[2][1]} of ${size(by[2][0])}.${same ? ` The same two islands are joined by the widest route, ${r.c} links.` : ''}` } }],

      ],
      // ---- the result to take away, and the essay ----
      (c) => [
      ['click', S.mode('Wander'), 600], ['do', settle], ['do', fold(false), 400],
      ['hover', S.search],
      ['do', type(S.search, () => nm(endId())), 500],
      ['click', S.found(endId), 600], ['do', settle],
      /* CHANGED 2026-11-23 (after the blind verification): the closing note opens also when the search did not bring its beast up (the tour
         never ends on the Chronicle), and says how long the link stays: the map is put back when the tour ends */
      ['note', { finding: true, at: [() => (st().focus === endId() && S.wiki()) || S.search() || S.title()], clear: [S.cardHead],
        title: () => `${c}${bare().length} of ${fails().length} failure modes have no solution beside them`,
        text: () => { const e = endId(), on = st().focus === e && !!S.wiki(), by = count(bare(), (n) => n.family)
          return `${on ? `Find a beast… brought up ${nm(e)}` : `Take ${nm(e)}`}: a failure mode with ${deg(e)} links, none of them to a solution. On this map that is true of ${bare().length} of the ${fails().length} failure modes, ${by[0][1]} of them on ${short(by[0][0])}. Every beast is an essay${on ? ': Read the full entry in the wiki ↗ opens this one in a new tab. Use the link while this note is open: when the tour ends, the map goes back to where you left it.' : ', and its card links to it: Read the full entry in the wiki ↗.'}` } }],
      ],
    ]
    return [setup, ...chapters.flatMap((f, i) => f(`${i + 1} of ${chapters.length} · `))]
  }

  const bootWorld = () => {
    const cmp = window.__bestiaryWorld, btn = document.querySelector('button[title="Demo: how to read this"]')
    if (!cmp || !btn) { setTimeout(bootWorld, 300); return }
    document.head.append(Object.assign(document.createElement('style'), { textContent: CSS }))
    const root = Object.assign(document.createElement('div'), { style: 'position:fixed;inset:0;pointer-events:none;z-index:60' })
    document.body.append(root)
    window.BestiaryDemo.playWorld = startDemo(root, () => worldTour(cmp), { button: btn, watch: document, scroll: false, hold: worldKit(cmp).hold }).play /* CHANGED 2026-11-23: the map is put back after the tour, see hold */ /* CHANGED 2026-11-23: the intro overlay's Watch the demo button plays it */
  }

  // ADDED 2026-11-23: the page names its tour on the script tag (data-tour="world" on the Bestiarium Map); no name is the interactives
  const PAGE = document.currentScript.dataset.tour || 'interactives'
  const boot = () => {
    const ready = page() && ['2w', '4a', '2f'].every((id) => { const e = document.getElementById(id); return e && e.querySelector('button') }) /* CHANGED 2026-11-23: and the component is there */
    if (!ready) { setTimeout(boot, 300); return }
    document.head.append(Object.assign(document.createElement('style'), { textContent: CSS }))
    for (const id of Object.keys(TOURS)) { const root = document.getElementById(id); startDemo(root, TOURS[id], { hold: holdPage(root) }) } /* CHANGED 2026-11-23: see holdPage */
  }
  /* CHANGED 2026-11-23: each page boots its own tour; window.BestiaryDemo lets a script drive the engine (the Expedition video) */
  window.BestiaryDemo = { startDemo, wait, txt, worldKit }
  document.addEventListener('DOMContentLoaded', () => setTimeout(PAGE === 'world' ? bootWorld : boot, 300))
})()
