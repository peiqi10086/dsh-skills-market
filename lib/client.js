window.__ModuleLoader__.load({
	id: "dsh-skills-market",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/** 面板文案字典（zh / en）。键名即两个 locale 的公共键集。 */
		const NS = "skills-market";
		const zh = {
			"entry.label": "Skills 管理",
			"entry.aria": "打开 Skills 管理与商城",
			"panel.title": "Skills 管理 · SkillHub 商城",
			"panel.subtitle.installed": "管理本地 skills",
			"panel.subtitle.market": "SkillHub 共 {count} 个技能",
			"panel.close": "关闭",
			"panel.refresh": "刷新",
			"tab.installed": "已安装 Skills",
			"tab.market": "SkillHub 商城",
			"group.user": "用户级",
			"group.builtin": "内置",
			"group.current": "当前",
			"group.userDir": "用户级目录：{path}（所有工作区共享）",
			"group.projectDir": "项目级目录：{path}",
			"group.builtinNote": "内置 skills 随 DSH 部署或预设提供，只读展示，不可卸载或修改。",
			"group.empty": "该分组暂无 skills",
			"group.loading": "正在加载…",
			"level.project": "项目级",
			"level.user": "用户级",
			"readonly": "只读",
			"source.bundled": "内置",
			"source.runtime": "运行时",
			"source.project-dsh": "项目 .dsh",
			"source.user-dsh": "用户 .dsh",
			"source.custom": "自定义目录",
			"action.promote": "设为用户级",
			"action.uninstall": "卸载",
			"action.confirmUninstall": "确认卸载？",
			"action.working": "处理中…",
			"action.refresh": "⟳ 刷新",
			"action.error": "错误：{message}",
			"search.placeholder": "搜索 SkillHub 技能，如：PDF、周报、数据分析…",
			"installed.filter": "筛选当前分组：名称 / 简介…",
			"search.button": "搜索",
			"search.searching": "搜索中…",
			"search.error": "搜索失败：{message}",
			"search.empty": "没有匹配的技能，换个关键词试试",
			"search.total": "共 {total} 个结果，第 {page} / {pages} 页",
			"category.all": "全部分类",
			"sort.score": "按评分",
			"sort.downloads": "按下载量",
			"sort.installs": "按安装量",
			"sort.newest": "按最新",
			"install.project": "装到项目级（当前工作区）",
			"install.user": "装到用户级",
			"install.working": "安装中…",
			"install.done": "✓ 已安装",
			"install.doneProject": "✓ 已装到本项目",
			"install.doneUser": "✓ 已装到用户级",
			"install.exists": "该级别已存在同名 skill，如需重装请先在「已安装」里卸载",
			"detail.open": "详情 ↗",
			"page.prev": "上一页",
			"page.next": "下一页",
			"page.info": "第 {page} / {pages} 页",
			"page.jump": "跳至",
			"page.go": "跳转",
			"page.jumpAria": "输入页码后回车跳转",
			"page.perPage": "{n} 条/页",
			"page.perPageAria": "每页条数",
			"stats": "下载 {downloads} · 安装 {installs}",
			"noDescription": "（无描述）"
		};
		const en = {
			"entry.label": "Skills Manager",
			"entry.aria": "Open Skills manager and marketplace",
			"panel.title": "Skills Manager · SkillHub Market",
			"panel.subtitle.installed": "Manage local skills",
			"panel.subtitle.market": "{count} skills on SkillHub",
			"panel.close": "Close",
			"panel.refresh": "Refresh",
			"tab.installed": "Installed Skills",
			"tab.market": "SkillHub Market",
			"group.user": "User",
			"group.builtin": "Built-in",
			"group.current": "current",
			"group.userDir": "User skills dir: {path} (shared by all workspaces)",
			"group.projectDir": "Project skills dir: {path}",
			"group.builtinNote": "Built-in skills ship with the DSH deployment or presets; read-only.",
			"group.empty": "No skills in this group",
			"group.loading": "Loading…",
			"level.project": "Project",
			"level.user": "User",
			"readonly": "read-only",
			"source.bundled": "Built-in",
			"source.runtime": "Runtime",
			"source.project-dsh": "Project .dsh",
			"source.user-dsh": "User .dsh",
			"source.custom": "Custom dir",
			"action.promote": "Move to user level",
			"action.uninstall": "Uninstall",
			"action.confirmUninstall": "Confirm uninstall?",
			"action.working": "Working…",
			"action.refresh": "⟳ Refresh",
			"action.error": "Error: {message}",
			"search.placeholder": "Search SkillHub skills, e.g. PDF, weekly report…",
			"installed.filter": "Filter this group: name / description…",
			"search.button": "Search",
			"search.searching": "Searching…",
			"search.error": "Search failed: {message}",
			"search.empty": "No matching skills, try another keyword",
			"search.total": "{total} results, page {page} / {pages}",
			"category.all": "All categories",
			"sort.score": "By score",
			"sort.downloads": "By downloads",
			"sort.installs": "By installs",
			"sort.newest": "By newest",
			"install.project": "Install to project (current workspace)",
			"install.user": "Install to user",
			"install.working": "Installing…",
			"install.done": "✓ Installed",
			"install.doneProject": "✓ Installed in this project",
			"install.doneUser": "✓ Installed at user level",
			"install.exists": "A same-named skill exists at that level; uninstall it from \"Installed\" first to reinstall",
			"detail.open": "Details ↗",
			"page.prev": "Prev",
			"page.next": "Next",
			"page.info": "Page {page} / {pages}",
			"page.jump": "Go to",
			"page.go": "Go",
			"page.jumpAria": "Type a page number and press Enter",
			"page.perPage": "{n} / page",
			"page.perPageAria": "Items per page",
			"stats": "{downloads} downloads · {installs} installs",
			"noDescription": "(no description)"
		};
		//#endregion
		//#region src/core/skillhub.ts
		/** 一级分类（?category=<key>；面板下拉与工具说明共用）。 */
		const SKILLHUB_CATEGORIES = [
			["office-efficiency", "办公效率"],
			["content-creation", "内容创作"],
			["dev-programming", "开发编程"],
			["data-analysis", "数据分析"],
			["design-media", "设计多媒体"],
			["ai-agent", "AI Agent"],
			["knowledge-management", "知识管理"],
			["business-ops", "商业运营"],
			["education", "教育学习"],
			["professional", "行业专业"],
			["it-ops-security", "IT 运维与安全"],
			["life-service", "生活服务"]
		];
		//#endregion
		//#region src/client/hooks.ts
		/** store → React 的订阅桥（useSyncExternalStore；快照不可变，selector 返回稳定引用）。 */
		/** 订阅 store 并选取派生值；selector 必须返回稳定引用（快照字段或原始值）。 */
		function useSkillsSelector(store, selector) {
			return (0, react.useSyncExternalStore)(store.subscribe, () => selector(store.getSnapshot()));
		}
		//#endregion
		//#region src/client/store.ts
		/** 同源 API 前缀（与 host 半的路由一致）。 */
		const API_PREFIX = "/plugins/dsh-skills-market/api";
		/** 可选的每页条数（与 dsh-plugin-market 一致）。 */
		const GROUP_PER_PAGE_OPTIONS = [
			10,
			20,
			30,
			50,
			100
		];
		const MARKET_PER_PAGE_OPTIONS = [
			10,
			20,
			30,
			50,
			100
		];
		const INITIAL = {
			open: false,
			mainTab: "installed",
			groupKey: "user",
			groupData: {},
			groupStatus: "idle",
			groupPage: 1,
			groupPerPage: 30,
			groupQuery: "",
			busy: {},
			confirmKey: "",
			workspaces: [],
			query: "",
			category: "",
			sortBy: "score",
			marketPage: 1,
			marketPerPage: 30,
			marketStatus: "idle",
			marketItems: [],
			marketTotal: 0,
			installState: {}
		};
		/** 调同源 JSON API；ok:false 时抛错。 */
		async function callApi(op, body) {
			const res = await fetch(`${API_PREFIX}/${op}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			const data = await res.json();
			if (data.ok !== true) throw new Error(data.error ?? `http-${res.status}`);
			return data;
		}
		function pathBasename(p) {
			const parts = p.replace(/[\\/]+$/, "").split(/[\\/]/);
			const last = parts[parts.length - 1];
			return last === void 0 || last === "" ? p : last;
		}
		var SkillsStore = class {
			workspaces;
			sessions;
			state = INITIAL;
			listeners = /* @__PURE__ */ new Set();
			searchSeq = 0;
			constructor(workspaces, sessions) {
				this.workspaces = workspaces;
				this.sessions = sessions;
			}
			getSnapshot = () => this.state;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			set(patch) {
				this.state = {
					...this.state,
					...patch
				};
				for (const listener of this.listeners) listener();
			}
			/** 订阅 workspace 列表（在 apply 里以 ctx.effect 注册清理）。 */
			bindWorkspaces() {
				const sync = () => {
					const ws = this.workspaces.list.getSnapshot();
					const currentSession = this.sessions.list.getSnapshot().current;
					const mapped = [];
					for (const item of ws.items) {
						if (typeof item.path !== "string" || item.path === "") continue;
						const owns = currentSession !== void 0 && item.sessionIds.includes(currentSession);
						mapped.push({
							id: String(item.workspaceId),
							path: item.path,
							label: item.title !== "" ? item.title : pathBasename(item.path),
							current: owns || currentSession === void 0 && item.workspaceId === ws.recentWorkspaceId
						});
					}
					if (currentSession === void 0) {
						for (const tab of mapped) if (tab.id === String(ws.recentWorkspaceId)) {
							mapped.splice(mapped.indexOf(tab), 1);
							mapped.unshift({
								...tab,
								current: true
							});
							break;
						}
					}
					mapped.sort((a, b) => a.current === b.current ? 0 : a.current ? -1 : 1);
					if (this.state.workspaces.map((w) => w.path).join("|") === mapped.map((w) => w.path).join("|")) return;
					const prevCwd = this.currentCwd();
					const groupData = {};
					for (const [key, value] of Object.entries(this.state.groupData)) if (!key.startsWith("ws:")) groupData[key] = value;
					this.set({
						workspaces: mapped,
						groupData
					});
					if (this.currentCwd() !== prevCwd) this.set({ installState: {} });
				};
				sync();
				const unsubWs = this.workspaces.list.subscribe(sync);
				const unsubSessions = this.sessions.list.subscribe(sync);
				return () => {
					unsubWs();
					unsubSessions();
				};
			}
			/** 当前工作区路径（商城「装到项目级」的目标；无工作区时为 undefined → host 回退会话目录）。 */
			currentCwd() {
				return (this.state.workspaces.find((w) => w.current) ?? this.state.workspaces[0])?.path;
			}
			/** 分组页签的 cwd（user/builtin 不带 cwd）。 */
			groupCwd(key = this.state.groupKey) {
				return key.startsWith("ws:") ? key.slice(3) : void 0;
			}
			openPanel() {
				const firstOpen = !this.state.open;
				const current = this.state.workspaces.find((w) => w.current);
				const groupKey = current !== void 0 ? `ws:${current.path}` : "user";
				this.set({
					open: true,
					groupKey,
					groupPage: 1,
					groupQuery: "",
					confirmKey: ""
				});
				this.loadGroup();
				this.ensureInstallGroups();
				if (firstOpen && this.state.marketStatus === "idle") this.runMarketSearch(1);
			}
			closePanel() {
				this.set({ open: false });
			}
			setMainTab(mainTab) {
				this.set({ mainTab });
				if (mainTab === "installed") this.loadGroup();
				else {
					this.ensureInstallGroups();
					if (this.state.marketStatus === "idle") this.runMarketSearch(1);
				}
			}
			setGroup(groupKey) {
				if (groupKey === this.state.groupKey) return;
				this.set({
					groupKey,
					groupPage: 1,
					groupQuery: "",
					confirmKey: ""
				});
				this.loadGroup();
			}
			setGroupPage(groupPage) {
				this.set({ groupPage });
			}
			/** 已安装列表的组内筛选词（客户端过滤，不发请求）。 */
			setGroupQuery(groupQuery) {
				this.set({
					groupQuery,
					groupPage: 1
				});
			}
			/** 已安装列表每页条数：回到第一页。 */
			setGroupPerPage(groupPerPage) {
				if (groupPerPage === this.state.groupPerPage) return;
				if (!GROUP_PER_PAGE_OPTIONS.includes(groupPerPage)) return;
				this.set({
					groupPerPage,
					groupPage: 1
				});
			}
			setConfirmKey(confirmKey) {
				this.set({ confirmKey });
			}
			/** 拉取当前分组（带缓存）。 */
			async loadGroup(force = false) {
				await this.loadGroupKey(this.state.groupKey, force);
			}
			/** 拉取指定分组（user/builtin/ws:<path>）的 skills；带缓存，可静默后台加载。 */
			async loadGroupKey(key, force = false) {
				if (!force && this.state.groupData[key] !== void 0) return;
				const isActive = key === this.state.groupKey;
				if (isActive) this.set({
					groupStatus: this.state.groupData[key] === void 0 ? "loading" : "idle",
					groupError: void 0
				});
				try {
					const body = {};
					const cwd = this.groupCwd(key);
					if (cwd !== void 0) body["cwd"] = cwd;
					const data = await callApi("list", body);
					const groupData = {
						...this.state.groupData,
						[key]: data
					};
					this.set(isActive ? {
						groupData,
						groupStatus: "idle"
					} : { groupData });
				} catch (error) {
					if (isActive) this.set({
						groupStatus: "error",
						groupError: error instanceof Error ? error.message : String(error)
					});
				}
			}
			/**
			* 商城安装标记的数据源（VS Code 式本地清单 join）：确保「用户级」与
			* 「当前工作区项目级」两组本地清单已加载，商城卡片据此判定已安装状态。
			*/
			ensureInstallGroups() {
				this.loadGroupKey("user");
				const cwd = this.currentCwd();
				if (cwd !== void 0) this.loadGroupKey(`ws:${cwd}`);
			}
			/** 刷新当前分组（清全部缓存）。 */
			refreshGroup() {
				this.set({ groupData: {} });
				this.loadGroup(true);
			}
			setBusy(rowKey, value) {
				const busy = { ...this.state.busy };
				if (value) busy[rowKey] = true;
				else delete busy[rowKey];
				this.set({ busy });
			}
			/** 行操作（卸载 / 设为用户级）；完成后清缓存重载当前分组。 */
			async runRowAction(rowKey, op, body) {
				this.setBusy(rowKey, true);
				this.set({ confirmKey: "" });
				try {
					const payload = { ...body };
					const cwd = this.groupCwd();
					if (cwd !== void 0) payload["cwd"] = cwd;
					await callApi(op, payload);
					this.setBusy(rowKey, false);
					this.set({ groupData: {} });
					await this.loadGroup(true);
					this.ensureInstallGroups();
				} catch (error) {
					this.setBusy(rowKey, false);
					this.set({
						groupStatus: "error",
						groupError: error instanceof Error ? error.message : String(error)
					});
				}
			}
			/** 搜索框只更新文本，不发请求（手动搜索：按钮或回车触发）。 */
			setQuery(query) {
				this.set({ query });
			}
			/** 手动触发搜索（搜索按钮 / 输入框回车）。 */
			submitSearch() {
				this.runMarketSearch(1);
			}
			setCategory(category) {
				if (category === this.state.category) return;
				this.set({ category });
				this.runMarketSearch(1);
			}
			setSortBy(sortBy) {
				if (sortBy === this.state.sortBy) return;
				this.set({ sortBy });
				this.runMarketSearch(1);
			}
			goToMarketPage(page) {
				if (this.state.marketStatus === "loading") return;
				const totalPages = Math.max(1, Math.ceil(this.state.marketTotal / this.state.marketPerPage));
				const target = Math.max(1, Math.min(page, totalPages));
				if (target === this.state.marketPage) return;
				this.runMarketSearch(target);
			}
			/** 商城每页条数：回到第一页重新搜索。 */
			setMarketPerPage(marketPerPage) {
				if (marketPerPage === this.state.marketPerPage || this.state.marketStatus === "loading") return;
				if (!MARKET_PER_PAGE_OPTIONS.includes(marketPerPage)) return;
				this.set({ marketPerPage });
				this.runMarketSearch(1);
			}
			/** 手动刷新商城：清本地清单缓存并重查（安装标记与磁盘重新对齐）。 */
			refreshMarket() {
				this.set({ groupData: {} });
				this.ensureInstallGroups();
				this.runMarketSearch(this.state.marketPage);
			}
			async runMarketSearch(page) {
				const seq = ++this.searchSeq;
				this.set({
					marketStatus: "loading",
					marketError: void 0
				});
				try {
					const data = await callApi("search", {
						keyword: this.state.query,
						category: this.state.category,
						sortBy: this.state.sortBy,
						page,
						pageSize: this.state.marketPerPage
					});
					if (seq !== this.searchSeq) return;
					this.set({
						marketStatus: "idle",
						marketItems: data["skills"] ?? [],
						marketTotal: Number(data["total"]) || 0,
						marketPage: page
					});
					this.ensureInstallGroups();
				} catch (error) {
					if (seq !== this.searchSeq) return;
					this.set({
						marketStatus: "error",
						marketError: error instanceof Error ? error.message : String(error)
					});
				}
			}
			/** 安装一个商城 skill；level=project 时以当前工作区为目标。同名已存在时给出提示（exists）。 */
			async install(item, level) {
				const slug = item.slug;
				this.set({ installState: {
					...this.state.installState,
					[slug]: "installing"
				} });
				try {
					const body = {
						slug,
						namespace: item.namespace,
						level
					};
					const cwd = this.currentCwd();
					if (level === "project" && cwd !== void 0) body["cwd"] = cwd;
					await callApi("install", body);
					const installState = { ...this.state.installState };
					delete installState[slug];
					this.set({
						installState,
						groupData: {}
					});
					this.ensureInstallGroups();
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					const state = message === "already-exists" ? "exists" : `error:${message}`;
					this.set({ installState: {
						...this.state.installState,
						[slug]: state
					} });
				}
			}
			/** 截断过长的状态文本。 */
			static shortError(message) {
				return message.length > 200 ? `${message.slice(0, 200)}…` : message;
			}
		};
		//#endregion
		//#region src/client/panel.tsx
		/**
		* 面板组件：sidebar.footer.action 入口按钮 + shell.overlay 浮动面板。
		* 所有文案经 t()（注册项 locale: NS），所有颜色走 --dsw-alias-* 令牌（styles.ts）。
		*/
		/**
		* 侧边栏底部入口：宽栏为图标+文字整行（footerActions 经我们的样式竖排后每入口独占一行，
		* 行高/字号/hover 与 Cordis Plugin、插件市场、设置入口完全一致）；
		* 窄栏为 36px 圆形纯图标 + 悬停提示。图标用 IconSparkle16，与两个既有入口均不撞脸。
		*/
		function SkillsEntry({ wide, store, t }) {
			const button = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: wide ? "dshs-entry" : "dshs-entry-icon",
				"aria-label": t("entry.aria"),
				onClick: () => {
					store.openPanel();
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, { size: wide ? 16 : 18 }), wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("entry.label") }) : null]
			});
			return wide ? button : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("entry.label"),
				side: "right",
				delayMs: 500,
				children: button
			});
		}
		function fmtCount(n) {
			return n >= 1e4 ? `${(n / 1e4).toFixed(1)} 万` : String(n);
		}
		function sourceLabel(source, t) {
			const key = `source.${source}`;
			const translated = t(key);
			return translated === key ? source : translated;
		}
		/** 分页栏页码窗口：当前页前后各 2 页，首尾始终可见。 */
		function pageWindow(page, totalPages) {
			const wanted = /* @__PURE__ */ new Set([1, totalPages]);
			for (let p = page - 2; p <= page + 2; p += 1) if (p >= 1 && p <= totalPages) wanted.add(p);
			const sorted = [...wanted].sort((a, b) => a - b);
			const out = [];
			let prev = 0;
			for (const p of sorted) {
				if (prev !== 0 && p - prev > 1) out.push("…");
				out.push(p);
				prev = p;
			}
			return out;
		}
		/** 完整分页栏：上一页 / 页码窗口 / 下一页 / 页码跳转 / 每页条数。 */
		function Pagination({ page, totalPages, disabled, perPage, perPageOptions, onPage, onPerPage, t }) {
			const [jump, setJump] = (0, react.useState)("");
			const submitJump = () => {
				const target = Number.parseInt(jump, 10);
				if (Number.isFinite(target)) onPage(target);
				setJump("");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshs-pager",
				children: [
					totalPages > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshs-page-btn",
							disabled: disabled || page <= 1,
							"aria-label": t("page.prev"),
							onClick: () => onPage(page - 1),
							children: "‹"
						}),
						pageWindow(page, totalPages).map((entry, index) => entry === "…" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshs-page-gap",
							children: "…"
						}, `gap-${index}`) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: entry === page ? "dshs-page-btn current" : "dshs-page-btn",
							disabled: disabled || entry === page,
							onClick: () => onPage(entry),
							children: entry
						}, entry)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshs-page-btn",
							disabled: disabled || page >= totalPages,
							"aria-label": t("page.next"),
							onClick: () => onPage(page + 1),
							children: "›"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dshs-page-jump",
							children: [
								t("page.jump"),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: "dshs-page-input",
									value: jump,
									inputMode: "numeric",
									"aria-label": t("page.jumpAria"),
									disabled,
									onChange: (event) => {
										setJump(event.target.value);
									},
									onKeyDown: (event) => {
										if (event.key === "Enter") submitJump();
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshs-page-btn",
									disabled: disabled || jump.trim() === "",
									onClick: submitJump,
									children: t("page.go")
								})
							]
						})
					] }) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshs-page-info",
						children: t("page.info", {
							page,
							pages: totalPages
						})
					}),
					perPageOptions.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						className: "dshs-select",
						value: perPage,
						disabled,
						"aria-label": t("page.perPageAria"),
						onChange: (event) => {
							onPerPage(Number(event.target.value));
						},
						children: perPageOptions.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: option,
							children: t("page.perPage", { n: option })
						}, option))
					}) : null
				]
			});
		}
		/** 已安装：单条 skill 行。 */
		function SkillRow({ item, store, t }) {
			const busy = useSkillsSelector(store, (s) => s.busy);
			const confirmKey = useSkillsSelector(store, (s) => s.confirmKey);
			const rowKey = `${item.level}:${item.dir}`;
			const isBusy = busy[rowKey] === true;
			const confirming = confirmKey === rowKey;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: item.manageable ? "dshs-row" : "dshs-row readonly",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshs-row-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-name",
								children: item.name
							}),
							item.level === "project" || item.level === "user" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `dshs-badge ${item.level === "project" ? "project" : "user"}`,
								children: t(`level.${item.level}`)
							}) : null,
							!item.manageable ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dshs-badge",
								children: [
									sourceLabel(item.source, t),
									" · ",
									t("readonly")
								]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshs-desc",
						children: item.description !== "" ? item.description : t("noDescription")
					}),
					item.manageable ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshs-actions",
						children: [item.level === "project" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshs-btn ghost",
							disabled: isBusy,
							onClick: () => {
								store.runRowAction(rowKey, "set-level", {
									name: item.dir,
									to: "user"
								});
							},
							children: isBusy ? t("action.working") : t("action.promote")
						}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshs-btn danger",
							disabled: isBusy,
							onClick: () => {
								if (confirming) store.runRowAction(rowKey, "uninstall", {
									name: item.dir,
									level: item.level
								});
								else store.setConfirmKey(rowKey);
							},
							children: confirming ? t("action.confirmUninstall") : t("action.uninstall")
						})]
					}) : null
				]
			});
		}
		/** 已安装视图：分组页签（用户级 / 各工作区 / 内置）+ 分组内容。 */
		function InstalledView({ store, t }) {
			const snapshot = useSkillsSelector(store, (s) => s);
			const tabs = [
				{
					key: "user",
					label: t("group.user"),
					current: false
				},
				...snapshot.workspaces.map((w) => ({
					key: `ws:${w.path}`,
					label: w.current ? `${w.label} ·${t("group.current")}` : w.label,
					current: w.current
				})),
				{
					key: "builtin",
					label: t("group.builtin"),
					current: false
				}
			];
			const data = snapshot.groupData[snapshot.groupKey];
			const all = data?.skills ?? [];
			const levelItems = snapshot.groupKey === "user" ? all.filter((s) => s.level === "user") : snapshot.groupKey === "builtin" ? all.filter((s) => s.level === "builtin") : all.filter((s) => s.level === "project");
			const gq = snapshot.groupQuery.trim().toLowerCase();
			const items = gq === "" ? levelItems : levelItems.filter((s) => s.name.toLowerCase().includes(gq) || s.dir.toLowerCase().includes(gq) || s.description.toLowerCase().includes(gq));
			const totalPages = Math.max(1, Math.ceil(items.length / snapshot.groupPerPage));
			const safePage = Math.min(snapshot.groupPage, totalPages);
			const pageItems = items.slice((safePage - 1) * snapshot.groupPerPage, safePage * snapshot.groupPerPage);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshs-grouptabs",
					children: [tabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: `dshs-tab${tab.key === snapshot.groupKey ? " active" : ""}${tab.current ? " current" : ""}`,
						onClick: () => {
							store.setGroup(tab.key);
						},
						children: tab.label
					}, tab.key)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshs-btn ghost dshs-refresh",
						onClick: () => {
							store.refreshGroup();
						},
						children: t("action.refresh")
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshs-toolbar",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dshs-search",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							value: snapshot.groupQuery,
							placeholder: t("installed.filter"),
							onChange: (event) => {
								store.setGroupQuery(event.target.value);
							}
						})]
					})
				}),
				snapshot.groupStatus === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshs-error",
					children: t("action.error", { message: snapshot.groupError ?? "unknown" })
				}) : null,
				data !== void 0 && snapshot.groupKey !== "user" && snapshot.groupKey !== "builtin" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshs-pathhint",
					children: t("group.projectDir", { path: data.projectDir })
				}) : null,
				data !== void 0 && snapshot.groupKey === "user" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshs-pathhint",
					children: t("group.userDir", { path: data.userDir })
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshs-body",
					children: [data === void 0 || snapshot.groupStatus === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshs-state",
						children: t("group.loading")
					}) : items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshs-state",
						children: t("group.empty")
					}) : pageItems.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillRow, {
						item,
						store,
						t
					}, `${item.level}:${item.dir}`)), snapshot.groupKey === "builtin" && data !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshs-note",
						children: t("group.builtinNote")
					}) : null]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pagination, {
					page: safePage,
					totalPages,
					disabled: false,
					perPage: snapshot.groupPerPage,
					perPageOptions: GROUP_PER_PAGE_OPTIONS,
					onPage: (page) => {
						store.setGroupPage(page);
					},
					onPerPage: (perPage) => {
						store.setGroupPerPage(perPage);
					},
					t
				})
			] });
		}
		/**
		* 商城：单条技能卡片。已安装状态用 VS Code 式「本地清单 join」：
		* 与 store 缓存的 /list 数据（用户级 + 当前工作区项目级）比对 slug/目录名，
		* 随安装/卸载/换级/刷新自动与磁盘对齐；仅重复安装时后端会回 exists 提示。
		*/
		function MarketCard({ item, store, t }) {
			const installState = useSkillsSelector(store, (s) => s.installState);
			const userGroup = useSkillsSelector(store, (s) => s.groupData["user"]);
			const projKey = useSkillsSelector(store, (s) => {
				const current = s.workspaces.find((w) => w.current) ?? s.workspaces[0];
				return current === void 0 ? "" : `ws:${current.path}`;
			});
			const projGroup = useSkillsSelector(store, (s) => projKey === "" ? void 0 : s.groupData[projKey]);
			const matches = (sk) => sk.dir === item.slug || sk.name === item.slug;
			const installedUser = userGroup?.skills.some((sk) => sk.level === "user" && matches(sk)) === true;
			const installedProject = projGroup?.skills.some((sk) => sk.level === "project" && matches(sk)) === true;
			const state = installState[item.slug];
			const installing = state === "installing";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshs-row",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshs-row-head",
						children: [
							item.iconUrl !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
								className: "dshs-icon",
								src: item.iconUrl,
								alt: ""
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-name",
								children: item.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-badge",
								children: item.category
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-meta",
								children: t("stats", {
									downloads: fmtCount(item.downloads),
									installs: fmtCount(item.installs)
								})
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshs-desc",
						children: item.description
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshs-actions",
						children: [
							installedProject ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-ok",
								children: t("install.doneProject")
							}) : null,
							installedUser ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-ok",
								children: t("install.doneUser")
							}) : null,
							state === "exists" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-meta",
								children: t("install.exists")
							}) : null,
							installing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-meta",
								children: t("install.working")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [!installedProject ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dshs-btn",
								onClick: () => {
									store.install(item, "project");
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutline16, { size: 14 }), t("install.project")]
							}) : null, !installedUser ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshs-btn ghost",
								onClick: () => {
									store.install(item, "user");
								},
								children: t("install.user")
							}) : null] }),
							typeof state === "string" && state.startsWith("error:") ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshs-error",
								children: SkillsStore.shortError(state.slice(6))
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: "dshs-link",
								href: `https://www.skillhub.cn/skills/${item.namespace}/${item.slug}`,
								target: "_blank",
								rel: "noreferrer",
								children: t("detail.open")
							})
						]
					})
				]
			});
		}
		/** 商城视图：搜索工具栏 + 结果卡片 + 服务端分页。 */
		function MarketView({ store, t }) {
			const snapshot = useSkillsSelector(store, (s) => s);
			const loading = snapshot.marketStatus === "loading";
			const totalPages = Math.max(1, Math.ceil(snapshot.marketTotal / snapshot.marketPerPage));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshs-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dshs-search",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: snapshot.query,
								placeholder: t("search.placeholder"),
								onChange: (event) => {
									store.setQuery(event.target.value);
								},
								onKeyDown: (event) => {
									if (event.key === "Enter") store.submitSearch();
								}
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "dshs-btn dshs-search-btn",
							disabled: loading,
							onClick: () => {
								store.submitSearch();
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size: 14 }), loading ? t("search.searching") : t("search.button")]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							className: "dshs-select",
							value: snapshot.category,
							"aria-label": t("category.all"),
							onChange: (event) => {
								store.setCategory(event.target.value);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: t("category.all")
							}), SKILLHUB_CATEGORIES.map(([key, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: key,
								children: label
							}, key))]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							className: "dshs-select",
							value: snapshot.sortBy,
							"aria-label": t("sort.score"),
							onChange: (event) => {
								store.setSortBy(event.target.value);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "score",
									children: t("sort.score")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "downloads",
									children: t("sort.downloads")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "installs",
									children: t("sort.installs")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "newest",
									children: t("sort.newest")
								})
							]
						})
					]
				}),
				snapshot.marketStatus === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshs-error",
					children: t("search.error", { message: snapshot.marketError ?? "unknown" })
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshs-body",
					children: loading && snapshot.marketItems.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshs-state",
						children: t("search.searching")
					}) : snapshot.marketItems.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshs-state",
						children: t("search.empty")
					}) : snapshot.marketItems.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarketCard, {
						item,
						store,
						t
					}, item.slug))
				}),
				snapshot.marketTotal > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshs-totalbar",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("search.total", {
						total: snapshot.marketTotal,
						page: snapshot.marketPage,
						pages: totalPages
					}) })
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pagination, {
					page: snapshot.marketPage,
					totalPages,
					disabled: loading,
					perPage: snapshot.marketPerPage,
					perPageOptions: MARKET_PER_PAGE_OPTIONS,
					onPage: (page) => {
						store.goToMarketPage(page);
					},
					onPerPage: (perPage) => {
						store.setMarketPerPage(perPage);
					},
					t
				})
			] });
		}
		/** shell.overlay 条目：浮动面板（Esc + 透明背板点击关闭）。 */
		function SkillsOverlay(props) {
			const { store, t } = props;
			const open = useSkillsSelector(store, (s) => s.open);
			const mainTab = useSkillsSelector(store, (s) => s.mainTab);
			const marketTotal = useSkillsSelector(store, (s) => s.marketTotal);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") store.closePanel();
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [open, store]);
			if (!open) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshs-backdrop",
				"aria-hidden": "true",
				onClick: () => {
					store.closePanel();
				}
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshs-root",
				role: "dialog",
				"aria-label": t("panel.title"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshs-head",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, { size: 16 }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshs-head-title",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("panel.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: mainTab === "market" ? t("panel.subtitle.market", { count: marketTotal }) : t("panel.subtitle.installed") })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshs-icon-btn",
								"aria-label": t("panel.refresh"),
								onClick: () => {
									mainTab === "market" ? store.refreshMarket() : store.refreshGroup();
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 14 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshs-icon-btn",
								"aria-label": t("panel.close"),
								onClick: () => {
									store.closePanel();
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshs-maintabs",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `dshs-tab${mainTab === "installed" ? " active" : ""}`,
							onClick: () => {
								store.setMainTab("installed");
							},
							children: t("tab.installed")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `dshs-tab${mainTab === "market" ? " active" : ""}`,
							onClick: () => {
								store.setMainTab("market");
							},
							children: t("tab.market")
						})]
					}),
					mainTab === "installed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InstalledView, { ...props }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarketView, { ...props })
				]
			})] });
		}
		//#endregion
		//#region src/client/styles.ts
		/**
		* 面板样式：全部颜色引用 --dsw-alias-* 设计令牌（body[data-ds-dark-theme] 自动切暗色）。
		* 以 <style data-plugin="dsh-skills-market"> 注入，随 fiber 回收。
		* 入口几何与官方 Cordis 徽标/设置行逐项对齐（同 dsh-plugin-market 的 .dshm-entry）。
		*/
		const SKILLS_CSS = `
.dshs-entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-entry-icon:hover { background: var(--dsw-alias-interactive-bg-hover); }

/* 宽栏入口行：几何参数逐项抄自官方设置触发行（SettingsRoot.module.css .trigger）——
   width: calc(100% + 8px) + margin: 4px -4px 的 bleed 使图标左缘净落在 6px，
   与 Cordis 徽标（padding-left: 6px）和设置行精确对齐，悬停底色带同宽。 */
.dshs-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% + 8px);
  height: 34px;
  margin: 4px -4px;
  padding: 6px 2px 6px 10px;
  box-sizing: border-box;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-entry:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-entry span {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 让侧栏 footer action 区域竖排：每个入口独占一行。
   通过 slot 的稳定标记属性定位容器（不依赖会被重新哈希的类名）；
   若官方侧栏 DOM 结构变化，此规则静默失效，仅退回横向一行，无副作用。 */
div:has(> [data-slot="sidebar.footer.action"]) {
  flex-direction: column;
}

.dshs-root {
  position: fixed;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: min(720px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  pointer-events: auto;
  z-index: 90;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
.dshs-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dshs-head-title { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.dshs-head-title strong { font-size: 14px; }
.dshs-head-title span { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dshs-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.dshs-icon-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }

.dshs-maintabs {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dshs-grouptabs {
  display: flex;
  gap: 6px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  flex-wrap: wrap;
  align-items: center;
}
.dshs-tab {
  padding: 4px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-tab:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-tab.active {
  border-color: var(--dsw-alias-state-business-primary);
  color: var(--dsw-alias-state-business-primary);
  font-weight: 600;
}
.dshs-tab.current { font-weight: 600; }
.dshs-refresh { margin-left: auto; }

.dshs-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dshs-search {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-tertiary);
}
.dshs-search input {
  flex: 1;
  min-width: 0;
  height: 30px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
/* 搜索按钮固定宽度：文案在「搜索 / 搜索中…」间切换时不引起工具栏宽度抖动。 */
.dshs-search-btn {
  min-width: 96px;
  justify-content: center;
  flex-shrink: 0;
}
.dshs-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.dshs-body { flex: 1; overflow-y: auto; padding: 12px 16px; }
.dshs-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 16px;
  color: var(--dsw-alias-label-tertiary);
  text-align: center;
}
.dshs-pathhint {
  padding: 6px 16px 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  word-break: break-all;
}
.dshs-note {
  margin-top: 10px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
.dshs-error {
  margin: 8px 16px 0;
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
.dshs-ok { color: var(--dsw-alias-state-success-primary); font-size: 12px; }

.dshs-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
}
.dshs-row.readonly { opacity: 0.72; }
.dshs-row-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.dshs-name { font-weight: 600; color: var(--dsw-alias-state-business-primary); }
.dshs-badge {
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--dsw-alias-state-business-tertiary);
  color: var(--dsw-alias-state-business-primary);
  font-size: 11px;
}
.dshs-badge.project {
  background: var(--dsw-alias-state-success-tertiary);
  color: var(--dsw-alias-state-success-primary);
}
.dshs-badge.user {
  background: var(--dsw-alias-state-business-tertiary);
  color: var(--dsw-alias-state-business-primary);
}
.dshs-meta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dshs-desc {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.dshs-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dshs-icon { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
.dshs-link {
  color: var(--dsw-alias-state-business-primary);
  text-decoration: none;
  font-size: 12px;
  margin-left: auto;
}
.dshs-link:hover { text-decoration: underline; }

.dshs-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-inverted);
  font-size: 13px;
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-btn:hover { background: var(--dsw-alias-button-primary-hover); }
.dshs-btn:disabled { opacity: 0.5; cursor: default; }
.dshs-btn.ghost {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  border: 1px solid var(--dsw-alias-border-l2);
}
.dshs-btn.ghost:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-btn.danger {
  background: transparent;
  color: var(--dsw-alias-state-error-primary);
  border: 1px solid var(--dsw-alias-state-error-primary);
}
.dshs-btn.danger:hover { background: var(--dsw-alias-interactive-bg-hover); }

/* 点击外部自动关闭的透明背板（shell.overlay 层默认点击穿透，需显式 opt-in）。 */
.dshs-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  z-index: 89;
}

/* 分页栏 */
.dshs-pager {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  flex-wrap: wrap;
}
.dshs-page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 120ms var(--ds-ease-in-out);
}
.dshs-page-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dshs-page-btn:disabled { opacity: 0.4; cursor: default; }
.dshs-page-btn.current {
  background: var(--dsw-alias-interactive-bg-active);
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
  opacity: 1;
}
.dshs-page-gap { color: var(--dsw-alias-label-tertiary); padding: 0 2px; }
.dshs-page-jump {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
.dshs-page-input {
  width: 44px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  outline: none;
  text-align: center;
}
.dshs-page-input:focus { border-color: var(--dsw-alias-border-l3); }
.dshs-page-info { margin-left: auto; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dshs-totalbar {
  padding: 4px 16px 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
`;
		//#endregion
		//#region src/client/index.tsx
		const name = "dsh-skills-market";
		const inject = [
			"slots",
			"locale",
			"sessions",
			"workspaces"
		];
		/** 挂载浏览器半。 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "skills-market: dictionaries");
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset["plugin"] = "dsh-skills-market";
				tag.textContent = SKILLS_CSS;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "skills-market: styles");
			const store = new SkillsStore(ctx.workspaces, ctx.sessions);
			ctx.effect(() => store.bindWorkspaces(), "skills-market: workspaces sync");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "skills-market",
				order: -40,
				label: () => "Skills 管理",
				locale: NS,
				inject: () => ({ store })
			}, SkillsEntry));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "skills-market-overlay",
				order: 101,
				locale: NS,
				inject: () => ({ store })
			}, SkillsOverlay));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map