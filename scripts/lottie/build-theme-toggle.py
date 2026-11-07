"""Builds the navbar theme animation (src/assets/animations/theme_toggle.json):
a moon ⇄ sun Lottie whose first and last frames are exactly the Material
Symbols Outlined `dark_mode` and `light_mode` glyphs (FILL 0, wght 400), so
ThemeToggleIcon can hand over between the font icon and the animation with no
visible change. Timing follows the original theme.lottie (moon turns and fills
out into the ring, then the rays grow out clockwise with a small overshoot).

    python3 scripts/lottie/build-theme-toggle.py \
      src/assets/fonts/material-symbols-outlined-normal-icons-*.woff2 \
      src/assets/animations/theme_toggle.json

Needs fontTools and brotli (pip install fonttools brotli).
"""
import json, math, re, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.recordingPen import RecordingPen

FONT, OUT, PATHS_OUT = sys.argv[1], sys.argv[2], sys.argv[3]
f = TTFont(FONT)
inst = instantiateVariableFont(f, {a.axisTag: a.defaultValue for a in f['fvar'].axes})
gs, cmap = inst.getGlyphSet(), inst.getBestCmap()
EM = 960
C = (480.0, 480.0)  # glyph centre (screen coords)

def contours(cp):
    """Glyph -> list of contours; each contour = list of cubic segments (p0,c1,c2,p1) in screen coords (y down)."""
    pen = RecordingPen(); gs[cmap[cp]].draw(pen)
    out, cur, start, pt = [], None, None, None
    fl = lambda p: (float(p[0]), EM - float(p[1]))
    for op, args in pen.value:
        if op == 'moveTo':
            cur = []; start = pt = fl(args[0])
        elif op == 'lineTo':
            p1 = fl(args[0]); cur.append((pt, pt, p1, p1)); pt = p1
        elif op == 'qCurveTo':
            # TrueType implied on-curve points between consecutive off-curve ones.
            if args[-1] is None:
                # A contour of only off-curve points (a circle): it starts and
                # ends at the midpoint of its last and first points.
                offs = [fl(a) for a in args[:-1]]
                start = pt = ((offs[-1][0] + offs[0][0]) / 2, (offs[-1][1] + offs[0][1]) / 2)
                cur = []
                end = start
            else:
                pts = [fl(a) for a in args]
                offs, end = pts[:-1], pts[-1]
            for k, q in enumerate(offs):
                p1 = end if k == len(offs) - 1 else ((q[0] + offs[k+1][0]) / 2, (q[1] + offs[k+1][1]) / 2)
                c1 = (pt[0] + 2/3*(q[0]-pt[0]), pt[1] + 2/3*(q[1]-pt[1]))
                c2 = (p1[0] + 2/3*(q[0]-p1[0]), p1[1] + 2/3*(q[1]-p1[1]))
                cur.append((pt, c1, c2, p1)); pt = p1
        elif op == 'curveTo':
            c1, c2, p1 = map(fl, args); cur.append((pt, c1, c2, p1)); pt = p1
        elif op in ('closePath', 'endPath'):
            if pt != start: cur.append((pt, pt, start, start))
            # Drop the font's zero-area placeholder contours.
            xs = [p for s in cur for p in s]
            if max(x for x, _ in xs) - min(x for x, _ in xs) > 1: out.append(cur)
            cur = None
    return out

def to_lottie(segs):
    v, i, o = [], [], []
    n = len(segs)
    for k, (p0, c1, c2, p1) in enumerate(segs):
        prev = segs[k-1]
        v.append([round(p0[0], 2), round(p0[1], 2)])
        o.append([round(c1[0]-p0[0], 2), round(c1[1]-p0[1], 2)])
        i.append([round(prev[2][0]-p0[0], 2), round(prev[2][1]-p0[1], 2)])
    return {'i': i, 'o': o, 'v': v, 'c': True}

def seg_len(s, n=24):
    p0, c1, c2, p1 = s; L, prev = 0, p0
    for k in range(1, n+1):
        t = k/n; u = 1-t
        x = u**3*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t**3*p1[0]
        y = u**3*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t**3*p1[1]
        L += math.hypot(x-prev[0], y-prev[1]); prev = (x, y)
    return L

def signed_area(segs):
    pts = [s[0] for s in segs]
    return sum(pts[k][0]*pts[(k+1) % len(pts)][1] - pts[(k+1) % len(pts)][0]*pts[k][1] for k in range(len(pts))) / 2

