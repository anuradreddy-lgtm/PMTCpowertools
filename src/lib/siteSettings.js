import { supabase } from './supabase'

export const defaultSiteSettings = {
  company_name: 'PMTC Trading Company',
  company_logo: '',
  company_description: 'Authorised dealer of premium industrial tools and machinery. Serving contractors, factories, and professionals across India since 2017.',
  founded_year: 2017,
  company_address: 'D. No 8-24-19/1, Miriyala Vaari Street, Near Ratna Palace, Main Road, Rajamahendravaram - 533101',
  phone_number: '6281778963',
  whatsapp_number: '6281778963',
  email_address: 'pmtcpowertools@gmail.com',
  website_url: '',
  gst_number: '36AABCP1234M1Z5',
  business_hours: 'Mon–Sat, 9AM–6PM',
  google_maps_link: 'https://www.google.com/maps/search/D.+No+8-24-19%2F1,+Miriyala+Vaari+Street,+Near+Ratna+Palace,+Main+Road,+Rajamahendravaram+-+533101',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: '',
}

const siteSettingColumns = Object.keys(defaultSiteSettings)

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw new Error(error.message || 'Failed to load site settings')

  if (!data) {
    return defaultSiteSettings
  }

  // If the schema uses the JSONB settings column
  if (data.settings !== undefined && data.settings !== null) {
    return {
      ...defaultSiteSettings,
      ...data.settings,
    }
  }

  // Otherwise, fallback to the flat column schema
  return {
    ...defaultSiteSettings,
    ...data,
  }
}

export async function saveSiteSettings(settings) {
  // Check if "settings" column exists in the site_settings table structure
  const { error: columnError } = await supabase
    .from('site_settings')
    .select('settings')
    .limit(1)

  const hasSettingsColumn = !columnError || (columnError.code !== '42703' && !columnError.message.includes('does not exist'))

  let payload = {}

  if (hasSettingsColumn) {
    // Schema with JSONB settings column
    const settingsObject = siteSettingColumns.reduce((acc, key) => {
      if (settings[key] !== undefined) acc[key] = settings[key]
      return acc
    }, {})

    payload = {
      id: 1,
      settings: settingsObject,
      updated_at: new Date().toISOString(),
    }
  } else {
    // Flat columns schema
    payload = siteSettingColumns.reduce((acc, key) => {
      if (settings[key] !== undefined) acc[key] = settings[key]
      return acc
    }, {
      id: 1,
      updated_at: new Date().toISOString(),
    })
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'id' })

  if (error) throw new Error(error.message || 'Failed to save site settings')

  return payload
}
