import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import PageShell from '@/components/PageShell'
import PageHead from '@/components/PageHead'
import TrackPlayButton from '@/components/TrackPlayButton'
import { Link } from '@/i18n/navigation'
import { demos, ep1, tracks, trackBySlug } from '@/lib/content'
import { hasAudio } from '@/lib/audio.server'
import { alternatesFor } from '@/lib/seo'
import { ogLocale } from '@/i18n/routing'

export const dynamicParams = false

export function generateStaticParams() {
  return tracks.map((track) => ({ slug: track.slug }))
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params
  const track = trackBySlug(slug)
  if (!track) return {}

  const t = await getTranslations({ locale, namespace: 'track' })
  const tTracks = await getTranslations({ locale, namespace: 'tracks' })
  const description = tTracks.has(`${slug}.note`)
    ? tTracks(`${slug}.note`)
    : t('metaDescription', { title: track.title })

  const alternates = alternatesFor(`/sons/${track.slug}`, locale)

  return {
    title: track.title,
    description,
    alternates,
    openGraph: {
      title: `${track.title} — Garden Psychedelia`,
      description,
      url: alternates.canonical,
      locale: ogLocale[locale],
      images: track.cover ? [track.cover] : undefined,
    },
  }
}

export default async function TrackDetail({ params }) {
  const { slug } = await params
  const track = trackBySlug(slug)
  if (!track) notFound()

  const t = await getTranslations('track')
  const tTracks = await getTranslations('tracks')
  const tMusic = await getTranslations('music')
  const tCommon = await getTranslations('common')

  const meta = [track.year, track.type].filter(Boolean).join(' · ')

  // "Ver outros sons": agrupado por origem. Cada faixa aparece em um grupo só,
  // com prioridade Spotify > EP 1 > estúdio.
  const notThis = (item) => item.slug !== track.slug
  const onSpotify = tracks.filter((item) => notThis(item) && item.spotifyTrackId)
  const spotifySlugs = new Set(onSpotify.map((item) => item.slug))
  const inEp1 = ep1.filter(
    (item) => notThis(item) && !spotifySlugs.has(item.slug) && hasAudio(item),
  )
  const inStudio = demos.filter(
    (item) => notThis(item) && !spotifySlugs.has(item.slug) && hasAudio(item),
  )

  const otherGroups = [
    {
      key: 'spotify',
      title: t('onSpotify'),
      hint: t('listenFull'),
      items: onSpotify,
    },
    { key: 'ep1', title: 'EP 1', hint: t('previewAvailable'), items: inEp1 },
    {
      key: 'studio',
      title: t('inStudio'),
      hint: t('noFinalMix'),
      items: inStudio,
    },
  ].filter((g) => g.items.length > 0)

  const totalOthers = otherGroups.reduce((n, g) => n + g.items.length, 0)

  const playButton = hasAudio(track) ? (
    <TrackPlayButton
      track={{
        slug: track.slug,
        title: track.title,
        type: track.type,
        audio: track.audio,
      }}
    />
  ) : null

  return (
    <PageShell>
      <Link
        href="/sons"
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted no-underline transition-colors duration-200 hover:text-accent"
      >
        <span aria-hidden="true">←</span> {t('backToMusic')}
      </Link>

      <div className="sm:flex sm:items-start sm:justify-between sm:gap-8">
        <div>
          <PageHead eyebrow={`03 — ${tMusic('meta.title')} / ${track.title}`}>
            {track.title}
          </PageHead>
          {meta && <p className="kicker -mt-6 mb-6 sm:mb-0">{meta}</p>}
        </div>
        {playButton && (
          <div className="mb-14 flex sm:mb-0 sm:shrink-0 sm:pt-8">
            {playButton}
          </div>
        )}
      </div>

      <div className="hidden sm:block sm:h-14" aria-hidden="true" />

      <article className="mb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {track.cover && (
          <figure>
            <img
              src={track.cover}
              alt={tCommon('coverOf', { title: track.title })}
              className="aspect-square w-full object-cover"
            />
            {tTracks.has(`${track.slug}.coverCredit`) && (
              <figcaption className="mt-2.5 font-mono text-xs uppercase tracking-widest text-muted">
                {tTracks(`${track.slug}.coverCredit`)}
              </figcaption>
            )}
          </figure>
        )}
        <div className={track.cover ? '' : 'lg:col-span-2'}>
          {tTracks.has(`${track.slug}.note`) && (
            <p className="my-3 max-w-prose leading-relaxed text-copy">
              {tTracks(`${track.slug}.note`)}
            </p>
          )}
          {track.plays && (
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-accent">
              {tCommon('plays', { count: track.plays })}
            </p>
          )}
          {track.spotifyTrackId && (
            <a
              href={`https://open.spotify.com/track/${track.spotifyTrackId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-fg px-6 py-3 font-mono text-xs font-medium uppercase tracking-widest no-underline transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-bg"
            >
              {t('listenSpotify')}
            </a>
          )}
        </div>
      </article>

      {track.lyrics && (
        <section className="border-t border-line pt-8">
          <h2 className="mb-6 font-extrabold tracking-tighter text-3xl md:text-4xl">
            {t('lyrics')}
          </h2>
          <p className="max-w-prose whitespace-pre-line leading-relaxed text-copy">
            {track.lyrics}
          </p>
        </section>
      )}

      {otherGroups.length > 0 && (
        <section className="mt-20 border-t border-line pt-8">
          <div className="mb-10 flex items-baseline justify-between gap-4">
            <h2 className="font-extrabold tracking-tighter text-3xl md:text-4xl">
              {t('seeOther')}
            </h2>
            <p className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted">
              {tMusic('tracksCount', { count: totalOthers })} ·{' '}
              {t('sourcesCount', { count: otherGroups.length })}
            </p>
          </div>

          <div className="space-y-12">
            {otherGroups.map((g) => (
              <div key={g.key}>
                {/* Cabeçalho do grupo — glifo + rótulo + régua + dica */}
                <div className="mb-2 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={[
                      'h-2 w-2 shrink-0 rounded-full',
                      g.key === 'spotify'
                        ? 'bg-accent'
                        : g.key === 'ep1'
                          ? 'border border-muted'
                          : 'border border-dashed border-muted',
                    ].join(' ')}
                  />
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase tracking-widest ${
                      g.key === 'spotify' ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {g.title}
                  </span>
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted">
                    {g.hint}
                  </span>
                </div>

                <ul>
                  {g.items.map((item) => (
                    <li
                      key={item.slug}
                      className="border-t border-line first:border-t-0 last:border-b"
                    >
                      <Link
                        href={`/sons/${item.slug}`}
                        className="group flex items-baseline gap-2.5 py-5 no-underline"
                      >
                        <span className="truncate font-display font-semibold leading-tight text-lg tracking-tight text-fg transition-colors group-hover:text-accent">
                          {item.title}
                        </span>

                        {g.key === 'spotify' && item.featured && (
                          <span className="shrink-0 rounded-full border border-accent px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-accent">
                            {t('newRelease')}
                          </span>
                        )}
                        {g.key === 'ep1' && (
                          <span className="shrink-0 rounded-full border border-line px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
                            {t('unreleased')}
                          </span>
                        )}
                        {g.key === 'studio' && (
                          <span className="shrink-0 rounded-full border border-line px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
                            Demo
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
