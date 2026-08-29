# ADR 0001 — Tooling と package boundary の初期決定

- 調査日: 2026-08-29
- Status: **Accepted**
- Deciders: repository init agent (project-agent-init skill)
- Supersedes: — (initial ADR)
- Superseded by: —

## 1. Context

`@rebuildup/tool-code-type-p5` は Next.js 16 ベースの host application に embed される **client component library** である。Repository は初期 scaffold 直後の状態で:

- `package.json` に依存は記載済みだが script が一切ない (test / lint / build / type-check 全て未定義)。
- Lockfile 不在。fresh clone で `bun install` は走るが、解決 version は環境依存。
- `src/components/CodeTypeP5App.tsx` が sibling checkout `../../../../external/ui/src/RawDOMContainer` を import する。`external/` はこのリポジトリの管轄外で、fresh clone では未配置。
- `tsconfig.json` 不在。strict mode 未有効化。
- `AGENTS.md` / `CLAUDE.md` / `.cursorrules` 等 agent config 不在。
- CI / coverage / container 設定なし。
- Working tree は clean。過去の commit は 4 件すべて scaffold / dep 追加のみ。

初期 development phase のため backward compatibility は不要 (§16)。

## 2. Decision

### 2.1 Package manager: Bun

`bun` / `bun run` / `bunx` を standard とする。Lockfile は `bun.lock` を commit する。npm / Yarn / pnpm / `npx` の新規導入は禁止。

**Reason**: プロジェクトの policy (§10) で Bun が default。既存 repo に他 package manager の痕跡がない。peer dep が `next ^16.3.0` のみで npm-specific な依存もない。

### 2.2 初期 validation gate は最小

`package.json` に script を **追加しない**。代わりに:

- `bun install --frozen-lockfile` で lockfile の reproducibility を検証。
- type / lint / test は script / config が追加されてから CI 化する。

**Reason**: script 不在の状態で CI を組むことは theatre である。validation script は gate として実際に機能する段階で追加する。

### 2.3 Hidden external dep を **当面 formalize しない**

`src/components/CodeTypeP5App.tsx` の `external/ui/src/RawDOMContainer` import は、現状のまま据え置く。ただし `AGENTS.md` §4 と本 ADR §5 で明示的に制約として記録し、fresh clone で build が壊れることを expected state として扱う。

**Reason**: 修正には次のいずれかの設計判断が必要で、init 段階の autonomous な範囲を超える:

1. 親 workspace (例: `C:\Users\rebui\Desktop\`) に `external/` symlink / submodule を作成する。
2. 該当 import を consumer app 側に移し、本 lib を raw DOM に依存しない形にする。
3. `RawDOMContainer` を published package として参照する。

この判断は user agreement が必要な design-first task (§14) であり、init では surface のみを行う。

### 2.4 初期 Skill / plugin / MCP は導入しない

Project-local Skill / `.claude/settings.json` 編集 / global plugin 導入 / MCP server 追加は **行わない**。

**Reason**:

- §5 に従い Skill は repeated / 具体的な trigger から育てる。現在 trigger が見えない。
- §3 に従い global state への書込は禁止。
- §6 に従い native capability で足りる範囲を plugin で上書きしない。

将来追加する場合は独立した ADR を起こす。

### 2.5 AGENTS.md は dispatcher

ルート agent file は「ほぼすべてのタスクに作用する不変条件」のみ (§4)。詳細 rule は source / Skill / 別 ADR へ分離する。

### 2.6 Internal documentation language

- AGENTS.md / ADR / Skill / 内部 runbook: **日本語**
- Source code / commit / PR: **英語**

## 3. Consequences

### Positive

- hidden state が最小化される (Skill / plugin / MCP を後から育てる余地を残しつつ、今は導入しない)。
- bun.lock が reproducibility を担保する。
- AGENTS.md が薄く dispatcher に徹しているため context cost が低い。

### Negative / Debt

- fresh clone では本 repo を **library として build / type-check できない**。consumer app 側に置いて初めて検証可能。
- test / lint / format 機構が存在しないため、本 ADR 時点では §28 / §29 を満たせない。**existing quality debt** として §4 に列挙。
- tsconfig 不在で strict でない。既存の `any` 多用は現状維持。
- `window.*` global protocol は source of truth が存在しない暗黙 API になっている。

## 4. Existing quality debt (要 follow-up)

| # | Item | Severity | Required decision |
|---|------|----------|-------------------|
| 1 | `external/ui/src/RawDOMContainer` hidden dep | High | design-first: §2.3 のいずれか |
| 2 | No test framework, no scripts, no CI | High | policy §28-29 gate が現状未達 |
| 3 | `tsconfig.json` 不在, strict 不在 | Medium | 必要時に追加 |
| 4 | `any` 多用 (`useP5Lifecycle.ts`, `BaseAnimation.draw*` 等) | Medium | 段階的 narrowing |
| 5 | `window.*` global protocol 暗黙化 | Medium | 1 か所への型定義集約 |
| 6 | lockfile なし (本 ADR で対応予定) | Low | `bun install` 実行 |
| 7 | 既存の numbered file prefix (`001_Editors/...`) は §13 違反気味の命名だが一貫しているため rename しない (§2) | Low | — |

## 5. Re-evaluation conditions

次の場合に本 ADR を改訂 (revise / supersede 別 ADR を起こす):

1. §4 item #1 (external dep) の解が定まった時 → 結果に応じて §2.3 を改訂 / deprecate。
2. test framework 追加時 → §2.2 を改訂して具体的な gate を記載。
3. CI 導入時 → 別 ADR (`0002-ci-strategy.md` 想定) を起こす。
4. Package manager の移行判断が出た時 → §2.1 を改訂。
5. project が standalone Next.js app になった場合 (peer dep が dep に変わる等) → §2 を再評価。

## 6. References

- Repo source of truth: `src/`, `package.json`, `AGENTS.md`
- External: Next.js 16 docs, p5.js reference, React 19 docs (model knowledge; official re-check は関連変更時に行う)
- Policy: project-agent-init skill §3-§7, §10, §16, §41
