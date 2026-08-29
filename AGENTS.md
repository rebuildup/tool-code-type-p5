# AGENTS.md — tool-code-type-p5

AI コーディングエージェント向けの canonical project contract。
詳細は project-local Skill / ADR / ソースを参照し、このファイルは dispatcher としてのみ運用する。

---

## 1. Project identity

- Name: `@rebuildup/tool-code-type-p5`
- Role: **embeddable Next.js client component** (`"use client"` 必須)。
- Public surface: `src/index.ts` の default export のみ。
- License: MIT
- Version: 0.1.0 (initial development — backward compatibility 不要)

## 2. Detected stack (source of truth)

- TypeScript ESM (`"type": "module"`), strict not enforced
- React 19 + react-dom 19 (dependencies)
- p5.js ^2.3.2 + `@types/p5` (devDep)
- jszip ^3.10.1
- Next.js ^16.3.0 (peer dependency only — consumer が host)

## 3. Boundaries (must respect)

- **This is not a runnable app.** `bun install` で dependencies を解決するだけで、app として起動する target は存在しない。
- すべての TSX は `"use client"` を冒頭に置く。Server component 化は禁止。
- Public API は `src/index.ts` のみ。ここ以外を consumer に import させない。
- p5.js は SSR 不可。`useEffect` 内 / `"use client"` 内でのみ instantiate する。
- `window.*` globals (`p5`, `JSZip`, `animationFunctions`, `p5Instances`) は current instance coordination のための既存 protocol。新規追加は禁止、既存利用も理由付きで最小化する。

## 4. Critical caveat — hidden sibling-repo dependency

`src/components/CodeTypeP5App.tsx` が以下を import する:

```ts
import { RawDOMContainer } from "../../../../external/ui/src/RawDOMContainer";
```

これは repository 直上の `external/ui/...` checkout を前提とする。
fresh clone では `external/` は存在しないため、type-check / bundling は失敗する。

**修正が方針決定を要求する ADR 課題**。詳細は `docs/adr/0001-tooling-and-package-boundary.md` §5 を参照。

## 5. Source code / documentation language policy

- Source code (filename / identifier / comment / config): **English only**
- Internal docs (AGENTS.md / ADR / Skill / runbook): **Japanese**
- Git / GitHub message (commit / PR / Issue / review): **English**

## 6. Package manager / lockfile

- **Bun** (`bun`, `bun run`, `bunx`) を standard とする。
- Lockfile は `bun.lock`。**commit する**。
- npm / Yarn / pnpm / `npx` の新規導入は禁止。

## 7. Validation entry point

初期状態では `package.json` に script が存在しない。現在の validation gate は:

1. 依存解決: `bun install --frozen-lockfile` が exit 0
2. Type-level smoke: `bunx tsc --noEmit -p .` が exit 0 (将来 tsconfig 追加後)
3. Consumer-side: host Next.js app でのみ runtime / visual verification 可能 (本 repo では不可)

test 追加時は §28 (error / warning を 0 に) と §29 (coverage ≥ 80%) を満たす。

## 8. Working branch / commit policy

- local `main` のみ。feature branch / temporary branch / worktree を作成しない。
- 1 commit = 1 論理的変更。message は英語 (§23)。
- commit 前に `bun run` / `bun install --frozen-lockfile` 相当の validation を通す。

## 9. Skill / plugin / MCP policy

- 現在 project-local Skill は存在しない。repeated / 具体的な trigger が出現してから追加する (§5)。
- global plugin 導入、home-directory rule 保存、implicit persistent memory の利用は禁止 (§3)。
- LSP / type-check は native agent capability を優先。重複導入しない。

## 10. Out-of-scope for this dispatcher

以下は別ファイル / 別 Skill へ:

- Architecture decision history → `docs/adr/`
- Source-level design → comments + future `docs/design/`
- Debugging / refactor / review → superpowers 系 Skill (`superpowers:systematic-debugging` 等) を参照
- CI / release / container / IaC → 現在 project に存在しないため未定義
