# Aura3D 文档站

VitePress 站点层。文档内容不在这里，真源是 [CeSun/Aura3D](https://github.com/CeSun/Aura3D) 的 `doc/`。

线上地址：<https://cesun.github.io/Aura3D-Docs/>

## 两个仓库之间的契约

主仓库的 `doc/` 不直接当内容根：`tools/assemble.mjs` 先把它装配成本仓库的 `content/`（`srcDir` 固定指这里），中文从 `doc/cn/` 摊平到 `content/` 根、英文原样放 `content/en/`，再加本仓库自持的 `landing.md` → `content/index.md`。装配时会比对 `doc/cn` 与 `doc/en` 的文件清单，不一致就 `::error::` 并 exit 1。

之所以要摊平：VitePress 的语言切换器靠「当前页相对路径去掉 locale 前缀」推导对等页，**默认语言必须占无前缀的根 locale**，所以中文页的 URL 没有 `/cn/`：

| Aura3D 里的路径 | 站点 URL |
|---|---|
| `doc/cn/home.md` | `/home`（中文总览） |
| `doc/cn/<page>.md` | `/<page>` |
| `doc/en/home.md` | `/en/home` |
| `doc/en/<page>.md` | `/en/<page>` |

侧边栏与导航在 `.vitepress/config.mts` 里手写，新增文档要同步那里。

## 本地开发

1. 把 Aura3D 克隆到本仓库旁边，例如 `../RiderProjects/Aura3D`。
2. `npm install`
3. `DOCS_SRC=<主仓库路径>/doc npm run dev` → <http://localhost:5173/>（`dev` 与 `build` 都会先跑装配）

CI 里 `DOCS_SRC` 指向 workflow 检出的 `.aura3d-source/doc`。内容必须是真实文件、不能用软链接进来：Vite 会把软链解析成真实路径，内容落在项目根之外时页面互链会全部判成死链。

## 发布

手动触发 [Deploy Docs](../../actions/workflows/deploy.yml) 工作流，可选填 `source_ref`（默认 `main`，也可填某个 SHA）。构建产物 force push 到 `gh-pages` 分支，Pages 从该分支根目录托管。
