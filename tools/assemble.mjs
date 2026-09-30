import { cp, mkdir, rm, writeFile, readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
// 站点要求默认语言占无前缀的根 locale，所以中文摊平到 content 根，英文留在 en/
await cp(join(src, 'cn'), out, { recursive: true })
await cp(join(src, 'en'), join(out, 'en'), { recursive: true })
await writeFile(join(out, 'index.md'), await readFile(join(siteRoot, 'landing.md')))

console.log(`content assembled from ${src}`)
console.log(`  zh: ${cn.length} pages, en: ${en.length} pages`)
if (process.exitCode) {
  console.error('::error:: 装配完成但清单校验未通过，构建结果可能缺页')
}
