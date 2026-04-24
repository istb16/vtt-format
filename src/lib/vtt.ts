interface Cue {
	start: number;
	end: number;
	text: string;
}

function parseTimeToSeconds(t: string): number {
	const parts = t.trim().split(':');
	if (parts.length === 3)
		return +parts[0] * 3600 + +parts[1] * 60 + parseFloat(parts[2]);
	return +parts[0] * 60 + parseFloat(parts[1]);
}

function parseCues(text: string): Cue[] {
	const lines = text.split('\n');
	const cues: Cue[] = [];
	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].match(/^([\d:.]+)\s+-->\s+([\d:.]+)/);
		if (!m) continue;
		const start = parseTimeToSeconds(m[1]);
		const end = parseTimeToSeconds(m[2]);
		const textLines: string[] = [];
		i++;
		while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
			textLines.push(lines[i].trim());
			i++;
		}
		i--;
		const raw = textLines.join(' ').replace(/<[^>]+>/g, '').trim();
		if (raw) cues.push({ start, end, text: raw });
	}
	return cues;
}

// 次のキューが現在のキューで始まる場合（ロールアップ字幕）はスキップ
function removeRollups(cues: Cue[]): Cue[] {
	return cues.filter(
		(cue, i) => i === cues.length - 1 || !cues[i + 1].text.startsWith(cue.text)
	);
}

function hasCJK(text: string): boolean {
	return /[぀-鿿]/.test(text);
}

function joinTexts(a: string, b: string): string {
	if (!a) return b;
	const last = a[a.length - 1];
	return a + (last.charCodeAt(0) < 128 && last !== ' ' ? ' ' : '') + b;
}

function addPeriod(text: string): string {
	const last = text[text.length - 1];
	if ('。！？…」）).!?'.includes(last)) return text;
	return text + (hasCJK(text) ? '。' : '.');
}

const SENTENCE_FINAL_RE = /(でしょうか|ましょうか|ませんか|ですか|でしょう|ましょう|ません|です|ます)$/;

function endsWithSentenceFinal(text: string): boolean {
	return SENTENCE_FINAL_RE.test(text);
}

function formatVtt(text: string, paragraphGapSeconds = 1.5): string {
	const cues = parseCues(text).sort((a, b) => a.start - b.start);
	const cleaned = removeRollups(cues);
	if (cleaned.length === 0) return '';

	const paragraphs: string[] = [];
	let current = '';

	for (let i = 0; i < cleaned.length; i++) {
		current = joinTexts(current, cleaned[i].text);
		const gap = i < cleaned.length - 1 ? cleaned[i + 1].start - cleaned[i].end : Infinity;
		if (gap >= paragraphGapSeconds) {
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
	return normalized.startsWith('WEBVTT') ? formatVtt(normalized) : normalized;
}
