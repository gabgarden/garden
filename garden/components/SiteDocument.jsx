import { IBM_Plex_Mono, Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { NextIntlClientProvider } from 'next-intl'
import { ACTIVE_THEME } from '@/lib/theme'
import { htmlLang } from '@/i18n/routing'
import SiteChrome from './SiteChrome'
import '@/app/globals.css'

// Documento completo do site. Vive fora do layout porque o not-found raiz
// (rotas desconhecidas, fora do segmento [locale]) também precisa dele.

// Duas famílias, self-hosted via next/font:
//   Syne          — títulos, marca, corpo
//   IBM Plex Mono — rótulos, eyebrows, legendas (uppercase + tracking)
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export default function SiteDocument({ locale, messages, children }) {
  return (
    <html
      lang={htmlLang[locale]}
      data-theme={ACTIVE_THEME}
      className={`${syne.variable} ${plexMono.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteChrome>{children}</SiteChrome>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
