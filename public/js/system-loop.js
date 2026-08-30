/* System Loop — isometric line-system header animation
   Framework-free port of the "System Loop" Claude Design prototype.
   Mounts into #system-loop and loops on its own. */
(function () {
  'use strict';

  /* ================= configuration ================= */

  var PALETTE = { accent: '#1620F5', ink: '#0A0A0B', paper: 'transparent' };
  var FAINT = PALETTE.ink + '2E';
  var SHOW_PULSES = true;
  var DENSITY = 1; // 0.3–1, thins out traces/arcs if you want a lighter look

  /* ================= projection ================= */

  var W = 1080, H = 1920;
  var S = 0.86, C30 = 0.8660254;
  var OX = 540, OY = 1330;

  function iso(x, y, z) {
    return {
      x: OX + (x - y) * C30 * S,
      y: OY + ((x + y) * 0.5 - z) * S,
    };
  }
  function px(p) { return iso(p.x, p.y, p.z || 0); }
  function polyScreen(pts) { return pts.map(px); }

  /* ================= deterministic data (seeded) ================= */

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry32(20260812);

  var STEP = 120, EXT = 300;
  function shuffled(arr, r) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  var gridPts = [];
  for (var gx = -2; gx <= 2; gx++) for (var gy = -2; gy <= 2; gy++) gridPts.push({ x: gx * STEP, y: gy * STEP });

  var LAYERS = [
    { z: 0, count: 9 },
    { z: 400, count: 7 },
    { z: 800, count: 5 },
  ].map(function (l) {
    return Object.assign({}, l, {
      nodes: shuffled(gridPts, rnd).slice(0, l.count).map(function (p) { return Object.assign({}, p, { z: l.z }); }),
    });
  });

  function dist2(a, b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }

  var TRACES = [];
  LAYERS.forEach(function (l, li) {
    l.nodes.forEach(function (n, i) {
      var near = l.nodes
        .map(function (m, j) { return { m: m, j: j, d: dist2(n, m) }; })
        .filter(function (o) { return o.j !== i; })
        .sort(function (a, b) { return a.d - b.d; })
        .slice(0, 2);
      near.forEach(function (o) {
        var m = o.m, j = o.j;
        if (j < i) return;
        var flip = rnd() > 0.5;
        var corner = flip ? { x: m.x, y: n.y } : { x: n.x, y: m.y };
        TRACES.push({ li: li, pts: [n, corner, m].map(function (p) { return Object.assign({}, p, { z: l.z }); }) });
      });
    });
  });

  var RISERS = [], ARCS = [];
  for (var li = 0; li < LAYERS.length - 1; li++) {
    (function (li) {
      var lower = LAYERS[li], upper = LAYERS[li + 1];
      lower.nodes.forEach(function (n) {
        var target = upper.nodes.slice().sort(function (a, b) { return dist2(n, a) - dist2(n, b); })[0];
        var flip = rnd() > 0.5;
        var corner = flip ? { x: target.x, y: n.y } : { x: n.x, y: target.y };
        RISERS.push({
          li: li,
          pts: [
            Object.assign({}, n, { z: lower.z }),
            Object.assign({}, n, { z: upper.z }),
            Object.assign({}, corner, { z: upper.z }),
            Object.assign({}, target, { z: upper.z }),
          ],
        });
      });
      upper.nodes.forEach(function (n, i) {
        var a = lower.nodes[(i * 3 + li) % lower.nodes.length];
        ARCS.push({
          li: li,
          a: Object.assign({}, a, { z: lower.z }),
          b: Object.assign({}, n, { z: upper.z }),
          bow: 0.9 + rnd() * 0.8,
          side: rnd() > 0.5 ? 1 : -1,
        });
      });
    })(li);
  }

  /* ================= path / motion helpers ================= */

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function polyLen(sp) {
    var t = 0, segs = [];
    for (var i = 1; i < sp.length; i++) {
      var dd = Math.hypot(sp[i].x - sp[i - 1].x, sp[i].y - sp[i - 1].y);
      segs.push(dd); t += dd;
    }
    return { total: t, segs: segs };
  }
  function polyTrim(sp, prog) {
    if (prog <= 0) return [];
    var L = polyLen(sp), segs = L.segs;
    var want = L.total * clamp(prog, 0, 1);
    var out = [sp[0]];
    for (var i = 0; i < segs.length; i++) {
      if (want >= segs[i]) { out.push(sp[i + 1]); want -= segs[i]; }
      else {
        var f = segs[i] === 0 ? 0 : want / segs[i];
        out.push({ x: sp[i].x + (sp[i + 1].x - sp[i].x) * f, y: sp[i].y + (sp[i + 1].y - sp[i].y) * f });
        break;
      }
    }
    return out;
  }
  function polyAt(sp, t) {
    var L = polyLen(sp), segs = L.segs;
    var want = L.total * clamp(t, 0, 1);
    for (var i = 0; i < segs.length; i++) {
      if (want > segs[i]) { want -= segs[i]; continue; }
      var f = segs[i] === 0 ? 0 : want / segs[i];
      return { x: sp[i].x + (sp[i + 1].x - sp[i].x) * f, y: sp[i].y + (sp[i + 1].y - sp[i].y) * f };
    }
    return sp[sp.length - 1];
  }
  function dAttr(sp) {
    return sp.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
  }
  function arcGeom(a) {
    var p0 = px(a.a), p1 = px(a.b);
    var mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
    var nx = -(p1.y - p0.y), ny = p1.x - p0.x;
    var nl = Math.hypot(nx, ny) || 1;
    var k = 0.28 * a.bow * a.side * Math.hypot(p1.x - p0.x, p1.y - p0.y);
    return { p0: p0, p1: p1, c: { x: mx + (nx / nl) * k, y: my + (ny / nl) * k } };
  }

  var Easing = {
    linear: function (t) { return t; },
    easeInOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    easeOutCubic: function (t) { t = t - 1; return t * t * t + 1; },
    easeOutBack: function (t) {
      var c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
  };
  function animate(opts) {
    var from = opts.from == null ? 0 : opts.from, to = opts.to == null ? 1 : opts.to;
    var start = opts.start, end = opts.end, ease = opts.ease;
    return function (t) {
      if (t <= start) return from;
      if (t >= end) return to;
      return from + (to - from) * ease((t - start) / (end - start));
    };
  }
  function interpolate(input, output, ease) {
    ease = ease || Easing.linear;
    return function (t) {
      if (t <= input[0]) return output[0];
      if (t >= input[input.length - 1]) return output[output.length - 1];
      for (var i = 0; i < input.length - 1; i++) {
        if (t >= input[i] && t <= input[i + 1]) {
          var span = input[i + 1] - input[i];
          var local = span === 0 ? 0 : (t - input[i]) / span;
          return output[i] + (output[i + 1] - output[i]) * ease(local);
        }
      }
      return output[output.length - 1];
    };
  }
  var MOTION = {
    enter: function (start, end) { return animate({ from: 0, to: 1, start: start, end: end, ease: Easing.easeOutCubic }); },
    draw: function (start, end) { return animate({ from: 0, to: 1, start: start, end: end, ease: Easing.easeInOutQuad }); },
    pop: function (start, end) { return animate({ from: 0, to: 1, start: start, end: end, ease: Easing.easeOutBack }); },
  };
  function stag(i, n, start, span, len) {
    var s = start + (span * i) / Math.max(1, n);
    return [s, s + len];
  }

  /* Scene cue table — derived from the authored OM_SCENES timeline
     (Grid 2.6s, Rise 3.4s, Weave 3.6s, Flow 3.6s, Fade 2.4s). */
  var CUES = { Grid: 0, Rise: 2.6, Weave: 6.0, Flow: 9.6, Fade: 13.2 };
  var AUTHORED_TOTAL = 15.6;

  /* ================= SVG scaffolding ================= */

  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function mount(container) {
    var VIEW_Y_SHIFT = 250;
    var VIEW_H = 1430;
    var svg = svgEl('svg', { viewBox: '0 ' + VIEW_Y_SHIFT + ' ' + W + ' ' + VIEW_H, preserveAspectRatio: 'xMidYMid meet' });
    var defs = svgEl('defs');
    var clip = svgEl('clipPath', { id: 'system-loop-frame' });
    clip.appendChild(svgEl('rect', { x: 44, y: 44, width: W - 88, height: H - 88 }));
    defs.appendChild(clip);
    svg.appendChild(defs);

    var gClip = svgEl('g', { 'clip-path': 'url(#system-loop-frame)' });
    var gCam = svgEl('g');
    gCam.style.transformOrigin = '540px 980px';
    gClip.appendChild(gCam);
    svg.appendChild(gClip);
    container.appendChild(svg);

    /* ---- planes ---- */
    var layerGroups = LAYERS.map(function () {
      var g = svgEl('g');
      gCam.appendChild(g);
      return g;
    });
    var planes = LAYERS.map(function (l, li) {
      var z = l.z;
      var lines = [];
      var n = (EXT / STEP) * 2;
      for (var i = 0; i <= n; i++) {
        var v = -EXT + i * (STEP / 2);
        lines.push([{ x: v, y: -EXT, z: z }, { x: v, y: EXT, z: z }]);
        lines.push([{ x: -EXT, y: v, z: z }, { x: EXT, y: v, z: z }]);
      }
      var lineScreens = lines.map(polyScreen);
      var linePaths = lineScreens.map(function () {
        var p = svgEl('path', { fill: 'none', stroke: FAINT, 'stroke-width': 0.9 });
        layerGroups[li].appendChild(p);
        return p;
      });
      var border = polyScreen([
        { x: -EXT, y: -EXT, z: z }, { x: EXT, y: -EXT, z: z }, { x: EXT, y: EXT, z: z }, { x: -EXT, y: EXT, z: z }, { x: -EXT, y: -EXT, z: z },
      ]);
      var borderPath = svgEl('path', { fill: 'none', stroke: PALETTE.ink, 'stroke-width': 1.8, opacity: 0.55 });
      layerGroups[li].appendChild(borderPath);
      return { lineScreens: lineScreens, linePaths: linePaths, border: border, borderPath: borderPath };
    });

    /* ---- in-plane traces ---- */
    var gTraces = svgEl('g'); gCam.appendChild(gTraces);
    var tracesN = Math.round(TRACES.length * DENSITY);
    var traces = TRACES.slice(0, tracesN).map(function (tr, i) {
      var sp = polyScreen(tr.pts);
      var path = svgEl('path', { fill: 'none', stroke: PALETTE.ink, 'stroke-width': 1.5, opacity: 0.75 });
      gTraces.appendChild(path);
      var cue = stag(i, tracesN, CUES.Rise + 1.4, 2.6, 1.1);
      return { sp: sp, path: path, prog: MOTION.draw(cue[0], cue[1]) };
    });

    /* ---- risers ---- */
    var gRisers = svgEl('g'); gCam.appendChild(gRisers);
    var risers = RISERS.map(function (r, i) {
      var sp = polyScreen(r.pts);
      var path = svgEl('path', { fill: 'none', stroke: PALETTE.ink, 'stroke-width': 1.5, opacity: 0.85 });
      gRisers.appendChild(path);
      var cue = stag(i, RISERS.length, CUES.Weave - 0.2, 2.4, 1.3);
      return { sp: sp, path: path, prog: MOTION.draw(cue[0], cue[1]) };
    });

    /* ---- sweeping arcs ---- */
    var gArcs = svgEl('g'); gCam.appendChild(gArcs);
    var arcsN = Math.round(ARCS.length * DENSITY);
    var arcs = ARCS.slice(0, arcsN).map(function (a, i) {
      var g = arcGeom(a);
      var dStr = 'M' + g.p0.x + ' ' + g.p0.y + ' Q' + g.c.x + ' ' + g.c.y + ' ' + g.p1.x + ' ' + g.p1.y;
      var path = svgEl('path', {
        d: dStr, stroke: PALETTE.ink, 'stroke-width': 1.1, fill: 'none', opacity: 0.42,
        pathLength: '1', 'stroke-dasharray': '1',
      });
      gArcs.appendChild(path);
      var cue = stag(i, arcsN, CUES.Weave + 0.6, 2.4, 1.4);
      return { path: path, prog: MOTION.draw(cue[0], cue[1]) };
    });

    /* ---- shapes: data stacks, cubes, product surfaces ---- */
    var gShapes = svgEl('g'); gCam.appendChild(gShapes);

    function buildDataStack(p, progFn) {
      var g = svgEl('g'); gShapes.appendChild(g);
      var discZ = [0, 26, 52, 78];
      var ellipses = discZ.map(function (dz, i) {
        var e = svgEl('ellipse', { fill: 'none', stroke: PALETTE.ink, 'stroke-width': 1.5, opacity: 0.4 + i * 0.2 });
        g.appendChild(e);
        return e;
      });
      var lineL = svgEl('path', { stroke: PALETTE.ink, 'stroke-width': 1.4 }); g.appendChild(lineL);
      var lineR = svgEl('path', { stroke: PALETTE.ink, 'stroke-width': 1.4 }); g.appendChild(lineR);
      var rr = 46;
      return {
        update: function (T) {
          var k = clamp(progFn(T), 0, 1);
          g.style.opacity = k;
          discZ.forEach(function (dz, i) {
            var q = px({ x: p.x, y: p.y, z: p.z + dz * k });
            ellipses[i].setAttribute('cx', q.x); ellipses[i].setAttribute('cy', q.y);
            ellipses[i].setAttribute('rx', 1.2247 * rr * S); ellipses[i].setAttribute('ry', 0.7071 * rr * S);
          });
          var base = px({ x: p.x, y: p.y, z: p.z });
          var top = px({ x: p.x, y: p.y, z: p.z + 78 * k });
          var xl = base.x - 1.2247 * rr * S, xr = base.x + 1.2247 * rr * S;
          lineL.setAttribute('d', 'M' + xl + ' ' + base.y + ' L' + xl + ' ' + top.y);
          lineR.setAttribute('d', 'M' + xr + ' ' + base.y + ' L' + xr + ' ' + top.y);
        },
      };
    }

    function buildIsoCube(p, w, h, progFn) {
      var g = svgEl('g'); gShapes.appendChild(g);
      var t = [
        { x: p.x - w, y: p.y - w, z: p.z + h }, { x: p.x + w, y: p.y - w, z: p.z + h },
        { x: p.x + w, y: p.y + w, z: p.z + h }, { x: p.x - w, y: p.y + w, z: p.z + h },
      ].map(px);
      var b = [
        { x: p.x - w, y: p.y + w, z: p.z }, { x: p.x + w, y: p.y + w, z: p.z }, { x: p.x + w, y: p.y - w, z: p.z },
      ].map(px);
      var topPath = svgEl('path', {
        fill: 'none', stroke: PALETTE.ink, 'stroke-width': 1.6,
        d: 'M' + t[0].x + ' ' + t[0].y + ' L' + t[1].x + ' ' + t[1].y + ' L' + t[2].x + ' ' + t[2].y + ' L' + t[3].x + ' ' + t[3].y + ' Z',
      });
      var sidePath = svgEl('path', {
        fill: 'none', stroke: PALETTE.ink, 'stroke-width': 1.4,
        d: 'M' + t[3].x + ' ' + t[3].y + ' L' + b[0].x + ' ' + b[0].y + ' L' + b[1].x + ' ' + b[1].y + ' L' + b[2].x + ' ' + b[2].y,
      });
      var edgePath = svgEl('path', {
        stroke: PALETTE.ink, 'stroke-width': 1.4,
        d: 'M' + t[2].x + ' ' + t[2].y + ' L' + b[1].x + ' ' + b[1].y,
      });
      g.appendChild(topPath); g.appendChild(sidePath); g.appendChild(edgePath);
      return {
        update: function (T) {
          var k = clamp(progFn(T), 0, 1);
          g.style.opacity = k;
          g.style.transform = 'translateY(' + ((1 - k) * 26) + 'px)';
        },
      };
    }

    function buildSurface(p, w, hgt, withBars, progFn) {
      var g = svgEl('g'); gShapes.appendChild(g);
      var corners = [
        { x: p.x - w, y: p.y - hgt, z: p.z }, { x: p.x + w, y: p.y - hgt, z: p.z },
        { x: p.x + w, y: p.y + hgt, z: p.z }, { x: p.x - w, y: p.y + hgt, z: p.z },
      ].map(px);
      var border = svgEl('path', {
        fill: 'none', stroke: PALETTE.ink, 'stroke-width': 1.8,
        d: 'M' + corners.map(function (c) { return c.x + ' ' + c.y; }).join(' L') + ' Z',
      });
      g.appendChild(border);

      var rowScreens = [];
      for (var i = 1; i <= 3; i++) {
        var yy = -hgt + (i * 2 * hgt) / 4;
        rowScreens.push(polyScreen([{ x: p.x - w * 0.7, y: p.y + yy, z: p.z }, { x: p.x + w * 0.55, y: p.y + yy, z: p.z }]));
      }
      var rowPaths = rowScreens.map(function () {
        var rp = svgEl('path', { stroke: PALETTE.ink, 'stroke-width': 1.1, opacity: 0.5, fill: 'none' });
        g.appendChild(rp);
        return rp;
      });

      var bars = null;
      if (withBars) {
        var heights = [70, 44, 100];
        bars = [0, 1, 2].map(function (i) {
          var base = { x: p.x - w * 0.4 + i * 38, y: p.y + hgt * 0.45, z: p.z };
          var line = svgEl('path', { stroke: i === 2 ? PALETTE.accent : PALETTE.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
          var disc = svgEl('ellipse', { fill: 'none', stroke: i === 2 ? PALETTE.accent : PALETTE.ink, 'stroke-width': 1.5 });
          g.appendChild(line); g.appendChild(disc);
          return { base: base, h: heights[i], line: line, disc: disc };
        });
      }

      return {
        update: function (T) {
          var k = clamp(progFn(T), 0, 1);
          g.style.opacity = k;
          g.style.transform = 'translateY(' + ((1 - k) * 34) + 'px)';
          rowPaths.forEach(function (rp, i) {
            rp.setAttribute('d', dAttr(polyTrim(rowScreens[i], clamp(k * 1.6 - i * 0.2, 0, 1))));
          });
          if (bars) {
            bars.forEach(function (bar) {
              var bh = bar.h * k;
              var a = px(bar.base), b = px(Object.assign({}, bar.base, { z: bar.base.z + bh }));
              bar.line.setAttribute('d', 'M' + a.x + ' ' + a.y + ' L' + b.x + ' ' + b.y);
              bar.disc.setAttribute('cx', b.x); bar.disc.setAttribute('cy', b.y);
              bar.disc.setAttribute('rx', 1.2247 * 9 * S); bar.disc.setAttribute('ry', 0.7071 * 9 * S);
            });
          }
        },
      };
    }

    var shapes = [
      buildDataStack(Object.assign({}, LAYERS[0].nodes[0], { z: 0 }), MOTION.pop(CUES.Rise + 0.3, CUES.Rise + 1.5)),
      buildDataStack(Object.assign({}, LAYERS[0].nodes[3], { z: 0 }), MOTION.pop(CUES.Rise + 0.7, CUES.Rise + 1.9)),
    ];
    LAYERS[1].nodes.slice(0, 4).forEach(function (n, i) {
      var cue = stag(i, 4, CUES.Weave - 0.6, 1.2, 1.1);
      shapes.push(buildIsoCube(Object.assign({}, n, { z: 400 }), 38, 70, MOTION.pop(cue[0], cue[1])));
    });
    shapes.push(buildSurface(Object.assign({}, LAYERS[2].nodes[0], { z: 800 }), 110, 80, true, MOTION.pop(CUES.Weave + 1.0, CUES.Weave + 2.4)));
    shapes.push(buildSurface(Object.assign({}, LAYERS[2].nodes[2], { z: 800 }), 90, 70, false, MOTION.pop(CUES.Weave + 1.4, CUES.Weave + 2.8)));

    /* ---- nodes ---- */
    var gNodes = svgEl('g'); gCam.appendChild(gNodes);
    var nodes = [];
    LAYERS.forEach(function (l, li) {
      l.nodes.forEach(function (n, i) {
        var g = svgEl('g');
        var diamond = svgEl('path', { fill: 'none', 'stroke-width': 1.6 });
        var dot = svgEl('circle', {});
        g.appendChild(diamond); g.appendChild(dot);
        gNodes.appendChild(g);
        var cue = stag(i, l.nodes.length, CUES.Rise + 0.9 + li * 0.5, 1.2, 0.7);
        var hot = li === 2 || (li === 1 && i === 0);
        var q = px(Object.assign({}, n, { z: l.z }));
        nodes.push({ g: g, diamond: diamond, dot: dot, q: q, popFn: MOTION.pop(cue[0], cue[1]), hot: hot });
      });
    });

    /* ---- pulses ---- */
    var gPulses = svgEl('g'); gCam.appendChild(gPulses);
    var pulseRisers = RISERS.map(function (r, i) {
      var sp = polyScreen(r.pts);
      var path = svgEl('path', { stroke: PALETTE.accent, 'stroke-width': 4, 'stroke-linecap': 'round' });
      gPulses.appendChild(path);
      return { sp: sp, i: i, path: path };
    });
    var pulseTraces = TRACES.map(function (tr, i) {
      if (i % 2) return null;
      var sp = polyScreen(tr.pts);
      var path = svgEl('path', { stroke: PALETTE.accent, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.85 });
      gPulses.appendChild(path);
      return { sp: sp, i: i, path: path };
    }).filter(Boolean);

    /* ================= per-frame update ================= */

    var outFn = MOTION.draw(CUES.Fade + 0.4, AUTHORED_TOTAL - 0.15);
    /* Camera drift/scale settles well before FREEZE_AT (12.5s below) so
       the frame is already still for a couple of seconds before it locks
       — otherwise the freeze would catch it mid-shrink. */
    var camKFn = MOTION.draw(0, 9.5);
    var scaleFn = interpolate([0, 1], [1.1, 0.9]);
    var driftFn = interpolate([0, 1], [40, -30]);
    var spinFn = interpolate([0, 1], [-2.2, 2.2]);
    var planeProgFns = [
      MOTION.draw(0.2, CUES.Rise + 0.2),
      MOTION.draw(CUES.Rise + 0.1, CUES.Rise + 2.1),
      MOTION.draw(CUES.Rise + 0.8, CUES.Rise + 2.8),
    ];
    var liftFns = [null, MOTION.enter(CUES.Rise, CUES.Rise + 1.8), MOTION.enter(CUES.Rise + 0.7, CUES.Rise + 2.5)];
    var showPulseFn = MOTION.enter(CUES.Flow - 0.5, CUES.Flow + 0.8);

    function update(T) {
      var out = 1 - outFn(T);
      var camK = camKFn(T);
      var scale = scaleFn(camK);
      var drift = driftFn(camK);
      var spin = spinFn(camK);

      gClip.style.opacity = out;
      gCam.style.transform = 'translate(0px, ' + drift + 'px) scale(' + scale + ') rotate(' + spin + 'deg)';

      var planeProg = [planeProgFns[0](T), planeProgFns[1](T), planeProgFns[2](T)];
      var lift = [0, liftFns[1](T), liftFns[2](T)];

      LAYERS.forEach(function (l, li) {
        layerGroups[li].style.transform = 'translateY(' + ((1 - lift[li]) * (li === 0 ? 0 : 90)) + 'px)';
        layerGroups[li].style.opacity = li === 0 ? 1 : lift[li];
        var plane = planes[li];
        var prog = planeProg[li];
        plane.linePaths.forEach(function (path, i) {
          var p = clamp(prog * 1.5 - (i / plane.linePaths.length) * 0.5, 0, 1);
          path.setAttribute('d', p <= 0 ? '' : dAttr(polyTrim(plane.lineScreens[i], p)));
        });
        plane.borderPath.setAttribute('d', dAttr(polyTrim(plane.border, clamp(prog * 1.2, 0, 1))));
      });

      traces.forEach(function (tr) {
        var p = tr.prog(T);
        tr.path.setAttribute('d', p <= 0 ? '' : dAttr(polyTrim(tr.sp, p)));
      });
      risers.forEach(function (r) {
        var p = r.prog(T);
        r.path.setAttribute('d', p <= 0 ? '' : dAttr(polyTrim(r.sp, p)));
      });
      arcs.forEach(function (a) {
        var p = a.prog(T);
        if (p <= 0) { a.path.setAttribute('opacity', 0); return; }
        a.path.setAttribute('opacity', 0.42);
        a.path.setAttribute('stroke-dashoffset', 1 - p);
      });

      shapes.forEach(function (s) { s.update(T); });

      nodes.forEach(function (nd) {
        var k = nd.popFn(T);
        if (k <= 0) { nd.g.style.opacity = 0; return; }
        nd.g.style.opacity = clamp(k, 0, 1);
        var s = clamp(k, 0.2, 1);
        var r = 13 * s, q = nd.q;
        var col = nd.hot ? PALETTE.accent : PALETTE.ink;
        nd.diamond.setAttribute('stroke', col);
        nd.diamond.setAttribute('d', 'M' + q.x + ' ' + (q.y - r * 0.6) + ' L' + (q.x + r) + ' ' + q.y + ' L' + q.x + ' ' + (q.y + r * 0.6) + ' L' + (q.x - r) + ' ' + q.y + ' Z');
        nd.dot.setAttribute('cx', q.x); nd.dot.setAttribute('cy', q.y);
        nd.dot.setAttribute('r', 2.2 * s); nd.dot.setAttribute('fill', col);
      });

      var showPulse = showPulseFn(T);
      if (SHOW_PULSES && showPulse > 0.01) {
        gPulses.style.opacity = showPulse;
        gPulses.style.display = '';
        pulseRisers.forEach(function (pr) {
          var f = (T * 0.24 + pr.i * 0.13) % 1;
          var head = polyAt(pr.sp, f), tail = polyAt(pr.sp, clamp(f - 0.08, 0, 1));
          pr.path.setAttribute('d', 'M' + tail.x + ' ' + tail.y + ' L' + head.x + ' ' + head.y);
        });
        pulseTraces.forEach(function (pt) {
          var f = (T * 0.33 + pt.i * 0.21) % 1;
          var head = polyAt(pt.sp, f), tail = polyAt(pt.sp, clamp(f - 0.12, 0, 1));
          pt.path.setAttribute('d', 'M' + tail.x + ' ' + tail.y + ' L' + head.x + ' ' + head.y);
        });
      } else {
        gPulses.style.display = 'none';
      }
    }

    return { update: update };
  }

  /* ================= boot ================= */

  var host = document.getElementById('system-loop');
  if (!host) return;
  var scene = mount(host);

  /* Play once from page load, then freeze on the fully-formed frame —
     before the authored Fade stage (13.2s) would start dissolving it —
     instead of looping back to an empty frame forever. */
  var FREEZE_AT = 12.5;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    scene.update(FREEZE_AT);
  } else {
    var startTs = null;
    function frame(ts) {
      if (startTs === null) startTs = ts;
      var T = (ts - startTs) / 1000;
      if (T >= FREEZE_AT) {
        scene.update(FREEZE_AT);
        return;
      }
      scene.update(T);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
