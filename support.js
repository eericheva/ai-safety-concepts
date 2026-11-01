// Runtime for design-canvas pages (.dc.html), the subset bestiary-interactives.html uses.
// The page holds a template in <x-dc> and a class `Component extends DCLogic` in
// <script type="text/x-dc" data-dc-script>. The class works like a React class component:
// state, setState(update, callback), forceUpdate, componentDidMount, componentWillUnmount, and
// renderVals() returns the values the template reads. Template syntax:
//   {{ a.b.c }}                 a value path, in attributes and text; `true` and `false` are literals
//   <sc-for list="{{ xs }}" as="x">   repeats its children for each item, `x` in scope
//   <sc-if value="{{ v }}">     renders its children when the value is truthy
//   onClick / onMouseEnter / onMouseLeave / onInput / onKeyDown / onFocus="{{ fn }}"   event handlers
//   value="{{ v }}" on an input also sets its live value, so clearing the state clears the field
//   style-hover="css"           declarations applied while the pointer is over the element
//   <helmet>                    its children go to <head>
// Rendering keeps the DOM nodes in place between updates, so CSS transitions run.
(() => {
  const SVG = 'http://www.w3.org/2000/svg'
  const EXPR = /\{\{\s*([^}]+?)\s*\}\}/g
  // CHANGED 2026-10-27: input, keydown and focus, for the search fields of the bestiary blocks
  const EVENTS = { onclick: 'click', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave', oninput: 'input', onkeydown: 'keydown', onfocus: 'focus' }
  const SKIP = new Set(['style-hover', 'hint-placeholder-count', 'hint-placeholder-val'])
  // The raw template must not flash before it is compiled.
  document.head.append(Object.assign(document.createElement('style'), { textContent: 'x-dc{display:none}' }))

  // "a {{ x }} b" -> ['a ', {e: 'x'}, ' b']; a lone expression keeps its value type.
  const parts = (s) => {
    const out = []
    let last = 0
    for (const m of s.matchAll(EXPR)) {
      if (m.index > last) out.push(s.slice(last, m.index))
      out.push({ e: m[1] })
      last = m.index + m[0].length
    }
    if (last < s.length) out.push(s.slice(last))
    return out
  }
  const lookup = (path, scope) => {
    if (path === 'true') return true
    if (path === 'false') return false
    const [head, ...rest] = path.split('.')
    let v = head in scope.local ? scope.local[head] : scope.vals[head]
    for (const k of rest) v = v == null ? undefined : v[k]
    return v
  }
  const value = (ps, scope) => (ps.length === 1 && typeof ps[0] !== 'string'
    ? lookup(ps[0].e, scope)
    : ps.map((p) => (typeof p === 'string' ? p : String(lookup(p.e, scope) ?? ''))).join(''))

  // Template DOM -> a tree of plain objects, compiled once.
  const compile = (node) => {
    // Whitespace between inline elements is kept; indentation (with a line break) is not.
    if (node.nodeType === 3) return node.data.trim() || !node.data.includes('\n') ? { text: parts(node.data) } : null
    if (node.nodeType !== 1) return null
    const tag = node.localName
    const kids = [...node.childNodes].map(compile).filter(Boolean)
    if (tag === 'sc-for') return { list: parts(node.getAttribute('list')), as: node.getAttribute('as'), kids }
    if (tag === 'sc-if') return { cond: parts(node.getAttribute('value')), kids }
    const attrs = []
    const on = []
    for (const a of node.attributes) {
      if (SKIP.has(a.name)) continue
      if (EVENTS[a.name]) on.push([EVENTS[a.name], parts(a.value)])
      else attrs.push([a.name, parts(a.value)])
    }
    const hover = node.getAttribute('style-hover')
    return { tag, svg: node.namespaceURI === SVG, attrs, on, hover: hover && parts(hover), kids }
  }

  // Hover styles become generated classes with :hover rules.
  const hoverSheet = document.createElement('style')
  const hoverCls = new Map()
  const hoverClass = (css) => {
    if (!hoverCls.has(css)) {
      const cls = `dch${hoverCls.size}`
      const decl = css.split(';').map((d) => d.trim()).filter(Boolean).map((d) => `${d} !important`).join(';')
      hoverSheet.append(`.${cls}:hover{${decl}}\n`)
      hoverCls.set(css, cls)
    }
    return hoverCls.get(css)
  }

  // Compiled tree + scope -> a flat list of virtual nodes.
  const expand = (t, scope, out) => {
    if (t.text) { out.push({ text: String(value(t.text, scope) ?? '') }); return }
    if (t.list) {
      for (const item of value(t.list, scope) || []) {
        const inner = { vals: scope.vals, local: { ...scope.local, [t.as]: item } }
        t.kids.forEach((k) => expand(k, inner, out))
      }
      return
    }
    if (t.cond) { if (value(t.cond, scope)) t.kids.forEach((k) => expand(k, scope, out)); return }
    const attrs = {}
    for (const [n, ps] of t.attrs) attrs[n] = value(ps, scope)
    if (t.hover) attrs.class = [attrs.class, hoverClass(value(t.hover, scope))].filter(Boolean).join(' ')
    const on = {}
    for (const [ev, ps] of t.on) on[ev] = value(ps, scope)
    const kids = []
    t.kids.forEach((k) => expand(k, scope, kids))
    out.push({ tag: t.tag, svg: t.svg, attrs, on, kids })
  }

  const create = (v) => {
    if ('text' in v) return document.createTextNode(v.text)
    const el = v.svg ? document.createElementNS(SVG, v.tag) : document.createElement(v.tag)
    el.__on = {}
    update(el, { attrs: {}, on: {}, kids: [] }, v)
    return el
  }
  const update = (el, old, v) => {
    for (const n in old.attrs) if (!(n in v.attrs)) el.removeAttribute(n)
    for (const n in v.attrs) if (old.attrs[n] !== v.attrs[n]) el.setAttribute(n, v.attrs[n])
    // CHANGED 2026-10-27: the attribute is only the default; the field shows the property
    if ('value' in v.attrs && el.value !== String(v.attrs.value)) el.value = v.attrs.value
    for (const ev in v.on) {
      if (!(ev in el.__on)) el.addEventListener(ev, (e) => { const f = el.__on[ev]; if (typeof f === 'function') f(e) })
      el.__on[ev] = v.on[ev]
    }
    patch(el, old.kids, v.kids)
  }
  // Same position and same tag: update in place; otherwise replace.
  const patch = (parent, olds, news) => {
    news.forEach((v, i) => {
      const o = olds[i]
      if (o && 'text' in o && 'text' in v) { v.el = o.el; if (o.text !== v.text) o.el.data = v.text }
      else if (o && o.tag && o.tag === v.tag) { v.el = o.el; update(o.el, o, v) }
      else { v.el = create(v); o ? parent.replaceChild(v.el, o.el) : parent.appendChild(v.el) }
    })
    for (let i = news.length; i < olds.length; i++) parent.removeChild(olds[i].el)
  }

  class DCLogic {
    constructor() { this.state = {} }
    setState(update, cb) {
      const next = typeof update === 'function' ? update(this.state) : update
      this.state = { ...this.state, ...next }
      this.__schedule(cb)
    }
    forceUpdate(cb) { this.__schedule(cb) }
  }
  window.DCLogic = DCLogic

  document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(hoverSheet)
    const root = document.querySelector('x-dc')
    const helmet = root.querySelector('helmet')
    if (helmet) { [...helmet.children].forEach((c) => document.head.appendChild(c)); helmet.remove() }
    const tree = [...root.childNodes].map(compile).filter(Boolean)
    const code = document.querySelector('script[data-dc-script]').textContent
    const Component = new Function('DCLogic', `${code}\nreturn Component`)(DCLogic)
    const host = document.createElement('div')
    root.replaceWith(host)
    const c = new Component()
    let shown = []
    let queued = false
    let cbs = []
    const render = () => {
      queued = false
      const out = []
      const scope = { vals: c.renderVals(), local: {} }
      tree.forEach((t) => expand(t, scope, out))
      patch(host, shown, out)
      shown = out
      const run = cbs
      cbs = []
      run.forEach((f) => f())
    }
    c.__schedule = (cb) => {
      if (cb) cbs.push(cb)
      if (!queued) { queued = true; queueMicrotask(render) }
    }
    render()
    c.componentDidMount()
    window.addEventListener('pagehide', () => c.componentWillUnmount())
  })
})()
