import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const EN_DIR_ENTRY = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Aura3D Documentation</title>
<meta http-equiv="refresh" content="0; url=/Aura3D-Docs/en/home.html">
<link rel="canonical" href="/Aura3D-Docs/en/home.html"></head>
<body><a href="/Aura3D-Docs/en/home.html">Aura3D Documentation</a></body></html>
`

const docPages = [
  { text: '开始上手', link: 'get-started' },
  { text: '渲染管线', link: 'pipelines' },
  { text: '动画系统', link: 'animation' },
  { text: '实例化渲染', link: 'instanced-rendering' },
  { text: '渲染专题', link: 'rendering' },
  { text: '粒子系统', link: 'particle-system' },
  { text: 'GPU 资源生命周期', link: 'gpu-resource-lifecycle' },
  { text: '平台与渲染后端', link: 'platform-render-backends' },
]

const enDocPages = [
  { text: 'Get Started', link: 'get-started' },
  { text: 'Rendering Pipelines', link: 'pipelines' },
  { text: 'Animation System', link: 'animation' },
  { text: 'Instanced Rendering', link: 'instanced-rendering' },
  { text: 'Rendering Topics', link: 'rendering' },
  { text: 'Particle System', link: 'particle-system' },
  { text: 'GPU Resource Lifecycle', link: 'gpu-resource-lifecycle' },
  { text: 'Platforms and Render Backends', link: 'platform-render-backends' },
]

const sidebar = (base: string, overview: string, pages: typeof docPages) => [
  { text: overview, link: `${base}home.html` },
  ...pages.map(p => ({ text: p.text, link: `${base}${p.link}.html` })),
]

export default defineConfig({
  srcDir: 'content',
  base: process.env.DOCS_BASE ?? '/Aura3D-Docs/',
  cleanUrls: false, // GitHub Pages 不解析无扩展名 URL，开 cleanUrls 会让站内链接全 404

  lastUpdated: true,
  srcExclude: ['images/**'],
  markdown: {
    languageAlias: { xaml: 'xml' },
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      link: '/',
      title: 'Aura3D 文档',
      description: 'Aura3D 三维渲染引擎使用手册',
      themeConfig: {
        nav: [{ text: '文档', link: '/home.html' }],
        sidebar: { '/': sidebar('/', '总览', docPages) },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Aura3D Docs',
      description: 'Aura3D rendering engine manual',
      themeConfig: {
        nav: [{ text: 'Docs', link: '/en/home.html' }],
        sidebar: { '/en/': sidebar('/en/', 'Overview', enDocPages) },
      },
    },
  },
  vite: {
    plugins: [{
      // 语言切换器给出目录形态的 /en/，Pages 不解析目录，所以补一个真实的 en/index.html
      name: 'aura3d-en-directory-entry',
      apply: 'build',
      closeBundle() {
        const dir = fileURLToPath(new URL('./dist/en', import.meta.url))
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), EN_DIR_ENTRY)
      },
    }],
  },
  themeConfig: {
    siteTitle: 'Aura3D',
    socialLinks: [{ icon: 'github', link: 'https://github.com/CeSun/Aura3D' }],
  },
})
