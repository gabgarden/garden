import { useTranslations } from 'next-intl'
import PageShell from './PageShell'
import PageHead from './PageHead'
import { Link } from '@/i18n/navigation'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <PageShell>
      <PageHead eyebrow={t('eyebrow')}>{t('headline')}</PageHead>
      <Link
        href="/"
        className="inline-block border border-fg px-4 py-3 text-xs uppercase tracking-widest no-underline transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-bg"
      >
        {t('backHome')}
      </Link>
    </PageShell>
  )
}
