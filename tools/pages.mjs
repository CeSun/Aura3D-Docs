import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// 板块清单的唯一真源：顺序即侧边栏顺序，标签由调用方按语言给。
export const SECTIONS = ['start', 'basics', 'advanced']

// 总览页与落地页不进侧边栏分组：它们由 sidebar() 单独放在最前
const SKIP = new Set(['index.md', 'home.md'])

const parseFrontmatter = (raw, file, problems) => {
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) {
    problems.push(`${file} 缺 frontmatter，侧边栏无法归位（要 section 与 order）`)
    return null
  }
  const meta = {}
  for (const line of block[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  if (!SECTIONS.includes(meta.section)) {
    problems.push(`${file} 的 section='${meta.section ?? ''}' 不在 ${SECTIONS.join(' / ')} 里`)
    return null
  }
  if (!/^\d+$/.test(meta.order ?? '')) {
    problems.push(`${file} 的 order='${meta.order ?? ''}' 不是整数`)
    return null
  }
  const h1 = raw.match(/^# (.+?)\s*$/m)
  if (!h1) {
    problems.push(`${file} 没有一级标题，侧边栏没有可用标题`)
    return null
  }
  return { slug: file.replace(/\.md$/, ''), title: h1[1], section: meta.section, order: Number(meta.order) }
}

// 读一个内容目录（content 或 content/en），返回页面清单与所有问题——一次收集完，不分批失败
export function scanPages(dir) {
  if (!existsSync(dir)) throw new Error(`内容目录 ${dir} 不存在，先跑 npm run assemble`)
  const problems = []
  const pages = []
  for (const file of readdirSync(dir).filter(f => f.endsWith('.md') && !SKIP.has(f)).sort()) {
    const page = parseFrontmatter(readFileSync(join(dir, file), 'utf8'), file, problems)
    if (page) pages.push(page)
  }
  const orders = new Map()
  for (const p of pages) {
    const key = `${p.section}:${p.order}`
    if (orders.has(key)) problems.push(`${orders.get(key)} 与 ${p.slug}.md 的 order 都是 ${p.order}，侧边栏顺序会随文件名漂`)
    else orders.set(key, p.slug)
  }
  return { pages, problems }
}

export function sidebar({ dir, base, overview, labels }) {
  const { pages, problems } = scanPages(dir)
  if (problems.length) throw new Error(`侧边栏无法生成：\n  ${problems.join('\n  ')}`)
  const groups = SECTIONS.map(key => ({
    text: labels[key],
    collapsed: false,
    items: pages
      .filter(p => p.section === key)
      .sort((a, b) => a.order - b.order)
      .map(p => ({ text: p.title, link: `${base}${p.slug}.html` })),
  }))
  return [{ text: overview, link: `${base}home.html` }, ...groups]
}
