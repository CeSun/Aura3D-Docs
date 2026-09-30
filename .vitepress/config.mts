import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { sidebar } from '../tools/pages.mjs'

const contentDir = (sub: string) => fileURLToPath(new URL(`../content${sub}`, import.meta.url))

// 板块顺序与中英标签的真源：主仓库 doc/sections.json，由 assemble 拷进 content/
const sectionsRoot = contentDir('')

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
        sidebar: { '/': sidebar({ dir: contentDir(''), sectionsRoot, base: '/', overview: '总览', lang: 'zh' }) },
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
        sidebar: { '/en/': sidebar({ dir: contentDir('/en'), sectionsRoot, base: '/en/', overview: 'Overview', lang: 'en' }) },
      },
    },
  },
  themeConfig: {
    siteTitle: 'Aura3D',
    socialLinks: [{ icon: 'github', link: 'https://github.com/CeSun/Aura3D' }],
  },
})
