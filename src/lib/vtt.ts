interface Cue {
	start: number;
	end: number;
	text: string;
}

// 浮動小数点誤差でギャップ判定がぶれないよう、整数ミリ秒で扱う
function parseTimeToMs(t: string): number {
	const parts = t.trim().split(':');
	const seconds =
		parts.length === 3
			? +parts[0] * 3600 + +parts[1] * 60 + parseFloat(parts[2])
			: +parts[0] * 60 + parseFloat(parts[1]);
	return Math.round(seconds * 1000);
}

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	lrm: '',
	rlm: ''
};

// タグ除去後に文字参照をデコードする（&lt;b&gt; をタグとして消さないため）
function cleanCueLine(line: string): string {
	return line
		.replace(/<[^>]+>/g, '')
		.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (ref, dec, hex, name) => {
			if (name) {
				const key = name.toLowerCase();
				// &constructor; 等で Object.prototype のプロパティを拾わないよう自前のキーに限定する
				return Object.hasOwn(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key] : ref;
			}
			const code = dec ? +dec : parseInt(hex, 16);
			// NUL・サロゲート・範囲外は不正な文字参照として残す
			const valid = code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff);
			return valid ? String.fromCodePoint(code) : ref;
		})
		.trim();
}

function parseCues(text: string): Cue[] {
	const lines = text.split('\n');
	const cues: Cue[] = [];
	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].match(/^([\d:.]+)\s+-->\s+([\d:.]+)/);
		if (!m) continue;
		const start = parseTimeToMs(m[1]);
		const end = parseTimeToMs(m[2]);
		const textLines: string[] = [];
		i++;
		while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
			const line = cleanCueLine(lines[i]);
			if (line) textLines.push(line);
			i++;
		}
		i--;
		// キュー内の改行もキュー間と同じ規則で結合する（CJK 同士には空白を入れない）
		const raw = textLines.reduce(joinTexts, '');
		if (raw) cues.push({ start, end, text: raw });
	}
	return cues;
}

const CJK_CHAR_RE = /[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}\u3000-\u303f\uff00-\uffef]/u;

const WORD_CHAR_RE = /[\p{L}\p{N}_]/u;
// 単語間に空白を入れない文字体系（タイ・ラオ・クメール・ミャンマー）
const UNSPACED_SCRIPT_RE = /[\p{scx=Thai}\p{scx=Lao}\p{scx=Khmer}\p{scx=Myanmar}]/u;

// サロゲートペア（𠮷 や絵文字など）を分断せずに先頭・末尾の 1 文字を取り出す
function charAt(text: string, index: number): string | undefined {
	const cp = text.codePointAt(index);
	return cp === undefined ? undefined : String.fromCodePoint(cp);
}

function lastChar(text: string): string {
	return Array.from(text.slice(-2)).pop() ?? '';
}

// 空白で単語を区切る言語の文字か（ラテン・キリル・ハングル等の英数字。日中・タイ等の文字は除く）
function isSpacedWordChar(ch: string): boolean {
	return WORD_CHAR_RE.test(ch) && !CJK_CHAR_RE.test(ch) && !UNSPACED_SCRIPT_RE.test(ch);
}

// 次のキューが現在のキューで始まる場合（ロールアップ字幕）
// ただし単語の途中で一致しただけ（"No" → "Nobody"）は除く
function isRolledUpInto(cur: string, next: string): boolean {
	if (!next.startsWith(cur)) return false;
	const following = charAt(next, cur.length);
	return (
		following === undefined || !isSpacedWordChar(lastChar(cur)) || !isSpacedWordChar(following)
	);
}

function removeRollups(cues: Cue[]): Cue[] {
	return cues.filter(
		(cue, i) => i === cues.length - 1 || !isRolledUpInto(cue.text, cues[i + 1].text)
	);
}

function hasCJK(text: string): boolean {
	return CJK_CHAR_RE.test(text);
}

function joinTexts(a: string, b: string): string {
	if (!a) return b;
	const last = lastChar(a);
	// 「…」「”」「—」等の非ASCII記号の後も、次が日中の文字でなければ空白で区切る
	const needsSpace =
		!/\s/.test(last) &&
		!CJK_CHAR_RE.test(last) &&
		(last.charCodeAt(0) < 128 || isSpacedWordChar(last) || !CJK_CHAR_RE.test(charAt(b, 0) ?? ''));
	return a + (needsSpace ? ' ' : '') + b;
}

function addPeriod(text: string): string {
	const last = lastChar(text);
	if ('。！？…」』）)】"”.!?'.includes(last)) return text;
	return text + (hasCJK(text) ? '。' : '.');
}

const SENTENCE_FINAL_RE =
	/(でしょうか|ましょうか|ませんか|ですか|でしょう|ましょう|ません|です|ます)$/;

function endsWithSentenceFinal(text: string): boolean {
	return SENTENCE_FINAL_RE.test(text);
}

function formatVtt(text: string, paragraphGapMs = 1500): string {
	const cues = parseCues(text).sort((a, b) => a.start - b.start);
	const cleaned = removeRollups(cues);
	if (cleaned.length === 0) return '';

	const paragraphs: string[] = [];
	let current = '';

	for (let i = 0; i < cleaned.length; i++) {
		current = joinTexts(current, cleaned[i].text);
		const gap = i < cleaned.length - 1 ? cleaned[i + 1].start - cleaned[i].end : Infinity;
		if (gap >= paragraphGapMs) {
			paragraphs.push(addPeriod(current));
			current = '';
		} else if (endsWithSentenceFinal(cleaned[i].text)) {
			current += '。';
		}
	}

	return paragraphs.join('\n\n');
}

export function convert(text: string): string {
	const normalized = text.replace(/(\r\n|\n\r|\n|\r)/g, '\n');
	// 先頭の BOM・空白・空行は許容する（\s は U+FEFF も含む）
	return /^\s*WEBVTT(?=[ \t\n]|$)/.test(normalized) ? formatVtt(normalized) : normalized;
}
