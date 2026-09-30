# Aura3D 文档站

VitePress 站点层。文档内容不在这里，真源是 [CeSun/Aura3D](https://github.com/CeSun/Aura3D) 的 `doc/`。

线上地址：<https://cesun.github.io/Aura3D-Docs/>

## 两个仓库之间的契约

主仓库的 `doc/` 不直接当内容根：`tools/assemble.mjs` 先把它装配成本仓库的 `content/`（`srcDir` 固定指这里），中文从 `doc/cn/` 摊平到 `content/` 根、英文原样放 `content/en/`，再加本仓库自持的 `landing.md` → `content/index.md`。装配时会比对 `doc/cn` 与 `doc/en` 的文件清单与板块归属，任一不一致就 `::error::` 并 exit 1。

之所以要摊平：VitePress 的语言切换器靠「当前页相对路径去掉 locale 前缀」推导对等页，**默认语言必须占无前缀的根 locale**，所以中文页的 URL 没有 `/cn/`：

| Aura3D 里的路径 | 站点 URL |
|---|---|
| `doc/cn/home.md` | `/home.html`（中文总览） |
| `doc/cn/<page>.md` | `/<page>.html` |
| `doc/en/home.md` | `/en/home.html` |
| `doc/en/<page>.md` | `/en/<page>.html` |

URL 带 `.html` 是因为 `cleanUrls: false`：GitHub Pages 不解析无扩展名 URL，开了 cleanUrls 站内链接会全 404。英文切换器给的是目录形态的 `/en/`，Pages 也不解析目录，所以 `.vitepress/config.mts` 里一个 `closeBundle` 插件补一个真实的 `en/index.html` 软跳转。

**侧边栏是生成的，不是手写的**：每篇文档在 frontmatter 里声明自己的板块归属——

```yaml
---
section: basics   # 键必须来自主仓库 doc/sections.json
order: 1          # 板块内顺序
---
```

`tools/pages.mjs` 从 `content/`（和 `content/en/`）读这些字段，加上各篇的 `# 一级标题` 作为条目文字，拼出两个语言各自的侧边栏；板块的**清单、顺序与中英文标签**的真源是主仓库的 `doc/sections.json`（数组顺序即侧边栏顺序，每项 `{key, zh, en}`），装配时原样拷进 `content/sections.json`——新增板块只改主仓库这个文件，本仓库代码不用动。归位错、`section` 键不在清单里、同板块 `order` 撞车、中英归属对不上、声明了却没用的空板块，都在 `npm run assemble` 阶段 `::error::` 并 exit 1（绕过装配手改 `content/` 的话，config 加载时同样抛错）。所以新增一篇文档只改主仓库那个文件本身，导航自动跟上。

`doc/cn/home.md` / `doc/en/home.md` 的总览表仍是文档手写的，和侧边栏同源但不同步——它不进板块生成路径。

## 本地开发

1. 把 Aura3D 克隆到本仓库旁边，例如 `../RiderProjects/Aura3D`。
2. `npm install`
3. `DOCS_SRC=<主仓库路径>/doc npm run dev` → <http://localhost:5173/>（`dev` 与 `build` 都会先跑装配）

CI 里 `DOCS_SRC` 指向 workflow 检出的 `.aura3d-source/doc`。内容必须是真实文件、不能用软链接进来：Vite 会把软链解析成真实路径，内容落在项目根之外时页面互链会全部判成死链。

## 发布

手动触发 [Deploy Docs](../../actions/workflows/deploy.yml) 工作流，可选填 `source_ref`（默认 `main`，也可填完整的 40 位提交号；短号解析不了，会在 check 作业报错）。

工作流是 `check` → `build` → `deploy` 三段，走官方 Pages 通道（`configure-pages` + `upload-pages-artifact` + `deploy-pages`）：构建产物只活在 artifact 里，不进 git、也没有 `gh-pages` 分支。`build` 会先拿 `source_ref` 解析出的 SHA 盖章成 `dist/source-sha.txt`，再逐条验产物结构（中英首页、`en/index.html`、pipelines 页必须在），缺文件直接 `::error::` 而不是把坏站推上去；`deploy` 之后重试 `source-sha.txt` 确认线上真的换版了。想知道线上跑的是哪个文档提交：

```
curl https://cesun.github.io/Aura3D-Docs/source-sha.txt
```

前置条件只需一次性配置：仓库 Settings → Pages → Build source 选 **GitHub Actions**。
