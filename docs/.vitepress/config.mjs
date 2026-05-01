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
  base: '/auto_apms_studio/docs/',
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
      { text: 'Live Demo', link: 'https://autoapms.github.io/auto_apms_studio/' },
      { text: 'User Guide', link: '/user-guide/introduction/introduction' },
      { text: 'Dev Guide', link: '/dev-guide/introduction' }
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
      '/dev-guide/': [
        {
          text: 'Overview',
          items: [
            { text: 'Introduction', link: '/dev-guide/introduction' },
            { text: 'Architecture', link: '/dev-guide/architecture' },
            { text: 'Project Structure', link: '/dev-guide/structure' },
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'REST API', link: '/dev-guide/api/rest' },
            { text: 'WebSocket', link: '/dev-guide/api/websocket' },
          ]
        },
        {
          text: 'Guides',
          items: [
            { text: 'Migrating from Groot2', link: '/dev-guide/guides/groot2-migration' },
            { text: 'Importing Node Models', link: '/dev-guide/guides/importing-node-models' },
          ]
        },
        {
          text: 'Contributing',
          items: [
            { text: 'Dev Setup', link: '/dev-guide/contributing/dev-setup' },
            { text: 'Guidelines', link: '/dev-guide/contributing/guidelines' },
            { text: 'How to Contribute', link: '/dev-guide/contributing/contributing' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AutoAPMS/auto_apms_studio' }
    ]
  }
}))