def circle_like(segs, r):
    """A circle of radius r with one vertex per vertex of `segs`, spaced by the
    arc-length share of each segment, same winding, starting at the angle of
    segs' first vertex. Same vertex count = a clean Lottie morph."""
    lens = [seg_len(s) for s in segs]; total = sum(lens)
    direction = 1 if signed_area(segs) > 0 else -1  # screen coords: >0 = clockwise
    a0 = math.atan2(segs[0][0][1]-C[1], segs[0][0][0]-C[0])
    angles, acc = [], 0
    for L in lens:
        angles.append(a0 + direction*2*math.pi*acc/total); acc += L
    out = []
    n = len(angles)
    for k in range(n):
        a, b = angles[k], angles[(k+1) % n] if k+1 < n else angles[0] + direction*2*math.pi
        h = 4/3*math.tan((b-a)/4)*r
        P = lambda t: (C[0]+r*math.cos(t), C[1]+r*math.sin(t))
        T = lambda t: (-math.sin(t), math.cos(t))
        p0, p1 = P(a), P(b)
        out.append((p0, (p0[0]+h*T(a)[0], p0[1]+h*T(a)[1]), (p1[0]-h*T(b)[0], p1[1]-h*T(b)[1]), p1))
    return out

moon = contours(0xE51C)   # [outer edge, inner edge]
sun = contours(0xE518)    # [inner ring, outer ring, 8 rays]
assert len(moon) == 2 and len(sun) == 10, (len(moon), len(sun))
def radius(c): return max(math.hypot(s[0][0]-C[0], s[0][1]-C[1]) for s in c)
rings = sorted(sun[:2], key=radius, reverse=True)      # [outer r=200, inner r=120]
rays = sun[2:]
moon_sorted = sorted(moon, key=lambda c: max(math.hypot(s[0][0]-C[0], s[0][1]-C[1]) for s in c), reverse=True)
R_OUT, R_IN = radius(rings[0]), radius(rings[1])
print('ring radii', round(R_OUT), round(R_IN), 'moon segs', [len(c) for c in moon_sorted], file=sys.stderr)

FR, OP = 50, 64
def ease(ox=0.33, oy=0, ix=0.2, iy=1):
    return {'o': {'x': [ox], 'y': [oy]}, 'i': {'x': [ix], 'y': [iy]}}
def ease2(ox=0.33, oy=0, ix=0.2, iy=1):
    return {'o': {'x': [ox, ox], 'y': [oy, oy]}, 'i': {'x': [ix, ix], 'y': [iy, iy]}}

def shape(kfs):
    return {'ty': 'sh', 'ks': {'a': 1, 'k': kfs}}

# Body: moon edges -> ring circles (exact at both ends).
MORPH_END = 34
body_paths = []
for edge, r in zip(moon_sorted, [R_OUT, R_IN]):
    end = circle_like(edge, r)
    body_paths.append(shape([
        {'t': 0, 's': [to_lottie(edge)], **ease(0.45, 0, 0.25, 1)},
        {'t': MORPH_END, 's': [to_lottie(end)]},
    ]))
tr_body = {
    'ty': 'tr', 'p': {'a': 0, 'k': list(C)}, 'a': {'a': 0, 'k': list(C)},
    # A little squash while it turns, settling back to exactly 100 %.
    's': {'a': 1, 'k': [
        {'t': 0, 's': [100, 100], **ease2(0.4, 0, 0.6, 1)},
        {'t': 14, 's': [84, 84], **ease2(0.4, 0, 0.3, 1)},
        {'t': 34, 's': [108, 108], **ease2(0.4, 0, 0.3, 1)},
        {'t': 46, 's': [100, 100]},
    ]},
    # The moon turns as it fills out; a ring looks the same at any angle.
    'r': {'a': 1, 'k': [{'t': 0, 's': [0], **ease(0.45, 0, 0.25, 1)}, {'t': MORPH_END, 's': [-90]}]},
    'o': {'a': 0, 'k': 100}, 'sk': {'a': 0, 'k': 0}, 'sa': {'a': 0, 'k': 0},
}
fill = {'ty': 'fl', 'c': {'a': 0, 'k': [1, 1, 1, 1]}, 'o': {'a': 0, 'k': 100}, 'r': 2}
static_tr = lambda: {'ty': 'tr', 'p': {'a': 0, 'k': [0, 0]}, 'a': {'a': 0, 'k': [0, 0]}, 's': {'a': 0, 'k': [100, 100]},
                     'r': {'a': 0, 'k': 0}, 'o': {'a': 0, 'k': 100}, 'sk': {'a': 0, 'k': 0}, 'sa': {'a': 0, 'k': 0}}
