#!/usr/bin/env python3
"""
Builds the bundled kanji course data (N5, N4) from open sources.

Inputs (download them yourself; none are committed):
  --db       jamdict.db: KANJIDIC2 + JMdict in SQLite, from the `jamdict-data`
             PyPI package (pip download --no-deps jamdict-data; unxz jamdict.db.xz).
  --levels   kanji.json from github.com/davidluzgouveia/kanji-data (the
             `jlpt_new` field gives the N5–N1 lists).
  --kanjivg  folder of KanjiVG SVGs named <codepoint>.svg
             (raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/<cp>.svg).

Authored inputs (committed): scripts/kanji/authored/<level>.json holds units,
groups, memory hints and look-alikes.

Outputs:
  src/lib/content/kanji/generated/<level>.index.json   (KanjiLevelIndex)
  src/lib/content/kanji/generated/<level>.detail.json  (KanjiLevelDetail)
  public/kanji-data/v1/strokes/<codepoint>.json        (KanjiStrokeData)

Licences: KANJIDIC2 and JMdict (EDRDG, CC BY-SA 4.0); KanjiVG (CC BY-SA 3.0).
The generated files are derived works under the same licences.

Run from the repo root:
  python3 -I scripts/kanji/build.py --db … --levels … --kanjivg …
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AUTHORED = ROOT / 'scripts' / 'kanji' / 'authored'
GEN = ROOT / 'src' / 'lib' / 'content' / 'kanji' / 'generated'
STROKES = ROOT / 'public' / 'kanji-data' / 'v1' / 'strokes'

LEVELS = ['n5', 'n4']
LEVEL_NUM = {'n5': 5, 'n4': 4, 'n3': 3, 'n2': 2, 'n1': 1}
KVG = '{http://kanjivg.tagaini.net}'
MAX_VOCAB = 5
MAX_WORD_LEN = 4

# English names for radical forms that are not kanji themselves (or whose
# KANJIDIC meaning reads oddly as a part name).
PART_NAMES = {
    '亻': 'person', '人': 'person', '𠆢': 'roof (person)', '儿': 'legs', '冂': 'frame', '冖': 'cover',
    '氵': 'water', '水': 'water', '扌': 'hand', '手': 'hand', '艹': 'grass', '宀': 'roof',
    '辶': 'road', '⻌': 'road', '廴': 'long stride', '彳': 'step', '忄': 'heart', '心': 'heart',
    '纟': 'thread', '糸': 'thread', '訁': 'words', '言': 'words', '口': 'mouth', '囗': 'enclosure',
    '亠': 'lid', '丷': 'horns', '八': 'eight', '刂': 'knife', '刀': 'knife', '力': 'power',
    '阝': 'hill / village', '⻖': 'hill', '⻏': 'village', '月': 'moon / flesh', '日': 'sun', '木': 'tree',
    '火': 'fire', '灬': 'fire', '土': 'earth', '士': 'samurai', '女': 'woman', '子': 'child',
    '小': 'small', '⺌': 'small', '大': 'big', '尸': 'corpse', '广': 'cliff house', '厂': 'cliff',
    '疒': 'sickness', '禾': 'grain', '竹': 'bamboo', '⺮': 'bamboo', '米': 'rice', '目': 'eye',
    '田': 'rice field', '貝': 'shell / money', '見': 'see', '車': 'vehicle', '金': 'gold', '釒': 'gold',
    '食': 'food', '飠': 'food', '馬': 'horse', '鳥': 'bird', '魚': 'fish', '雨': 'rain',
    '門': 'gate', '耳': 'ear', '止': 'stop', '足': 'foot', '⻊': 'foot', '走': 'run', '王': 'king',
    '玉': 'jewel', '石': 'stone', '示': 'altar', '礻': 'altar', '衣': 'clothing', '衤': 'clothing',
    '犭': 'dog', '犬': 'dog', '牛': 'cow', '牜': 'cow', '羊': 'sheep', '⺶': 'sheep', '寸': 'inch',
    '工': 'craft', '弓': 'bow', '彡': 'hair', '夂': 'winter', '夊': 'go slowly', '夕': 'evening',
    '攵': 'strike', '攴': 'strike', '欠': 'yawn', '殳': 'weapon', '斤': 'axe', '方': 'direction',
    '戸': 'door', '户': 'door', '巾': 'cloth', '幺': 'thread', '又': 'again', '厶': 'private', '匕': 'spoon',
    '十': 'ten', '一': 'one', '二': 'two', '丶': 'dot', '丿': 'slash', '乙': 'second', '亅': 'hook',
    '几': 'table', '凵': 'open box', '勹': 'wrap', '匚': 'box', '卜': 'divination', '卩': 'seal',
    '⺈': 'knife', '自': 'self', '白': 'white', '立': 'stand', '矢': 'arrow', '生': 'life',
    '用': 'use', '皿': 'dish', '而': 'beard', '耂': 'old', '老': 'old', '肉': 'meat', '臣': 'retainer',
    '舌': 'tongue', '色': 'colour', '虫': 'insect', '西': 'west', '覀': 'west', '酉': 'sake jar',
    '里': 'village', '長': 'long', '青': 'blue', '非': 'wrong', '面': 'face', '音': 'sound',
    '頁': 'head', '風': 'wind', '首': 'neck', '高': 'tall', '黒': 'black', '歯': 'tooth',
    '山': 'mountain', '川': 'river', '巛': 'river', '中': 'middle', '上': 'up', '下': 'down',
    '入': 'enter', '出': 'exit', '千': 'thousand', '万': 'ten thousand', '冫': 'ice', '己': 'self',
    '干': 'dry', '弋': 'ceremony', '戈': 'halberd', '支': 'branch', '文': 'writing', '斗': 'dipper',
    '无': 'not', '比': 'compare', '毛': 'fur', '氏': 'clan', '气': 'steam', '爪': 'claw', '父': 'father',
    '片': 'one-sided', '瓦': 'tile', '甘': 'sweet', '疋': 'bolt of cloth', '癶': 'footsteps',
    '穴': 'hole', '缶': 'can', '网': 'net', '罒': 'net', '羽': 'feather', '聿': 'brush', '至': 'arrive',
    '臼': 'mortar', '舟': 'boat', '艮': 'stopping', '行': 'go', '角': 'horn', '谷': 'valley',
    '豆': 'bean', '豕': 'pig', '赤': 'red', '身': 'body', '辛': 'bitter', '辰': 'dragon',
    '隹': 'small bird', '革': 'leather', '韋': 'tanned leather', '香': 'fragrance', '骨': 'bone',
    '鬼': 'demon', '麦': 'wheat', '黄': 'yellow', '齒': 'tooth', '龍': 'dragon', '亀': 'turtle',
    '今': 'now', '会': 'meet', '曰': 'say', '旡': 'choke', '夫': 'husband', '天': 'heaven',
    '太': 'fat', '少': 'few', '尚': 'esteem', '⺍': 'small', '主': 'master', '丁': 'street',
    '元': 'origin', '兄': 'older brother', '光': 'light', '先': 'ahead', '古': 'old', '可': 'can',
    '台': 'stand', '各': 'each', '合': 'fit', '同': 'same', '名': 'name', '向': 'face toward',
    '寺': 'temple', '者': 'person', '各': 'each', '吾': 'I', '早': 'early', '昔': 'long ago',
    '東': 'east', '果': 'fruit', '未': 'not yet', '末': 'end', '本': 'book / origin', '朱': 'vermilion',
    '束': 'bundle', '豊': 'abundant', '良': 'good', '其': 'that', '甲': 'armour', '申': 'say',
    '由': 'reason', '番': 'number', '我': 'I', '共': 'together', '五': 'five', '口': 'mouth',
    '肖': 'resemble', '今': 'now', '令': 'order', '寸': 'inch', '戊': 'halberd', '丂': 'breath',
    '于': 'go', '亼': 'gather', '乚': 'hook', '丨': 'line', '𠂉': 'gun', '㇒': 'slash',
}

KATAKANA = re.compile(r'[ァ-ヶ]')


def to_hira(s: str) -> str:
    return ''.join(chr(ord(c) - 0x60) if 0x30A1 <= ord(c) <= 0x30F6 else c for c in s)


RENDAKU = {
    'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご', 'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ',
    'そ': 'ぞ', 'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど', 'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ',
    'へ': 'べ', 'ほ': 'ぼ',
}
HANDAKU = {'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ'}


def variants(r: str) -> set[str]:
    """A reading plus its sound changes inside words: rendaku, handakuten, sokuon."""
    out = {r}
    if r and r[0] in RENDAKU:
        out.add(RENDAKU[r[0]] + r[1:])
    if r and r[0] in HANDAKU:
        out.add(HANDAKU[r[0]] + r[1:])
    for v in list(out):
        if len(v) >= 2 and v[-1] in 'つちくき':
            out.add(v[:-1] + 'っ')
    if r in ('じ', 'ぢ'):
        out.add('じ')
    if r.endswith('ぢ'):
        out.add(r[:-1] + 'じ')
    if r.endswith('づ'):
        out.add(r[:-1] + 'ず')
    return out


class Dict:
    def __init__(self, db: Path):
        self.c = sqlite3.connect(db)
        self._kd: dict[str, dict | None] = {}

    def kanji(self, ch: str) -> dict | None:
        if ch in self._kd:
            return self._kd[ch]
        row = self.c.execute('select ID, stroke_count, grade, freq from character where literal=?', (ch,)).fetchone()
        if not row:
            self._kd[ch] = None
            return None
        cid, strokes, grade, freq = row
        on, kun, meanings = [], [], []
        for (gid,) in self.c.execute('select ID from rm_group where cid=?', (cid,)):
            for r_type, value in self.c.execute('select r_type, value from reading where gid=?', (gid,)):
                if r_type == 'ja_on' and value not in on:
                    on.append(value)
                elif r_type == 'ja_kun' and value not in kun:
                    kun.append(value)
            for (m,) in self.c.execute(
                "select value from meaning where gid=? and (m_lang='' or m_lang is null or m_lang='en')", (gid,)
            ):
                meanings.append(m)
        info = {
            'strokes': strokes,
            'grade': int(grade) if grade else None,
            'freq': int(freq) if freq else None,
            'on': on,
            'kun': kun,
            'meanings': meanings,
        }
        self._kd[ch] = info
        return info

    def readings_for_segmenting(self, ch: str) -> list[tuple[str, str, str]]:
        """(surface variant, reading type, base reading) for each way `ch` can be read in a word."""
        info = self.kanji(ch)
        if not info:
            return []
        out: list[tuple[str, str, str]] = []
        for o in info['on']:
            for v in variants(to_hira(o)):
                out.append((v, 'on', o))
        for k in info['kun']:
            stem = k.strip('-').split('.')[0]
            base = stem
            for v in variants(stem):
                out.append((v, 'kun', base))
        return out

    def words_with(self, ch: str) -> list[dict]:
        rows = self.c.execute(
            """
            select k.idseq, k.ID, k.text, group_concat(p.text, ' ')
            from Kanji k left join KJP p on p.kid = k.ID
            where k.text like ? group by k.ID
            """,
            (f'%{ch}%',),
        ).fetchall()
        words = []
        for idseq, kid, text, pri in rows:
            pri = (pri or '').split()
            if not any(p in ('ichi1', 'news1', 'spec1', 'spec2', 'ichi2', 'news2') for p in pri):
                continue
            if len(text) > MAX_WORD_LEN:
                continue
            reading = self.reading_for(idseq, text)
            gloss = self.gloss_for(idseq)
            if not reading or not gloss:
                continue
            nf = min([int(p[2:]) for p in pri if p.startswith('nf')] or [60])
            score = nf - (12 if 'ichi1' in pri else 0) - (8 if 'spec1' in pri else 0) - (4 if 'news1' in pri else 0)
            words.append({'word': text, 'reading': reading, 'meaning': gloss, 'score': score, 'ichi': 'ichi1' in pri})
        return words

    def reading_for(self, idseq: int, text: str) -> str | None:
        for kid, kana, nokanji in self.c.execute('select ID, text, nokanji from Kana where idseq=? order by ID', (idseq,)):
            if nokanji:
                continue
            restr = [r for (r,) in self.c.execute('select text from KNR where kid=?', (kid,))]
            if restr and text not in restr:
                continue
            return kana
        return None

    def gloss_for(self, idseq: int) -> str | None:
        for (sid,) in self.c.execute('select ID from Sense where idseq=? order by ID', (idseq,)):
            misc = [m for (m,) in self.c.execute('select text from misc where sid=?', (sid,))]
            if any('archaism' in m or 'obsolete' in m for m in misc):
                continue
            glosses = [
                g for (g,) in self.c.execute(
                    "select text from SenseGloss where sid=? and (lang='' or lang is null or lang='eng') order by rowid", (sid,)
                )
            ]
            if glosses:
                return '; '.join(glosses)
        return None


def is_kanji(ch: str) -> bool:
    return '\u4e00' <= ch <= '\u9fff' or ch == '々'


def segment(d: Dict, word: str, reading: str, target: str) -> tuple[str, str] | None:
    """Splits `reading` across the characters of `word`; returns how `target` is read (type, base reading)."""
    chars = list(word)
    reading = to_hira(reading)

    def go(i: int, pos: int) -> list[tuple[str, str, str]] | None:
        if i == len(chars):
            return [] if pos == len(reading) else None
        ch = chars[i]
        if not is_kanji(ch):
            h = to_hira(ch)
            return go(i + 1, pos + len(h)) if reading.startswith(h, pos) else None
        source = chars[i - 1] if ch == '々' and i else ch
        for surface, rtype, base in sorted(d.readings_for_segmenting(source), key=lambda c: -len(c[0])):
            if surface and reading.startswith(surface, pos):
                rest = go(i + 1, pos + len(surface))
                if rest is not None:
                    return [(ch, rtype, base)] + rest
        return None

    split = go(0, 0)
    if split is None:
        return None
    return next(((t, b) for c, t, b in split if c == target), None)


def parse_kun(k: str) -> dict:
    out: dict = {}
    affix = None
    if k.startswith('-'):
        affix = 'suffix'
        k = k[1:]
    if k.endswith('-'):
        affix = 'prefix'
        k = k[:-1]
    stem, _, oku = k.partition('.')
    out['kana'] = stem
    if oku:
        out['okurigana'] = oku
    if affix:
        out['affix'] = affix
    return out


def parse_kanjivg(path: Path) -> tuple[dict, list[str]]:
    """Stroke data for the course, plus the kanji's top-level part characters."""
    tree = ET.parse(path)
    root = tree.getroot()
    ns = {'s': 'http://www.w3.org/2000/svg'}
    paths_group = next(g for g in root.iter('{http://www.w3.org/2000/svg}g') if g.get('id', '').startswith('kvg:StrokePaths'))
    strokes = [p.get('d') for p in paths_group.iter('{http://www.w3.org/2000/svg}path')]
    numbers_group = next(g for g in root.iter('{http://www.w3.org/2000/svg}g') if g.get('id', '').startswith('kvg:StrokeNumbers'))
    numbers = []
    for t in numbers_group.iter('{http://www.w3.org/2000/svg}text'):
        m = re.search(r'matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)', t.get('transform', ''))
        numbers.append([float(m.group(1)), float(m.group(2))] if m else [0, 0])

    # The kanji's own group, then its children that name an element.
    top = next(iter(paths_group.findall('s:g', ns)), None)
    parts: list[str] = []
    groups: list[dict] = []
    index = {id(p): i for i, p in enumerate(paths_group.iter('{http://www.w3.org/2000/svg}path'))}

    def element_of(g) -> str | None:
        return g.get(KVG + 'element') or g.get('{https://kanjivg.tagaini.net/}element')

    def original_of(g) -> str | None:
        return g.get(KVG + 'original') or g.get('{https://kanjivg.tagaini.net/}original')

    if top is not None:
        for child in top.findall('s:g', ns):
            el = element_of(child)
            if not el:
                # Unnamed wrapper: look one level down.
                for sub in child.findall('s:g', ns):
                    sel = element_of(sub)
                    if sel and sel not in parts:
                        parts.append(sel)
                continue
            if el not in parts:
                parts.append(el)
            ps = list(child.iter('{http://www.w3.org/2000/svg}path'))
            if ps:
                groups.append({'element': el, 'from': index[id(ps[0])], 'to': index[id(ps[-1])] + 1})
    data: dict = {'strokes': strokes, 'numbers': numbers}
    if groups:
        data['groups'] = groups
    return data, parts


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--db', required=True, type=Path)
    ap.add_argument('--levels', required=True, type=Path)
    ap.add_argument('--kanjivg', required=True, type=Path)
    args = ap.parse_args()

    d = Dict(args.db)
    level_data = json.loads(args.levels.read_text(encoding='utf-8'))
    level_of = {k: v['jlpt_new'] for k, v in level_data.items() if v.get('jlpt_new')}
    STROKES.mkdir(parents=True, exist_ok=True)
    GEN.mkdir(parents=True, exist_ok=True)

    for level in LEVELS:
        authored = json.loads((AUTHORED / f'{level}.json').read_text(encoding='utf-8'))
        expected = {k for k, n in level_of.items() if n == LEVEL_NUM[level]}
        taught = [k for u in authored['units'] for k in u['kanji']]
        dupes = {k for k in taught if taught.count(k) > 1}
        if dupes or set(taught) != expected:
            sys.exit(f'{level}: units do not cover the list. dupes={dupes} missing={expected - set(taught)} extra={set(taught) - expected}')
        unit_ids = [u['id'] for u in authored['units']]
        grouped = [u for g in authored['groups'] for u in g['unitIds']]
        if sorted(grouped) != sorted(unit_ids):
            sys.exit(f'{level}: groups do not cover the units')

        # Words may use kanji from this level and easier ones.
        allowed = {k for k, n in level_of.items() if n >= LEVEL_NUM[level]}
        mnemonics = authored.get('mnemonics', {})
        look_alikes = authored.get('lookAlikes', {})
        tips = authored.get('readingTips', {})
        keys = authored.get('keys', {})
        vocab_overrides = authored.get('vocab', {})
        main_meanings = authored.get('meanings', {})

        entries = []
        seen_parts: set[str] = set()
        units_out = []
        for unit in authored['units']:
            new_parts = []
            for ch in unit['kanji']:
                info = d.kanji(ch)
                if not info:
                    sys.exit(f'no KANJIDIC entry for {ch}')
                cp = f'{ord(ch):05x}'
                strokes, part_chars = parse_kanjivg(args.kanjivg / f'{cp}.svg')
                (STROKES / f'{cp}.json').write_text(json.dumps(strokes, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

                parts = []
                for p in part_chars or [ch]:
                    name = PART_NAMES.get(p)
                    if not name:
                        pinfo = d.kanji(p)
                        name = pinfo['meanings'][0] if pinfo and pinfo['meanings'] else None
                    if name:
                        parts.append({'char': p, 'name': name})
                if not parts:
                    parts = [{'char': ch, 'name': info['meanings'][0]}]
                for p in parts:
                    if p['char'] not in seen_parts:
                        seen_parts.add(p['char'])
                        new_parts.append(p['char'])

                key_kana = keys.get(ch)
                vocab = pick_vocab(d, ch, allowed, level_of, vocab_overrides.get(ch), key_kana)
                if not vocab:
                    sys.exit(f'no vocab for {ch}')
                key = choose_key(vocab, key_kana)
                for v in vocab:
                    v.pop('use', None)

                entry = {
                    'char': ch,
                    'jlpt': level,
                    'unitId': unit['id'],
                    'meanings': main_meaning(info['meanings'], main_meanings.get(ch)),
                    'on': info['on'],
                    'kun': [parse_kun(k) for k in info['kun']],
                    'keyReading': key,
                    'parts': parts,
                    'vocab': vocab,
                    'strokes': len(strokes['strokes']),
                }
                if ch in tips:
                    entry['readingTip'] = tips[ch]
                if info['grade']:
                    entry['grade'] = info['grade']
                if info['freq']:
                    entry['freq'] = info['freq']
                if ch in mnemonics:
                    entry['mnemonic'] = {'text': mnemonics[ch], 'draft': True}
                if ch in look_alikes:
                    entry['lookAlikes'] = look_alikes[ch]
                entries.append(entry)
            out_unit = {k: unit[k] for k in ('id', 'title', 'summary', 'kanji')}
            if new_parts:
                out_unit['newParts'] = new_parts
            units_out.append(out_unit)

        detail = {'level': level, 'entries': entries}
        index = {'level': level, 'units': units_out, 'groups': authored['groups'], 'rows': [index_row(e) for e in entries]}
        (GEN / f'{level}.detail.json').write_text(json.dumps(detail, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        (GEN / f'{level}.index.json').write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        print(f'{level}: {len(entries)} kanji, {len(units_out)} units')


# Common in newspapers but wrong for a beginner course (adult, niche or dated).
DROP_WORDS = {
    '売春', '金子', '本木', '大山', '右四つ', '左四つ', '西ドイツ', '白バイ', '四六時中', '兄弟子', '午', '赤飯',
    '休する', '本の', '白書', '本書', '外電', '名目', '目下', '一千', '来', '毎', '何十', '何千', '小学', '下火',
    '山川', '四川', '黒海', '今夏', '今秋', '今春', '来春', '父子', '兄姉', '弟妹', '長兄', '族', '食', '行',
    '右中間', '左前', '円み', '一体', '肉親', '黒人', '白人', '夏場', '冬場', '秋口', '私学', '私有',
    '白水', '水木', '国電', '千万', '聞かす', '聞き書き', '毎に', '出生', '小話', 'お話し中', '白日', '一時金',
    '時半', '読本', '西南', '火の気', '白木', '日ソ', '土のう', '大それた', '先だって', '前もって', '白子', '白む',
    '西北', '木本', '火の車', '見聞', '見聞き', '一行', '日:にち', '高:たか', '着:ちゃく', '住:じゅう', '計:けい',
    '正:せい', '歩:ほ', '字:あざ', '早:はや', '切り', '持ち', '借り', '貸し', '通り:どおり', '出:で', '読み', '行き',
    '長さ', '高さ', '強さ', '重さ', '思い', '考え', '楽しみ', '帰り', '上田', '国家試験', '日本銀行', '土建屋', '私文書', '実姉', '実妹',
}
DROP_GLOSS = ('sumo', 'zodiac', 'prostitut', 'surname', 'Buddhis', 'archaic')


def clean_gloss(text: str) -> str:
    """Drops parenthetical notes ("(esp. …)", "(Bos taurus)") and keeps whole glosses."""
    while re.search(r'\([^()]*\)', text):
        text = re.sub(r'\s*\([^()]*\)', '', text)
    text = text.replace('(', '').replace(')', '')
    parts = [g.strip() for g in text.split('; ')]
    parts = [p for p in parts if p]
    out = parts[0] if parts else text
    if len(parts) > 1 and len(out) + len(parts[1]) + 2 <= 40:
        out = f'{out}; {parts[1]}'
    return out


def pick_vocab(
    d: Dict, ch: str, allowed: set[str], level_of: dict[str, int], forced: list[str] | None, key_kana: str | None
) -> list[dict]:
    def usable(word: str, pool: set[str]) -> bool:
        return all(not is_kanji(c) or c in pool for c in word)

    words = d.words_with(ch)
    for w in words:
        w['use'] = segment(d, w['word'], w['reading'], ch)
        w['meaning'] = clean_gloss(w['meaning'])
    by_word = {w['word']: w for w in words}
    if forced:
        missing = [f for f in forced if f not in by_word or not by_word[f]['use']]
        if missing:
            sys.exit(f'{ch}: authored vocab not found or not segmentable: {missing}')
        chosen = [by_word[f] for f in forced]
    else:
        words = [
            w for w in words
            if w['use'] and w['word'] not in DROP_WORDS and f"{w['word']}:{w['reading']}" not in DROP_WORDS
            and not w['meaning'].startswith('-')
            and not any(g in w['meaning'] for g in DROP_GLOSS)
        ]
        # Prefer words written only with kanji the learner meets by this level, then N3, then anything.
        tiers = [allowed, {k for k, n in level_of.items() if n >= 3}, None]
        chosen = []
        for pool in tiers:
            cands = sorted((w for w in words if pool is None or usable(w['word'], pool)), key=lambda w: (w['score'], len(w['word'])))
            for w in cands:
                if len(chosen) >= MAX_VOCAB:
                    break
                if all(c['word'] != w['word'] for c in chosen):
                    chosen.append(w)
            if len(chosen) >= 3:
                break
        # The key word: the kanji on its own (or with okurigana) when that word
        # carries the key reading, else the best-ranked carrier.
        if key_kana:
            carriers = sorted((w for w in words if to_hira(w['use'][1]) == to_hira(key_kana)), key=lambda w: w['score'])
            simple = next((w for w in carriers if w['word'] == ch), None) or next(
                (
                    w for w in sorted(carriers, key=lambda w: (len(w['word']), w['score']))
                    if w['ichi'] and w['word'][0] == ch and re.fullmatch(r'[ぁ-ゖ]{1,3}', w['word'][1:])
                ),
                None,
            )
            carrier = simple or next((w for w in chosen if to_hira(w['use'][1]) == to_hira(key_kana)), None) or (carriers[0] if carriers else None)
            if not carrier:
                sys.exit(f'{ch}: no word carries the key reading {key_kana}')
            chosen = [carrier] + [w for w in chosen if w['word'] != carrier['word']][: MAX_VOCAB - 1]
    return [{'word': w['word'], 'reading': w['reading'], 'meaning': w['meaning'], 'use': w['use']} for w in chosen]


def choose_key(vocab: list[dict], key_kana: str | None) -> dict:
    if key_kana:
        rtype = 'on' if KATAKANA.match(key_kana) else 'kun'
        base = key_kana
    else:
        counts: dict[tuple[str, str], int] = {}
        for i, v in enumerate(vocab):
            counts[v['use']] = counts.get(v['use'], 0) + (MAX_VOCAB - i)
        (rtype, base), _ = max(counts.items(), key=lambda kv: (kv[1], kv[0][0] == 'on'))
    key_i = next(i for i, v in enumerate(vocab) if to_hira(v['use'][1]) == to_hira(base))
    key_word = vocab.pop(key_i)
    key_word['isKey'] = True
    vocab.insert(0, key_word)
    return {'type': rtype, 'kana': base}


def main_meaning(meanings: list[str], main: str | None) -> list[str]:
    """KANJIDIC's first meaning, unless the authored file names a clearer one for learners."""
    if not main:
        return meanings or ['?']
    return [main] + [m for m in meanings if m.lower() != main.lower()]


def index_row(e: dict) -> dict:
    meanings = list(dict.fromkeys(e['meanings'] + e.get('synonyms', [])))
    readings = list(dict.fromkeys(e['on'] + [k['kana'] for k in e['kun']]))
    row = {
        'char': e['char'],
        'level': e['jlpt'],
        'unitId': e['unitId'],
        'meaning': e['meanings'][0],
        'meanings': meanings,
        'keyReading': e['keyReading']['kana'],
        'readings': readings,
        'parts': [p['char'] for p in e['parts']],
        'strokes': e['strokes'],
    }
    if 'freq' in e:
        row['freq'] = e['freq']
    return row


if __name__ == '__main__':
    main()
