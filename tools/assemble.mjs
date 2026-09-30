import { cp, mkdir, rm, writeFile, readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanPages, readSections } from './pages.mjs'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(process.env.DOCS_SRC ?? join(siteRoot, 'aura3d', 'doc'))
const out = join(siteRoot, 'content')

const fail = (msg) => {
  console.error(`::error:: ${msg}`)
  process.exitCode = 1
}

if (!existsSync(join(src, 'cn')) || !existsSync(join(src, 'en'))) {
  fail(`${src} 下没有 cn/ 与 en/，检查 DOCS_SRC 是否指向 CeSun/Aura3D 的 doc/`)
  process.exit(1)
}

const [cn, en] = await Promise.all([
  readdir(join(src, 'cn')).then(f => f.filter(x => x.endsWith('.md')).sort()),
  readdir(join(src, 'en')).then(f => f.filter(x => x.endsWith('.md')).sort()),
])

if (cn.length !== en.length || cn.some((f, i) => f !== en[i])) {
  fail(`中英文档清单不一致，双语不变量已断：\ncn: ${cn.join(' ')}\nen: ${en.join(' ')}`)
}

// 板块清单（键/顺序/中英标签）由主仓库 doc/sections.json 维护，站点仓库不再硬编码
let sections
try {
  sections = readSections(src)
} catch (e) {
  fail(e.message)
  process.exit(1)
}

// 侧边栏由每篇的 section/order 生成，所以归属也得双语一致，否则两个语言各自分板块
const scanned = { cn: scanPages(join(src, 'cn'), sections), en: scanPages(join(src, 'en'), sections) }
for (const [lang, { problems }] of Object.entries(scanned)) {
  for (const p of problems) fail(`${lang}: ${p}`)
}
const [cnPages, enPages] = [scanned.cn.pages, scanned.en.pages]
for (const s of sections) {
  if (!cnPages.some(p => p.section === s.key)) fail(`sections.json 声明的板块 '${s.key}' 在 cn/ 里一篇文档都没有`)
  if (!enPages.some(p => p.section === s.key)) fail(`sections.json 声明的板块 '${s.key}' 在 en/ 里一篇文档都没有`)
}
for (const page of cnPages) {
  const mate = enPages.find(p => p.slug === page.slug)
  if (mate && (mate.section !== page.section || mate.order !== page.order)) {
    fail(`板块归属不一致：${page.slug} 中文是 ${page.section}/${page.order}，英文是 ${mate.section}/${mate.order}`)
  }
}

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
// 站点要求默认语言占无前缀的根 locale，所以中文摊平到 content 根，英文留在 en/
await cp(join(src, 'cn'), out, { recursive: true })
await cp(join(src, 'en'), join(out, 'en'), { recursive: true })
await cp(join(src, 'sections.json'), join(out, 'sections.json'))
await writeFile(join(out, 'index.md'), await readFile(join(siteRoot, 'landing.md')))

console.log(`content assembled from ${src}`)
console.log(`  zh: ${cn.length} pages, en: ${en.length} pages`)
for (const page of cnPages) console.log(`  ${page.section}/${page.order}: ${page.slug}`)
if (process.exitCode) {
  console.error('::error:: 装配完成但校验未通过，构建结果可能缺页或分板块出错')
}
