import { useQuery } from '@tanstack/react-query'
import logo from '../../assets/pmtc-logo.png'
import { getSiteSettings } from '../../lib/siteSettings'

export default function CompanyLogo({ className = '', alt = 'PMTC - Padma Mitra Trading Company' }) {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    retry: 1,
    staleTime: 60_000,
  })

  return (
    <img
      src={settings?.company_logo || logo}
      alt={alt || settings?.company_name || 'PMTC Trading Company'}
      className={`block max-w-full object-contain ${className}`}
    />
  )
}