body = {'ty': 'gr', 'nm': 'body', 'it': body_paths + [fill, tr_body]}

# Rays: each grows outward from the ring (its outer edge starts on its inner
# edge), clockwise from the top, with a small overshoot, ending exactly on the glyph.
def ray_angle(c): 
    x = sum(s[0][0] for s in c)/len(c) - C[0]; y = sum(s[0][1] for s in c)/len(c) - C[1]
    return (math.degrees(math.atan2(y, x)) + 90) % 360  # 0 = top, clockwise
ray_groups = []
for n, c in enumerate(sorted(rays, key=ray_angle)):
    pts = [s[0] for s in c]
    d = [math.hypot(p[0]-C[0], p[1]-C[1]) for p in pts]
    order = sorted(range(4), key=lambda k: d[k])
    inner = order[:2]
    collapsed = []
    for k, p in enumerate(pts):
        if k in inner: collapsed.append(p)
        else:
            # Move an outer corner onto the nearest inner corner.
            q = min((pts[j] for j in inner), key=lambda q: math.hypot(q[0]-p[0], q[1]-p[1]))
            collapsed.append(q)
    poly = lambda P: {'i': [[0, 0]]*4, 'o': [[0, 0]]*4, 'v': [[round(x, 2), round(y, 2)] for x, y in P], 'c': True}
    start = 30 + n*2
    ray_groups.append({'ty': 'gr', 'nm': f'ray {n+1}', 'it': [
        shape([
            {'t': 0, 's': [poly(collapsed)], 'h': 1},
            {'t': start, 's': [poly(collapsed)], **ease(0.3, 0, 0.35, 1.35)},
            {'t': start + 14, 's': [poly(pts)]},
        ]),
        {'ty': 'fl', 'c': {'a': 0, 'k': [1, 1, 1, 1]}, 'o': {'a': 0, 'k': 100}, 'r': 1},
        static_tr(),
    ]})
last_ray_end = 30 + 7*2 + 14
assert last_ray_end <= OP - 4, last_ray_end

anim = {
    'v': '5.12.1', 'fr': FR, 'ip': 0, 'op': OP, 'w': EM, 'h': EM, 'nm': 'theme toggle (Material dark_mode ⇄ light_mode)',
    'ddd': 0, 'assets': [],
    'layers': [{'ddd': 0, 'ind': 1, 'ty': 4, 'nm': 'icon', 'sr': 1,
                'ks': {'o': {'a': 0, 'k': 100}, 'r': {'a': 0, 'k': 0}, 'p': {'a': 0, 'k': [0, 0, 0]},
                       'a': {'a': 0, 'k': [0, 0, 0]}, 's': {'a': 0, 'k': [100, 100, 100]}},
                'ao': 0, 'shapes': ray_groups + [body], 'ip': 0, 'op': OP, 'st': 0, 'bm': 0}],
}
json.dump(anim, open(OUT, 'w'), separators=(',', ':'))

def svg_d(contour_list):
    f = lambda v: f'{v:.2f}'.rstrip('0').rstrip('.')
    out = []
    for c in contour_list:
        out.append(f'M{f(c[0][0][0])} {f(c[0][0][1])}')
        for p0, c1, c2, p1 in c:
            out.append(f'C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p1[0])} {f(p1[1])}')
        out.append('Z')
    return ''.join(out)

open(PATHS_OUT, 'w').write(f'''// Generated by scripts/lottie/build-theme-toggle.py — do not edit.
/**
 * The theme icons at rest (Material Symbols Outlined dark_mode / light_mode,
 * from the app's icon font) as SVG paths in a 960 × 960 box. They are the
 * first and last frames of theme_toggle.json, so ThemeToggleIcon swaps
 * between them and the animation with no visible change. Fill rule: evenodd.
 */
export const THEME_ICON_VIEWBOX = '0 0 {EM} {EM}'
export const MOON_PATH =
  '{svg_d(moon)}'
export const SUN_PATH =
  '{svg_d(sun)}'
''')
print('frames', OP, 'last ray settles at', last_ray_end, file=sys.stderr)
