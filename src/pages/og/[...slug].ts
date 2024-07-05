import { getNotes } from '@libs/note'
import { OGImageRoute } from 'astro-og-canvas'

export const prerender = true
const notes = await getNotes()
const pages: Record<string, OgPage> = Object.fromEntries(notes.map(({ data, href }) => [href.replace(/^\//, ''), data]))

pages['index'] = { title: "Rajdeep's projects and notes" }
pages['notes'] = { title: "Rajdeep's Personal Notes" }
pages['projects'] = { title: "Rajdeep's Open Source Portfolio" }

export const { getStaticPaths, GET } = OGImageRoute({
  getImageOptions: (_, page: OgPage) => {
    const options: OGImageOptions = {
      bgGradient: [[11, 12, 14]],
      bgImage: {
        path: './src/images/og-bg.png',
      },
      border: {
        color: [11, 12, 14],
        side: 'inline-start',
        width: 20,
      },
      font: {
        description: {
          color: [213, 213, 216],
          families: ['CaskaydiaCove NF'],
          weight: 'Normal',
        },
        title: {
          color: [250, 250, 250],
          families: ['Inter'],
          lineHeight: 1.2,
          weight: 'ExtraBold',
        },
      },
      fonts: ['https://github.com/rustdevbtw/flamedocs/raw/master/src/fonts/Cas.ttf'],
      title: page.title,
    }

    if (page.description) {
      options.description = page.description
    }

    return options
  },
  pages,
  param: 'slug',
})

interface OgPage {
  title: string
  description?: string
}

type OGImageOptions = Awaited<ReturnType<Parameters<typeof OGImageRoute>[0]['getImageOptions']>>
