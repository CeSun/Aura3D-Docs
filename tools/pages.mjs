import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// 板块清单（键、顺序、中英标签）的唯一真源在主仓库 doc/sections.json，
// 装配时原样拷进 content/，这里只是读它——新增板块不用改站点仓库。
export function readSections(root) {
  const file = join(root, 'sections.json')
  if (!existsSync(file)) {
    throw new Error(`${file} 不存在——板块清单由主仓库 doc/sections.json 维护，先跑 npm run assemble`)
  }
  let list
  try {
    list = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    throw new Error(`${file} 不是合法 JSON：${e.message}`)
  }
  if (!Array.isArray(list) || list.length === 0) throw new Error(`${file} 要是一个非空数组`)
  for (const s of list) {
    if (!s || typeof s.key !== 'string' || typeof s.zh !== 'string' || typeof s.en !== 'string') {
      throw new Error(`${file} 每一项都要有 key/zh/en 三个字符串字段，收到：${JSON.stringify(s)}`)
    }
  }
  if (new Set(list.map(s => s.key)).size !== list.length) throw new Error(`${file} 里 section key 撞车了`)
  return list
}

// 总览页与落地页不进侧边栏分组：它们由 sidebar() 单独放在最前
const SKIP = new Set(['index.md', 'home.md'])

const parseFrontmatter = (raw, file, sections, problems) => {
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
  if (!sections.some(s => s.key === meta.section)) {
    problems.push(`${file} 的 section='${meta.section ?? ''}' 不在 doc/sections.json 的 ${sections.map(s => s.key).join(' / ')} 里`)
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
export function scanPages(dir, sections) {
  if (!existsSync(dir)) throw new Error(`内容目录 ${dir} 不存在，先跑 npm run assemble`)
  const problems = []
  const pages = []
  for (const file of readdirSync(dir).filter(f => f.endsWith('.md') && !SKIP.has(f)).sort()) {
    const page = parseFrontmatter(readFileSync(join(dir, file), 'utf8'), file, sections, problems)
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

export function sidebar({ dir, sectionsRoot, base, overview, lang }) {
  const sections = readSections(sectionsRoot)
  const { pages, problems } = scanPages(dir, sections)
  if (problems.length) throw new Error(`侧边栏无法生成：\n  ${problems.join('\n  ')}`)
  const groups = sections.map(s => ({
    text: s[lang],
    collapsed: false,
    items: pages
      .filter(p => p.section === s.key)
      .sort((a, b) => a.order - b.order)
      .map(p => ({ text: p.title, link: `${base}${p.slug}.html` })),
  }))
  return [{ text: overview, link: `${base}home.html` }, ...groups]
}
