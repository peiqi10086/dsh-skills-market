import { existsSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { createRequire } from "module";
//#region src/core/skillhub.ts
const API_BASE = "https://api.skillhub.cn";
const DEFAULT_TIMEOUT_MS = 15e3;
/** 商城默认每页条数（与 dsh-plugin-market 一致）。 */
const MARKET_DEFAULT_PAGE_SIZE = 30;
/** HTTP 层错误（状态码非 2xx）。 */
var SkillHubHttpError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
		this.name = "SkillHubHttpError";
	}
};
/** 请求超时。 */
var SkillHubTimeoutError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "SkillHubTimeoutError";
	}
};
function makeSignal(signal, timeoutMs) {
	const timeout = AbortSignal.timeout(timeoutMs);
	if (signal === void 0) return timeout;
	return AbortSignal.any([signal, timeout]);
}
function throwForUnknown(signal, timeoutMs) {
	if (signal?.aborted === true) throw new DOMException("aborted", "AbortError");
	throw new SkillHubTimeoutError(`SkillHub 请求超时（${Math.round(timeoutMs / 1e3)} 秒）`);
}
/** 原始 skill 条目 → canonical 条目（只读取叶字段）。 */
function mapSkillHubItem(raw) {
	const s = typeof raw === "object" && raw !== null ? raw : {};
	const ns = typeof s["namespace"] === "object" && s["namespace"] !== null ? s["namespace"] : {};
	const descZh = s["description_zh"];
	const descEn = s["description"];
	return {
		name: String(s["name"] ?? ""),
		slug: String(s["slug"] ?? ""),
		namespace: String(ns["handle"] ?? ""),
		description: String(descZh ?? descEn ?? ""),
		category: String(s["category"] ?? ""),
		downloads: Number(s["downloads"]) || 0,
		installs: Number(s["installs"]) || 0,
		stars: Number(s["stars"]) || 0,
		iconUrl: typeof s["iconUrl"] === "string" ? s["iconUrl"] : ""
	};
}
/** 关键词/分类/排序/分页搜索。 */
async function searchSkills(fetchImpl, options, extra = {}) {
	const timeoutMs = extra.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const page = Math.max(1, options.page ?? 1);
	const pageSize = Math.min(100, Math.max(1, options.pageSize ?? MARKET_DEFAULT_PAGE_SIZE));
	const params = [
		`sortBy=${encodeURIComponent(options.sortBy ?? "score")}`,
		`page=${page}`,
		`pageSize=${pageSize}`
	];
	if (options.keyword !== void 0 && options.keyword.trim() !== "") params.push(`keyword=${encodeURIComponent(options.keyword.trim())}`);
	if (options.category !== void 0 && options.category !== "") params.push(`category=${encodeURIComponent(options.category)}`);
	const url = `${API_BASE}/api/skills?${params.join("&")}`;
	let res;
	try {
		res = await fetchImpl(url, { signal: makeSignal(extra.signal, timeoutMs) });
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError" && extra.signal?.aborted === true) throw error;
		if (error instanceof Error && error.name === "TimeoutError") throwForUnknown(extra.signal, timeoutMs);
		throw error;
	}
	if (!res.ok) throw new SkillHubHttpError(res.status, `SkillHub 搜索接口返回 HTTP ${res.status}`);
	const parsed = await res.json();
	const data = typeof parsed["data"] === "object" && parsed["data"] !== null ? parsed["data"] : {};
	const list = Array.isArray(data["skills"]) ? data["skills"] : [];
	return {
		total: Number(data["total"]) || list.length,
		page,
		items: list.map(mapSkillHubItem)
	};
}
/** 下载 skill 的 zip 包（原始字节）。 */
async function downloadSkillZip(fetchImpl, slug, namespace, extra = {}) {
	const timeoutMs = extra.timeoutMs ?? 6e4;
	const url = `${API_BASE}/api/v1/download?slug=${encodeURIComponent(slug)}&namespace=${encodeURIComponent(namespace)}`;
	let res;
	try {
		res = await fetchImpl(url, { signal: makeSignal(extra.signal, timeoutMs) });
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError" && extra.signal?.aborted === true) throw error;
		if (error instanceof Error && error.name === "TimeoutError") throwForUnknown(extra.signal, timeoutMs);
		throw error;
	}
	if (!res.ok) throw new SkillHubHttpError(res.status, `SkillHub 下载接口返回 HTTP ${res.status}`);
	return new Uint8Array(await res.arrayBuffer());
}
//#endregion
//#region node_modules/.pnpm/fflate@0.8.3/node_modules/fflate/esm/index.mjs
var require = createRequire("/");
var _a;
try {
	_a = require("worker_threads"), _a.Worker, _a.isMarkedAsUntransferable;
} catch (e) {}
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]);
var fdeb = new u8([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]);
var clim = new u8([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]);
var freb = function(eb, start) {
	var b = new u16(31);
	for (var i = 0; i < 31; ++i) b[i] = start += 1 << eb[i - 1];
	var r = new i32(b[30]);
	for (var i = 1; i < 30; ++i) for (var j = b[i]; j < b[i + 1]; ++j) r[j] = j - b[i] << 5 | i;
	return {
		b,
		r
	};
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
_b.r;
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
	var x = (i & 43690) >> 1 | (i & 21845) << 1;
	x = (x & 52428) >> 2 | (x & 13107) << 2;
	x = (x & 61680) >> 4 | (x & 3855) << 4;
	rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var hMap = (function(cd, mb, r) {
	var s = cd.length;
	var i = 0;
	var l = new u16(mb);
	for (; i < s; ++i) if (cd[i]) ++l[cd[i] - 1];
	var le = new u16(mb);
	for (i = 1; i < mb; ++i) le[i] = le[i - 1] + l[i - 1] << 1;
	var co;
	if (r) {
		co = new u16(1 << mb);
		var rvb = 15 - mb;
		for (i = 0; i < s; ++i) if (cd[i]) {
			var sv = i << 4 | cd[i];
			var r_1 = mb - cd[i];
			var v = le[cd[i] - 1]++ << r_1;
			for (var m = v | (1 << r_1) - 1; v <= m; ++v) co[rev[v] >> rvb] = sv;
		}
	} else {
		co = new u16(s);
		for (i = 0; i < s; ++i) if (cd[i]) co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
	}
	return co;
});
var flt = new u8(288);
for (var i = 0; i < 144; ++i) flt[i] = 8;
for (var i = 144; i < 256; ++i) flt[i] = 9;
for (var i = 256; i < 280; ++i) flt[i] = 7;
for (var i = 280; i < 288; ++i) flt[i] = 8;
var fdt = new u8(32);
for (var i = 0; i < 32; ++i) fdt[i] = 5;
var flrm = /*#__PURE__*/ hMap(flt, 9, 1);
var fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
var max = function(a) {
	var m = a[0];
	for (var i = 1; i < a.length; ++i) if (a[i] > m) m = a[i];
	return m;
};
var bits = function(d, p, m) {
	var o = p / 8 | 0;
	return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
	var o = p / 8 | 0;
	return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
	return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
	if (s == null || s < 0) s = 0;
	if (e == null || e > v.length) e = v.length;
	return new u8(v.subarray(s, e));
};
var ec = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
];
var err = function(ind, msg, nt) {
	var e = new Error(msg || ec[ind]);
	e.code = ind;
	if (Error.captureStackTrace) Error.captureStackTrace(e, err);
	if (!nt) throw e;
	return e;
};
var inflt = function(dat, st, buf, dict) {
	var sl = dat.length, dl = dict ? dict.length : 0;
	if (!sl || st.f && !st.l) return buf || new u8(0);
	var noBuf = !buf;
	var resize = noBuf || st.i != 2;
	var noSt = st.i;
	if (noBuf) buf = new u8(sl * 3);
	var cbuf = function(l) {
		var bl = buf.length;
		if (l > bl) {
			var nbuf = new u8(Math.max(bl * 2, l));
			nbuf.set(buf);
			buf = nbuf;
		}
	};
	var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
	var tbts = sl * 8;
	do {
		if (!lm) {
			final = bits(dat, pos, 1);
			var type = bits(dat, pos + 1, 3);
			pos += 3;
			if (!type) {
				var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
				if (t > sl) {
					if (noSt) err(0);
					break;
				}
				if (resize) cbuf(bt + l);
				buf.set(dat.subarray(s, t), bt);
				st.b = bt += l, st.p = pos = t * 8, st.f = final;
				continue;
			} else if (type == 1) lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
			else if (type == 2) {
				var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
				var tl = hLit + bits(dat, pos + 5, 31) + 1;
				pos += 14;
				var ldt = new u8(tl);
				var clt = new u8(19);
				for (var i = 0; i < hcLen; ++i) clt[clim[i]] = bits(dat, pos + i * 3, 7);
				pos += hcLen * 3;
				var clb = max(clt), clbmsk = (1 << clb) - 1;
				var clm = hMap(clt, clb, 1);
				for (var i = 0; i < tl;) {
					var r = clm[bits(dat, pos, clbmsk)];
					pos += r & 15;
					var s = r >> 4;
					if (s < 16) ldt[i++] = s;
					else {
						var c = 0, n = 0;
						if (s == 16) n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
						else if (s == 17) n = 3 + bits(dat, pos, 7), pos += 3;
						else if (s == 18) n = 11 + bits(dat, pos, 127), pos += 7;
						while (n--) ldt[i++] = c;
					}
				}
				var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
				lbt = max(lt);
				dbt = max(dt);
				lm = hMap(lt, lbt, 1);
				dm = hMap(dt, dbt, 1);
			} else err(1);
			if (pos > tbts) {
				if (noSt) err(0);
				break;
			}
		}
		if (resize) cbuf(bt + 131072);
		var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
		var lpos = pos;
		for (;; lpos = pos) {
			var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
			pos += c & 15;
			if (pos > tbts) {
				if (noSt) err(0);
				break;
			}
			if (!c) err(2);
			if (sym < 256) buf[bt++] = sym;
			else if (sym == 256) {
				lpos = pos, lm = null;
				break;
			} else {
				var add = sym - 254;
				if (sym > 264) {
					var i = sym - 257, b = fleb[i];
					add = bits(dat, pos, (1 << b) - 1) + fl[i];
					pos += b;
				}
				var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
				if (!d) err(3);
				pos += d & 15;
				var dt = fd[dsym];
				if (dsym > 3) {
					var b = fdeb[dsym];
					dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
				}
				if (pos > tbts) {
					if (noSt) err(0);
					break;
				}
				if (resize) cbuf(bt + 131072);
				var end = bt + add;
				if (bt < dt) {
					var shift = dl - dt, dend = Math.min(dt, end);
					if (shift + bt < 0) err(3);
					for (; bt < dend; ++bt) buf[bt] = dict[shift + bt];
				}
				for (; bt < end; ++bt) buf[bt] = buf[bt - dt];
			}
		}
		st.l = lm, st.p = lpos, st.b = bt, st.f = final;
		if (lm) final = 1, st.m = lbt, st.d = dm, st.n = dbt;
	} while (!final);
	return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /*#__PURE__*/ new u8(0);
var b2 = function(d, b) {
	return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
	return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
	return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, opts) {
	return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /*#__PURE__*/ new TextDecoder();
try {
	td.decode(et, { stream: true });
} catch (e) {}
var dutf8 = function(d) {
	for (var r = "", i = 0;;) {
		var c = d[i++];
		var eb = (c > 127) + (c > 223) + (c > 239);
		if (i + eb > d.length) return {
			s: r,
			r: slc(d, i - 1)
		};
		if (!eb) r += String.fromCharCode(c);
		else if (eb == 3) c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
		else if (eb & 1) r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
		else r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
	}
};
/**
* Converts a Uint8Array to a string
* @param dat The data to decode to string
* @param latin1 Whether or not to interpret the data as Latin-1. This should
*               not need to be true unless encoding to binary string.
* @returns The original UTF-8/Latin-1 string
*/
function strFromU8(dat, latin1) {
	if (latin1) {
		var r = "";
		for (var i = 0; i < dat.length; i += 16384) r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
		return r;
	} else if (td) return td.decode(dat);
	else {
		var _a = dutf8(dat), s = _a.s, r = _a.r;
		if (r.length) err(8);
		return s;
	}
}
var slzh = function(d, b) {
	return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
	var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
	var _a = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a[0], su = _a[1], off = _a[2];
	return [
		b2(d, b + 10),
		sc,
		su,
		fn,
		es + efl + b2(d, b + 32),
		off
	];
};
var z64hs = function(d, b, l, z, sc, su, off) {
	var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
	var nf = nsc + nsu + noff;
	if (z && nf) {
		for (; b + 4 < e; b += 4 + b2(d, b + 2)) if (b2(d, b) == 1) return [
			nsc ? b8(d, b + 4 + 8 * nsu) : sc,
			nsu ? b8(d, b + 4) : su,
			noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
			1
		];
		if (z < 2) err(13);
	}
	return [
		sc,
		su,
		off,
		0
	];
};
/**
* Synchronously decompresses a ZIP archive. Prefer using `unzip` for better
* performance with more than one file.
* @param data The raw compressed ZIP file
* @param opts The ZIP extraction options
* @returns The decompressed files
*/
function unzipSync(data, opts) {
	var files = {};
	var e = data.length - 22;
	for (; b4(data, e) != 101010256; --e) if (!e || data.length - e > 65558) err(13);
	var c = b2(data, e + 8);
	if (!c) return {};
	var o = b4(data, e + 16);
	var z = b4(data, e - 20) == 117853008;
	if (z) {
		var ze = b4(data, e - 12);
		z = b4(data, ze) == 101075792;
		if (z) {
			c = b4(data, ze + 32);
			o = b4(data, ze + 48);
		}
	}
	var fltr = opts && opts.filter;
	for (var i = 0; i < c; ++i) {
		var _a = zh(data, o, z), c_2 = _a[0], sc = _a[1], su = _a[2], fn = _a[3], no = _a[4], off = _a[5], b = slzh(data, off);
		o = no;
		if (!fltr || fltr({
			name: fn,
			size: sc,
			originalSize: su,
			compression: c_2
		})) {
			if (!c_2) files[fn] = slc(data, b, b + sc);
			else if (c_2 == 8) files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
			else err(14, "unknown compression type " + c_2);
		}
	}
	return files;
}
//#endregion
//#region src/core/local.ts
/**
* 本地 skills 目录核心（仅 host 半使用，Node 文件系统）。
* 目录约定与 dsh 的 skill-filesystem 保持一致（packages/skill/skill-filesystem）：
* - 项目级：<projectRoot>/.agents/skills（projectRoot = 从 cwd 向上找最近的 .git）
* - 用户级：<agentsHome>/skills（agentsHome = DSH_AGENTS_HOME ?? ~/.agents）
*/
/** kebab-case 的 skill 目录/名称。 */
function isSkillName(name) {
	return /^[a-z0-9][a-z0-9-]{0,63}$/.test(name);
}
/** 用户级 skills 目录。 */
function userSkillsDir() {
	const agentsHome = resolve(process.env["DSH_AGENTS_HOME"] ?? join(homedir(), ".agents"));
	return join(agentsHome, "skills");
}
/** 复刻 skill-filesystem findProjectRoot：从 cwd 向上找最近的 .git。 */
function findProjectRoot(cwd) {
	let current = resolve(cwd);
	while (true) {
		if (existsSync(join(current, ".git"))) return current;
		const parent = dirname(current);
		if (parent === current) return resolve(cwd);
		current = parent;
	}
}
/** 项目级 skills 目录。 */
function projectSkillsDir(cwd) {
	return join(findProjectRoot(cwd), ".agents", "skills");
}
/** 从 SKILL.md 文本提取 frontmatter 的 name/description（逐行、前 60 行内）。 */
function parseSkillFrontmatter(text) {
	const out = {};
	const lines = text.split(/\r?\n/, 62);
	for (const line of lines.slice(0, 60)) {
		const nameMatch = /^name:\s*(.+?)\s*$/.exec(line);
		if (nameMatch !== null && out.name === void 0) out.name = nameMatch[1];
		const descMatch = /^description:\s*(.+?)\s*$/.exec(line);
		if (descMatch !== null && out.description === void 0) out.description = descMatch[1];
	}
	return out;
}
/** 扫描一个 skills 根目录（不存在的目录返回空表）。 */
async function scanSkillsDir(root, level) {
	if (!existsSync(root)) return [];
	const entries = await readdir(root, { withFileTypes: true });
	const rows = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const skillFile = join(root, entry.name, "SKILL.md");
		if (!existsSync(skillFile)) continue;
		let name = entry.name;
		let description = "";
		try {
			const parsed = parseSkillFrontmatter(await readFile(skillFile, "utf8"));
			if (parsed.name !== void 0) name = parsed.name;
			if (parsed.description !== void 0) description = parsed.description;
		} catch {}
		rows.push({
			level,
			dir: entry.name,
			name,
			description
		});
	}
	return rows;
}
/**
* 把 zip 字节安装进目标目录：
* 自动定位包内 SKILL.md 所在层（根或单层子目录），只落地该层下的文件；
* 拒绝路径穿越条目；目标已存在时报 already-exists。
*/
async function installZip(targetRoot, slug, zip) {
	if (!isSkillName(slug)) throw new Error(`invalid skill slug: ${slug}`);
	const dest = join(targetRoot, slug);
	if (existsSync(dest)) {
		const error = /* @__PURE__ */ new Error("already-exists");
		error.name = "SkillAlreadyExists";
		throw error;
	}
	const files = unzipSync(zip);
	const names = Object.keys(files);
	let prefix;
	if (names.some((name) => name.replace(/\\/g, "/") === "SKILL.md")) prefix = "";
	else for (const name of names) {
		const segments = name.replace(/\\/g, "/").split("/");
		if (segments.length === 2 && segments[1] === "SKILL.md" && segments[0] !== void 0 && segments[0] !== "") {
			prefix = `${segments[0]}/`;
			break;
		}
	}
	if (prefix === void 0) throw new Error("package does not contain SKILL.md");
	const written = [];
	for (const [rawName, content] of Object.entries(files)) {
		const normalized = rawName.replace(/\\/g, "/");
		if (!normalized.startsWith(prefix)) continue;
		const relative = normalized.slice(prefix.length);
		if (relative === "" || relative.endsWith("/")) continue;
		if (relative.split("/").some((segment) => segment === ".." || segment === "")) continue;
		written.push([relative, content]);
	}
	if (written.length === 0) throw new Error("package is empty");
	await mkdir(targetRoot, { recursive: true });
	for (const [relative, content] of written) {
		const target = join(dest, ...relative.split("/"));
		if (!resolve(target).startsWith(resolve(dest) + sep)) continue;
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, content);
	}
	return dest;
}
/** 卸载（删除）一个 skill 目录。 */
async function removeSkill(root, name) {
	if (!isSkillName(name)) throw new Error(`invalid skill name: ${name}`);
	const target = join(root, name);
	if (!existsSync(target)) throw new Error(`skill not found: ${name}`);
	await rm(target, {
		recursive: true,
		force: true
	});
}
/** 把 skill 从一个级别目录移动到另一个（目标已存在时只删源，恢复中断的移动）。 */
async function moveSkill(fromRoot, toRoot, name) {
	if (!isSkillName(name)) throw new Error(`invalid skill name: ${name}`);
	const src = join(fromRoot, name);
	const dst = join(toRoot, name);
	if (!existsSync(src)) throw new Error(`source skill not found: ${name}`);
	if (!existsSync(dst)) {
		await mkdir(toRoot, { recursive: true });
		await cp(src, dst, { recursive: true });
	}
	await rm(src, {
		recursive: true,
		force: true
	});
	return dst;
}
//#endregion
//#region src/index.ts
const name = "dsh-skills-market";
const inject = ["webServer", "tools"];
/** 面板 API 的路由前缀（prefix 匹配其下所有子路径）。 */
const API_PREFIX = "/plugins/dsh-skills-market/api";
/** Node fetch 适配为 FetchLike（结构子集）。 */
const nodeFetch = async (url, init) => fetch(url, {
	headers: init.headers,
	signal: init.signal
});
function sendJson(res, value) {
	res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(value));
}
async function readBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	if (chunks.length === 0) return {};
	try {
		const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		return typeof parsed === "object" && parsed !== null ? parsed : {};
	} catch {
		return {};
	}
}
function bodyString(body, key) {
	const value = body[key];
	return typeof value === "string" && value !== "" ? value : void 0;
}
function bodyNumber(body, key) {
	const value = body[key];
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function errorText(error) {
	return error instanceof Error ? error.message : String(error);
}
/** skills 来源 → 级别与可管理性（与面板的分组一致）。 */
function mapSource(source) {
	if (source === "project-agents") return {
		level: "project",
		manageable: true
	};
	if (source === "user-agents") return {
		level: "user",
		manageable: true
	};
	if (source === "project-dsh") return {
		level: "project",
		manageable: false
	};
	if (source === "user-dsh") return {
		level: "user",
		manageable: false
	};
	return {
		level: "builtin",
		manageable: false
	};
}
/** 优先走 skills 服务（带来源信息，可区分内置只读）；服务缺失时退化为目录扫描。 */
async function listLocal(ctx, cwd) {
	const base = cwd ?? process.cwd();
	const projectDir = projectSkillsDir(base);
	const userDir = userSkillsDir();
	const skillsService = ctx.get("skills");
	if (skillsService !== void 0) {
		const options = { cwd: base };
		const agentPresets = ctx.get("agentPresets");
		if (agentPresets !== void 0) try {
			const scope = await agentPresets.standingKeyFor();
			if (scope !== void 0) options.scope = scope;
		} catch {}
		return {
			ok: true,
			skills: (await skillsService.list(options)).map((s) => {
				const mapped = mapSource(s.source);
				let dir = s.name;
				const baseDir = s.resourceBase;
				if (baseDir !== void 0 && baseDir.kind === "directory" && typeof baseDir.path === "string") {
					const parts = baseDir.path.replace(/[\\/]+$/, "").split(/[\\/]/);
					const last = parts[parts.length - 1];
					if (last !== void 0 && last !== "") dir = last;
				}
				return {
					level: mapped.level,
					manageable: mapped.manageable,
					source: s.source,
					dir,
					name: s.name,
					description: s.description
				};
			}),
			projectDir,
			userDir,
			workspaceRoot: base
		};
	}
	const [projectSkills, userSkills] = await Promise.all([scanSkillsDir(projectDir, "project"), scanSkillsDir(userDir, "user")]);
	return {
		ok: true,
		skills: [...projectSkills, ...userSkills].map((row) => ({
			level: row.level,
			manageable: true,
			source: `${row.level}-agents`,
			dir: row.dir,
			name: row.name,
			description: row.description
		})),
		projectDir,
		userDir,
		workspaceRoot: base
	};
}
function levelRoot(level, cwd) {
	if (level === "project") return projectSkillsDir(cwd ?? process.cwd());
	if (level === "user") return userSkillsDir();
	throw new Error(`invalid level: ${level}`);
}
async function handleApi(ctx, req, res) {
	const pathname = (req.url ?? "").split("?")[0] ?? "";
	const sub = pathname.startsWith(API_PREFIX) ? pathname.slice(30) : pathname;
	try {
		if (req.method !== "POST") {
			sendJson(res, {
				ok: false,
				error: "method-not-allowed"
			});
			return;
		}
		const body = await readBody(req);
		const cwd = bodyString(body, "cwd");
		if (sub === "/list") {
			sendJson(res, await listLocal(ctx, cwd));
			return;
		}
		if (sub === "/search") {
			const page = await searchSkills(nodeFetch, {
				...bodyString(body, "keyword") !== void 0 ? { keyword: bodyString(body, "keyword") } : {},
				...bodyString(body, "category") !== void 0 ? { category: bodyString(body, "category") } : {},
				...bodyString(body, "sortBy") !== void 0 ? { sortBy: bodyString(body, "sortBy") } : {},
				...bodyNumber(body, "page") !== void 0 ? { page: bodyNumber(body, "page") } : {},
				...bodyNumber(body, "pageSize") !== void 0 ? { pageSize: bodyNumber(body, "pageSize") } : {}
			});
			sendJson(res, {
				ok: true,
				total: page.total,
				page: page.page,
				skills: page.items
			});
			return;
		}
		if (sub === "/install") {
			const slug = bodyString(body, "slug");
			const namespace = bodyString(body, "namespace");
			if (slug === void 0 || namespace === void 0) throw new Error("missing slug/namespace");
			const zip = await downloadSkillZip(nodeFetch, slug, namespace);
			sendJson(res, {
				ok: true,
				path: await installZip(levelRoot(bodyString(body, "level") ?? "user", cwd), slug, zip)
			});
			return;
		}
		if (sub === "/uninstall") {
			const name = bodyString(body, "name");
			if (name === void 0) throw new Error("missing name");
			await removeSkill(levelRoot(bodyString(body, "level") ?? "", cwd), name);
			sendJson(res, { ok: true });
			return;
		}
		if (sub === "/set-level") {
			const name = bodyString(body, "name");
			const to = bodyString(body, "to");
			if (name === void 0 || to === void 0) throw new Error("missing name/to");
			const toRoot = levelRoot(to, cwd);
			sendJson(res, {
				ok: true,
				path: await moveSkill(to === "project" ? userSkillsDir() : projectSkillsDir(cwd ?? process.cwd()), toRoot, name)
			});
			return;
		}
		sendJson(res, {
			ok: false,
			error: "unknown-endpoint"
		});
	} catch (error) {
		if (error instanceof Error && error.name === "SkillAlreadyExists") {
			sendJson(res, {
				ok: false,
				error: "already-exists"
			});
			return;
		}
		sendJson(res, {
			ok: false,
			error: errorText(error)
		});
	}
}
function coerceArgs(raw) {
	const record = typeof raw === "object" && raw !== null ? raw : {};
	return {
		keyword: typeof record["keyword"] === "string" ? record["keyword"] : void 0,
		category: typeof record["category"] === "string" ? record["category"] : void 0,
		sortBy: typeof record["sortBy"] === "string" ? record["sortBy"] : void 0,
		page: typeof record["page"] === "number" ? record["page"] : void 0
	};
}
async function executeSearch(rawArgs, signal) {
	const args = coerceArgs(rawArgs);
	try {
		const page = await searchSkills(nodeFetch, {
			...args.keyword === void 0 ? {} : { keyword: args.keyword },
			...args.category === void 0 ? {} : { category: args.category },
			...args.sortBy === void 0 ? {} : { sortBy: args.sortBy },
			...args.page === void 0 ? {} : { page: args.page },
			pageSize: 10
		}, {
			signal,
			timeoutMs: 1e4
		});
		return {
			ok: true,
			total: page.total,
			page: page.page,
			items: page.items
		};
	} catch (error) {
		if (signal.aborted) throw error;
		if (error instanceof SkillHubTimeoutError) return {
			ok: false,
			kind: "timeout",
			message: "SkillHub 搜索超时（10 秒），请稍后重试。"
		};
		if (error instanceof SkillHubHttpError) return {
			ok: false,
			kind: "http-error",
			status: error.status,
			message: error.message
		};
		return {
			ok: false,
			kind: "error",
			message: errorText(error)
		};
	}
}
function renderValue(value) {
	if (!value.ok) return `SkillHub 搜索失败（${value.kind}）：${value.message}`;
	if (value.items.length === 0) return `没有找到匹配的技能（共 ${value.total} 个）。换个关键词或同义词再试。`;
	const lines = value.items.map((item, index) => {
		const rank = (value.page - 1) * 10 + index + 1;
		const desc = item.description === "" ? "" : ` — ${item.description.slice(0, 80)}`;
		return `${rank}. ${item.name}（@${item.namespace}/${item.slug}）下载 ${item.downloads} 安装 ${item.installs}${desc}\n   主页：https://www.skillhub.cn/skills/${item.namespace}/${item.slug}`;
	});
	return [
		`SkillHub 技能搜索：共 ${value.total} 个，第 ${value.page} 页 ${value.items.length} 条：`,
		...lines,
		"",
		"安装建议：引导用户打开 Web UI 侧边栏底部的「Skills 商城」面板搜索安装（可选项目级/用户级）；",
		"或征得用户同意后，把 zip 下载链接交给 shell 解压到对应 .agents/skills 目录。"
	].join("\n");
}
const searchTool = {
	name: "dsh_skillhub_search",
	description: [
		"搜索 SkillHub（skillhub.cn）技能商城的公开技能（无需密钥）。",
		"用户询问「有没有……的 skill / 找个处理 X 的技能 / SkillHub 上搜一下」时使用。",
		"返回候选列表（名称、@namespace/slug、分类、下载/安装量、简介、主页链接）。"
	].join(""),
	parameters: {
		type: "object",
		properties: {
			keyword: {
				type: "string",
				description: "搜索关键词（分词搜索），留空列出热门。"
			},
			category: {
				type: "string",
				description: "一级分类，如 office-efficiency、dev-programming、data-analysis、ai-agent 等。"
			},
			sortBy: {
				type: "string",
				enum: [
					"score",
					"downloads",
					"installs",
					"newest"
				],
				description: "排序：score（默认）/ downloads / installs / newest。"
			},
			page: {
				type: "number",
				description: "页码（1 起，每页 10 条）。"
			}
		}
	},
	output: {
		schema: {
			type: "object",
			required: ["ok"],
			properties: { ok: { type: "boolean" } },
			additionalProperties: true
		},
		render: (args, value) => [{
			type: "text",
			text: renderValue(value)
		}]
	},
	timeoutMs: 2e4,
	isConcurrencySafe: () => true,
	presentCall: (rawArgs) => {
		const args = coerceArgs(rawArgs);
		return {
			card: "generic",
			title: `搜索 SkillHub 技能：${args.keyword === void 0 || args.keyword.trim() === "" ? "热门技能" : `“${args.keyword}”`}`,
			kind: "search"
		};
	},
	execute: (args, exec) => executeSearch(args, exec.signal)
};
/** 挂载 Host 半：同源 API 路由 + 模型工具。 */
function apply(ctx) {
	ctx.webServer.register({
		kind: "prefix",
		path: API_PREFIX,
		handler: (req, res) => handleApi(ctx, req, res)
	});
	ctx.tools.register(searchTool);
}
//#endregion
export { apply, findProjectRoot, inject, name };
