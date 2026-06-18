import { describe, it, expect } from 'vitest';
import { convert } from './vtt.js';

/** VTT本文を WEBVTT ヘッダー付きに包む */
const vtt = (body: string) => `WEBVTT\n\n${body}`;

describe('convert', () => {
	// ─── 非VTTパススルー ───────────────────────────────────────────
	describe('非VTTテキストのパススルー', () => {
		it('空文字はそのまま返す', () => {
			expect(convert('')).toBe('');
		});

		it('WEBVTTで始まらないテキストはそのまま返す', () => {
			expect(convert('Hello world')).toBe('Hello world');
		});

		it('非VTTのCRLFをLFに正規化する', () => {
			expect(convert('Hello\r\nworld')).toBe('Hello\nworld');
		});

		it('非VTTのCRをLFに正規化する', () => {
			expect(convert('Hello\rworld')).toBe('Hello\nworld');
		});
	});

	// ─── 空VTT ────────────────────────────────────────────────────
	describe('有効なキューがないVTT', () => {
		it('ヘッダーのみのVTTは空文字を返す', () => {
			expect(convert('WEBVTT\n\n')).toBe('');
		});

		it('HTMLタグのみのキューは空文字を返す', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:02.000\n<b></b>'))).toBe('');
		});
	});

	// ─── 基本パース ───────────────────────────────────────────────
	describe('基本的なキューパース', () => {
		it('キューテキストを抽出する', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nHello world'))).toBe('Hello world.');
		});

		it('HTMLタグを除去する', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\n<b>Bold</b> <i>italic</i>'))).toBe(
				'Bold italic.'
			);
		});

		it('複数行のキューテキストをスペースで結合する', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nHello\nworld'))).toBe('Hello world.');
		});

		it('VTTのCRLF入力を処理する', () => {
			expect(convert('WEBVTT\r\n\r\n00:00:01.000 --> 00:00:03.000\r\nHello')).toBe('Hello.');
		});

		it('時間形式（HH:MM:SS）のタイムスタンプを解析する', () => {
			expect(convert(vtt('01:00:01.000 --> 01:00:03.000\nLate'))).toBe('Late.');
		});

		it('開始時刻でキューをソートする', () => {
			const input = vtt(
				'00:00:03.000 --> 00:00:05.000\nSecond\n\n00:00:01.000 --> 00:00:02.000\nFirst'
			);
			expect(convert(input)).toBe('First Second.');
		});
	});

	// ─── 句読点補完 ───────────────────────────────────────────────
	describe('段落末尾の句読点補完', () => {
		it('ASCII テキストに . を追加する', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nHello'))).toBe('Hello.');
		});

		it('CJK テキストに 。を追加する', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nこんにちは'))).toBe('こんにちは。');
		});

		it('末尾が 。 の場合は追加しない', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nこんにちは。'))).toBe('こんにちは。');
		});

		it('末尾が ! の場合は追加しない', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nHello!'))).toBe('Hello!');
		});

		it('末尾が ? の場合は追加しない', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nReally?'))).toBe('Really?');
		});

		it('末尾が ！ の場合は追加しない', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nすごい！'))).toBe('すごい！');
		});

		it('末尾が ？ の場合は追加しない', () => {
			expect(convert(vtt('00:00:01.000 --> 00:00:03.000\nそうですか？'))).toBe('そうですか？');
		});
	});

	// ─── ロールアップ字幕の除去 ───────────────────────────────────
	describe('ロールアップ字幕の除去', () => {
		it('次のキューが現在のキューで始まる場合は除去する', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nHello\n\n00:00:02.000 --> 00:00:04.000\nHello world'
			);
			expect(convert(input)).toBe('Hello world.');
		});

		it('連続するロールアップキューを複数除去する', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nA\n\n' +
					'00:00:02.000 --> 00:00:03.000\nA B\n\n' +
					'00:00:03.000 --> 00:00:05.000\nA B C'
			);
			expect(convert(input)).toBe('A B C.');
		});

		it('次のキューが現在のキューで始まらない場合は残す', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nHello\n\n00:00:02.000 --> 00:00:04.000\nWorld'
			);
			expect(convert(input)).toBe('Hello World.');
		});
	});

	// ─── 段落分け ─────────────────────────────────────────────────
	describe('1.5秒以上のギャップで段落分け', () => {
		it('1.5秒以上のギャップで段落を分ける', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nFirst\n\n00:00:04.000 --> 00:00:06.000\nSecond'
			);
			expect(convert(input)).toBe('First.\n\nSecond.');
		});

		it('1.5秒未満のギャップでは同じ段落にまとめる', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nFirst\n\n00:00:03.000 --> 00:00:05.000\nSecond'
			);
			expect(convert(input)).toBe('First Second.');
		});

		it('ちょうど1.5秒のギャップで段落を分ける', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nFirst\n\n00:00:03.500 --> 00:00:05.000\nSecond'
			);
			expect(convert(input)).toBe('First.\n\nSecond.');
		});

		it('1.5秒未満（1.499秒）のギャップでは同じ段落にまとめる', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nFirst\n\n00:00:03.499 --> 00:00:05.000\nSecond'
			);
			expect(convert(input)).toBe('First Second.');
		});

		it('3つ以上の段落を生成する', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nFirst\n\n' +
					'00:00:05.000 --> 00:00:06.000\nSecond\n\n' +
					'00:00:10.000 --> 00:00:11.000\nThird'
			);
			expect(convert(input)).toBe('First.\n\nSecond.\n\nThird.');
		});
	});

	// ─── 丁寧語文末への句点補完 ───────────────────────────────────
	describe('丁寧語文末への句点補完（段落内）', () => {
		it('ます で終わるキューの後に 。 を挿入する', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nよくわかります\n\n' +
					'00:00:02.500 --> 00:00:04.000\n次に進みます'
			);
			expect(convert(input)).toBe('よくわかります。次に進みます。');
		});

		it('です で終わるキューの後に 。 を挿入する', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nそうです\n\n' +
					'00:00:02.500 --> 00:00:04.000\nよかったです'
			);
			expect(convert(input)).toBe('そうです。よかったです。');
		});

		it('でしょうか で終わるキューの後に 。 を挿入する', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nどうでしょうか\n\n' +
					'00:00:02.500 --> 00:00:04.000\nよいと思います'
			);
			expect(convert(input)).toBe('どうでしょうか。よいと思います。');
		});

		it('丁寧語文末でないキューには段落内で 。 を挿入しない', () => {
			const input = vtt(
				'00:00:01.000 --> 00:00:02.000\nこんにちは\n\n' +
					'00:00:02.500 --> 00:00:04.000\nよろしく'
			);
			expect(convert(input)).toBe('こんにちはよろしく。');
		});
	});
});
