// Astro-related imports
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { astroExpressiveCode } from 'astro-expressive-code'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkDirective from 'remark-directive'

// Local imports
import { remarkAdmonitions } from './src/libs/remark'

// https://astro.build/config
export default defineConfig({
  integrations: [astroExpressiveCode(), mdx(), sitemap()],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
        },
      ],
    ],
    remarkPlugins: [remarkDirective, remarkAdmonitions],
    syntaxHighlight: false,
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  site: 'https://rajdeepm.xyz',
  output: 'static',
})
