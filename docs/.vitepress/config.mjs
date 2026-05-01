import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { withMermaid } from 'vitepress-plugin-mermaid';

const vitePressSidebarOptions = {
  documentRootPath: 'src',
  useFolderLinkFromIndexFile: false,
  useFolderTitleFromIndexFile: true,
  useTitleFromFileHeading: true,
  useTitleFromFrontmatter: true,
  collapseDepth: 2,
  sortMenusByFrontmatterOrder: true,
  manualSortFileNameByPriority: ['introduction', 'concept', 'tutorial', 'reference'],
  frontmatterTitleFieldName: 'sidebar',
  capitalizeFirst: false,
  hyphenToSpace: true,
  excludePattern: ['create_node_reference_markdown_output.md', 'create_node_reference_markdown_output_px4.md']
}

export default withMermaid(defineConfig({
  base: '/docs/',
  title: "AutoAPMS Studio",
  description: "AutoAPMS BehaviorTree Builder",
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/autoapms_studio_icon.svg' }],
  ],
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(tabsMarkdownPlugin)
    }
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ]
  },
  themeConfig: {
    search: {
      provider: "local",
    },
    logo: '/autoapms_studio_icon.svg',
    footer: {
      message: "Released under the Apache-2.0 License.",
      copyright: "Copyright © 2025 - Present AutoAPMS Studio Team",
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Live Demo', link: 'https://auto-apms-studio-d50829.pages.git-ce.rwth-aachen.de/' },
      { text: 'User Guide', link: '/user-guide/introduction/introduction' },
      //{ text: 'API Docs', link: '/api-docs/introduction' } - TODO: List again once polished
    ],

    sidebar: {
      '/user-guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is AutoAPMS Studio?', link: '/user-guide/introduction/introduction' },
            { text: 'Installation', link: '/user-guide/introduction/installation' },
            { text: 'Getting Started', link: '/user-guide/introduction/getting-started' },
          ]
        },
        {
          text: 'Concepts',
          items: [
            { text: 'Core Concepts', link: '/user-guide/concepts/core-concepts' },
            { text: 'Workflows', link: '/user-guide/concepts/workflows' },
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'XML Format', link: '/user-guide/reference/xml-format' },
            { text: 'Troubleshooting', link: '/user-guide/reference/troubleshooting' },
          ]
        }
      ],
      '/api-docs/': [
        {
          text: 'Overview',
          items: [
            { text: 'Introduction', link: '/api-docs/introduction' },
            { text: 'Architecture', link: '/api-docs/architecture' },
            { text: 'Project Structure', link: '/api-docs/structure' },
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'REST API', link: '/api-docs/api/rest' },
            { text: 'WebSocket', link: '/api-docs/api/websocket' },
          ]
        },
        {
          text: 'Guides',
          items: [
            { text: 'Migrating from Groot2', link: '/api-docs/guides/groot2-migration' },
            { text: 'Importing Node Models', link: '/api-docs/guides/importing-node-models' },
          ]
        },
        {
          text: 'Contributing',
          items: [
            { text: 'Dev Setup', link: '/api-docs/contributing/dev-setup' },
            { text: 'Guidelines', link: '/api-docs/contributing/guidelines' },
            { text: 'How to Contribute', link: '/api-docs/contributing/contributing' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AutoAPMS/auto_apms_studio' }
    ]
  }
}))