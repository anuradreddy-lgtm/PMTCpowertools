import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminSidebar from '../../components/admin/AdminSidebar'
import toast from 'react-hot-toast'
import { auth } from '../../lib/base44'
import { defaultSiteSettings, getSiteSettings, saveSiteSettings } from '../../lib/siteSettings'
import { supabase } from '../../lib/supabase'

export default function AdminSettings() {
  const qc = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    retry: 1,
    staleTime: 30_000,
  })
  const [form, setForm] = useState(defaultSiteSettings)
  const [cred, setCred] = useState({ currentEmail:'', currentPassword:'', newEmail:'', newPassword:'', confirmNewPassword:'' })
  const [uploading, setUploading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileName = `logos/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicData, error: publicError } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      if (publicError) throw publicError

      setForm((prev) => ({ ...prev, company_logo: publicData.publicUrl }))
      toast.success('Logo uploaded successfully!')
    } catch (err) {
      console.error('Logo upload error:', err)
      toast.error(err.message || 'Logo upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    if (settings) setForm({ ...defaultSiteSettings, ...settings })
  }, [settings])

  const saveSettings = useMutation({
    mutationFn: () => saveSiteSettings(form),
    onSuccess: () => {
      qc.invalidateQueries(['site-settings'])
      toast.success('Store settings saved successfully.')
    },
    onError: (error) => toast.error(error.message || 'Unable to save store settings.'),
  })

  const updateCredentials = useMutation({
    mutationFn: () => auth.changeCredentials(cred),
    onSuccess: () => {
      toast.success('Admin credentials updated successfully.')
      setCred({ currentEmail:'', currentPassword:'', newEmail:'', newPassword:'', confirmNewPassword:'' })
    },
    onError: (error) => toast.error(error.message || 'Unable to update admin credentials.'),
  })

  const fields = [
    ['company_name', 'Company Name'],
    ['company_logo', 'Company Logo URL / Image'],
    ['company_description', 'Company Description'],
    ['founded_year', 'Founded Year'],
    ['company_address', 'Company Address'],
    ['phone_number', 'Phone Number'],
    ['whatsapp_number', 'WhatsApp Number'],
    ['email_address', 'Email Address'],
    ['website_url', 'Website URL'],
    ['gst_number', 'GST Number'],
    ['business_hours', 'Business Hours'],
    ['google_maps_link', 'Google Maps Link'],
    ['facebook_url', 'Facebook URL'],
    ['instagram_url', 'Instagram URL'],
    ['linkedin_url', 'LinkedIn URL'],
    ['youtube_url', 'YouTube URL'],
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500 mb-8">Manage company information and admin credentials without changing the existing layout.</p>

        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8">
          <section className="card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-heading font-semibold text-gray-900">Store Management Settings</h2>
              <p className="text-sm text-gray-500">These values feed the website footer, contact page, homepage, and shared logo/navigation areas.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {fields.map(([key, label]) => (
                <div key={key} className="block text-sm text-gray-700">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</span>
                  {key === 'company_logo' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="btn-outline px-4 py-2 cursor-pointer text-xs font-semibold bg-white hover:bg-gray-50 flex items-center justify-center border rounded-lg shadow-sm">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                            disabled={uploading}
                          />
                          {uploading ? 'Uploading...' : 'Choose Logo File'}
                        </label>
                        {form.company_logo && (
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, company_logo: '' }))}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                      {form.company_logo && (
                        <div className="relative w-24 h-24 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden p-2">
                          <img src={form.company_logo} alt="Logo Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={form.company_logo ?? ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, company_logo: e.target.value }))}
                        className="input-field mt-1 text-xs text-gray-500"
                        placeholder="Or enter logo URL manually"
                      />
                    </div>
                  ) : (
                    <input
                      type={key === 'founded_year' ? 'number' : 'text'}
                      value={form[key] ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending} className="btn-primary disabled:opacity-60">{saveSettings.isPending ? 'Saving...' : 'Save Store Settings'}</button>
              <span className="text-xs text-gray-400">{isLoading ? 'Loading current settings…' : 'Changes are stored in Supabase and reflected immediately on the frontend.'}</span>
            </div>
          </section>

          <form onSubmit={e => { e.preventDefault(); updateCredentials.mutate(); }} autoComplete="off" className="card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-heading font-semibold text-gray-900">Change Admin Credentials</h2>
              <p className="text-sm text-gray-500">Verify your current credentials, then update email and/or password securely.</p>
            </div>

            <div className="space-y-4">
              {[
                ['currentEmail', 'Current Email'],
                ['currentPassword', 'Current Password'],
                ['newEmail', 'New Email (optional)'],
                ['newPassword', 'New Password (optional)'],
                ['confirmNewPassword', 'Confirm New Password'],
              ].map(([name, label]) => (
                <label key={name} className="block text-sm text-gray-700">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</span>
                  <input
                    type={name.toLowerCase().includes('password') ? (showPasswords ? 'text' : 'password') : 'email'}
                    value={cred[name]}
                    onChange={(e) => setCred((prev) => ({ ...prev, [name]: e.target.value }))}
                    className="input-field"
                    autoComplete={name.toLowerCase().includes('password') ? 'new-password' : 'new-email'}
                    placeholder={name === 'newEmail' ? 'Leave blank to keep current email' : name === 'newPassword' ? 'Leave blank to keep current password' : ''}
                  />
                </label>
              ))}
              
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="show-passwords"
                  type="checkbox"
                  checked={showPasswords}
                  onChange={e => setShowPasswords(e.target.checked)}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent/30"
                />
                <label htmlFor="show-passwords" className="text-xs text-gray-500 select-none cursor-pointer">
                  Show Passwords
                </label>
              </div>
            </div>

            <button type="submit" disabled={updateCredentials.isPending} className="btn-primary w-full disabled:opacity-60">{updateCredentials.isPending ? 'Updating...' : 'Update Credentials'}</button>
            <p className="text-xs text-gray-400">Current credentials are verified on the existing mock auth backend before any changes are applied.</p>
          </form>
        </div>
      </main>
    </div>
  )
}
