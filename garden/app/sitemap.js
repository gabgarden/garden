import { tracks } from '@/lib/content'
import { siteUrl } from '@/lib/site'
import { getPathname } from '@/i18n/navigation'
import { hreflang, routing } from '@/i18n/routing'

const hrefs = [
  '/',
  '/banda',
  '/shows',
  '/sons',
  '/contato',
  ...tracks.map((track) => `/sons/${track.slug}`),
]

const urlFor = (locale, href) => `${siteUrl}${getPathname({ locale, href })}`

export default function sitemap() {
  return routing.locales.flatMap((locale) =>
    hrefs.map((href) => ({
      url: urlFor(locale, href),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: href === '/' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((item) => [hreflang[item], urlFor(item, href)]),
        ),
      },
    })),
  )
}
