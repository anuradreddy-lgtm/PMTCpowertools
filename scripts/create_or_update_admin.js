#!/usr/bin/env node
// Script to create or update an admin user via Base44 API.
// Usage:
// API_URL=https://api.base44.com node scripts/create_or_update_admin.js
// or set EMAIL and PASSWORD env vars to override defaults.

const API_URL = process.env.API_URL || 'https://api.base44.com'
const EMAIL = process.env.EMAIL || 'pmtcpowertools@gmail.com'
const PASSWORD = process.env.PASSWORD || 'Pmtc@2017'
const FULL_NAME = process.env.FULL_NAME || 'Admin'
const PHONE = process.env.PHONE || ''

async function request(path, opts = {}) {
  const url = `${API_URL.replace(/\/$/, '')}${path}`
  const res = await fetch(url, opts)
  const text = await res.text()
  try { return { ok: res.ok, status: res.status, body: JSON.parse(text) } }
  catch { return { ok: res.ok, status: res.status, body: text } }
}

async function createAdmin() {
  console.log('Using API URL:', API_URL)
  console.log('Attempting to provision admin:', EMAIL)

  // Try admin-only provisioning
  const reg = await request('/api/admin/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, full_name: FULL_NAME, phone: PHONE, is_admin: true })
  })

  if (reg.ok) {
    console.log('Admin created successfully.')
    console.log(reg.body)
    return
  }

  console.log('Provisioning failed:', reg.status, reg.body)
  console.log('Trying to locate existing user and update password...')

  // Try to list users by email
  const list = await request(`/api/entities/User?email=${encodeURIComponent(EMAIL)}`)
  if (!list.ok) {
    console.error('Failed to query users:', list.status, list.body)
    process.exit(1)
  }

  const users = Array.isArray(list.body) ? list.body : (list.body?.data || [])
  if (!users || users.length === 0) {
    console.error('No user found with that email. Manual backend update required.')
    process.exit(1)
  }

  const user = users[0]
  const id = user.id || user._id || user.user_id
  if (!id) {
    console.error('Could not determine user id from response:', user)
    process.exit(1)
  }

  // Attempt update — many APIs may not allow direct password updates like this; if so, use backend admin tools.
  const upd = await request(`/api/entities/User/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD, is_admin: true })
  })

  if (upd.ok) {
    console.log('User updated successfully.')
    console.log(upd.body)
  } else {
    console.error('Failed to update user password:', upd.status, upd.body)
    console.error('If this fails, you need to update the password directly in the backend or database.')
    process.exit(1)
  }
}

createAdmin().catch(err => { console.error(err); process.exit(1) })
