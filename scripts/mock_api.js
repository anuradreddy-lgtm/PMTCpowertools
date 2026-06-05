#!/usr/bin/env node
// Simple mock API to emulate Base44 auth for local development
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

let users = []
let idCounter = 1
const entityStores = {
  Product: [],
  Category: [],
  Brand: [],
  Order: [],
  OrderItem: [],
  Notification: [],
  Setting: [],
}

function normalizeEntityName(name = '') {
  return String(name || '').trim().charAt(0).toUpperCase() + String(name || '').trim().slice(1).toLowerCase()
}

function getEntityStore(name) {
  const key = normalizeEntityName(name)
  if (!entityStores[key]) {
    entityStores[key] = []
  }
  return entityStores[key]
}

function applyFilters(items, query) {
  return items.filter((item) => {
    return Object.entries(query).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true
      if (typeof value === 'string' && value === 'true') return Boolean(item[key]) === true
      if (typeof value === 'string' && value === 'false') return Boolean(item[key]) === false
      if (typeof value === 'number' || typeof value === 'boolean') return item[key] === value
      return String(item[key] ?? '').toLowerCase().includes(String(value).toLowerCase())
    })
  })
}

// Seed default admin
;(async function seed() {
  const email = process.env.EMAIL || 'pmtcpowertools@gmail.com'
  const password = process.env.PASSWORD || 'naveen'
  const hashed = await bcrypt.hash(password, 10)
  users.push({ id: String(idCounter++), email, password_hash: hashed, is_admin: true, full_name: 'Admin' })
})()

function findByEmail(email) {
  return users.find(u => u.email === email)
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' })
  const user = findByEmail(email)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
  return res.json({ token: 'mock-token-' + user.id, user: { id: user.id, email: user.email, is_admin: user.is_admin, full_name: user.full_name } })
})

// Local development helper for provisioning admin accounts only.
app.post('/api/admin/setup', async (req, res) => {
  const { email, password, full_name, phone, is_admin } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' })
  if (findByEmail(email)) return res.status(409).json({ message: 'User exists' })
  const hashed = await bcrypt.hash(password, 10)
  if (is_admin !== true) return res.status(403).json({ message: 'Admin accounts only' })
  const user = { id: String(idCounter++), email, password_hash: hashed, is_admin: true, full_name: full_name || '' }
  users.push(user)
  return res.json({ token: 'mock-token-' + user.id, user: { id: user.id, email: user.email, is_admin: user.is_admin, full_name: user.full_name } })
})

// List users: /api/entities/User?email=...
app.post('/api/auth/change-credentials', async (req, res) => {
  const { currentEmail, currentPassword, newEmail, newPassword, confirmNewPassword } = req.body || {}

  if (!currentEmail || !currentPassword) {
    return res.status(400).json({ message: 'Current email and password are required.' })
  }

  const user = findByEmail(currentEmail)
  if (!user) return res.status(401).json({ message: 'Current credentials are invalid.' })

  const ok = await bcrypt.compare(currentPassword, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'Current credentials are invalid.' })

  if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return res.status(400).json({ message: 'Please enter a valid new email address.' })
  }

  if (newPassword || confirmNewPassword) {
    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'Please provide both new password and confirmation.' })
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' })
    }
  }

  if (newEmail && newEmail !== user.email && findByEmail(newEmail)) {
    return res.status(409).json({ message: 'That email is already in use.' })
  }

  if (newEmail) user.email = newEmail
  if (newPassword) user.password_hash = await bcrypt.hash(newPassword, 10)

  return res.json({
    ok: true,
    message: 'Admin credentials updated successfully.',
    user: { id: user.id, email: user.email, is_admin: user.is_admin, full_name: user.full_name },
  })
})

app.get('/api/entities/User', (req, res) => {
  const { email } = req.query
  if (email) {
    const found = users.filter(u => u.email === email)
    return res.json(found.map(u => ({ id: u.id, email: u.email, is_admin: u.is_admin, full_name: u.full_name })))
  }
  return res.json(users.map(u => ({ id: u.id, email: u.email, is_admin: u.is_admin, full_name: u.full_name })))
})

// Update user: PUT /api/entities/User/:id
app.put('/api/entities/User/:id', async (req, res) => {
  const { id } = req.params
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ message: 'Not found' })
  const body = req.body || {}
  if (body.password) {
    user.password_hash = await bcrypt.hash(body.password, 10)
  }
  if (body.is_admin !== undefined) user.is_admin = !!body.is_admin
  if (body.full_name !== undefined) user.full_name = body.full_name
  return res.json({ id: user.id, email: user.email, is_admin: user.is_admin, full_name: user.full_name })
})

app.get('/api/entities/:entityName', (req, res) => {
  const store = getEntityStore(req.params.entityName)
  const items = applyFilters(store, req.query)
  return res.json(items)
})

app.get('/api/entities/:entityName/:id', (req, res) => {
  const store = getEntityStore(req.params.entityName)
  const item = store.find(entry => String(entry.id) === String(req.params.id))
  if (!item) return res.status(404).json({ message: 'Not found' })
  return res.json(item)
})

app.post('/api/entities/:entityName', (req, res) => {
  const store = getEntityStore(req.params.entityName)
  const body = req.body || {}
  const item = {
    id: body.id ?? String(Date.now()),
    ...body,
    created_at: body.created_at ?? new Date().toISOString(),
    updated_at: body.updated_at ?? new Date().toISOString(),
  }
  store.push(item)
  return res.status(201).json(item)
})

app.put('/api/entities/:entityName/:id', (req, res) => {
  const store = getEntityStore(req.params.entityName)
  const index = store.findIndex(entry => String(entry.id) === String(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Not found' })
  store[index] = {
    ...store[index],
    ...req.body,
    id: String(req.params.id),
    updated_at: new Date().toISOString(),
  }
  return res.json(store[index])
})

app.delete('/api/entities/:entityName/:id', (req, res) => {
  const store = getEntityStore(req.params.entityName)
  const index = store.findIndex(entry => String(entry.id) === String(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Not found' })
  const [removed] = store.splice(index, 1)
  return res.json(removed)
})

// Configure nodemailer transporter - use Ethereal for development if Gmail credentials unavailable
let transporter = null

;(async function setupMailer() {
  const hasGmailCreds = process.env.EMAIL_USER && process.env.EMAIL_PASS

  if (hasGmailCreds) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
    console.log('📧 Configured Gmail transporter using environment variables')
  } else {
    // Use Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
    console.log('📧 Using Ethereal test email account for development')
    console.log('Test account email:', testAccount.user)
    console.log('Test account password: (hidden)')
  }

  // Verify transporter connection
  try {
    await transporter.verify()
    console.log('✅ Mail transporter verified and ready')
  } catch (error) {
    console.error('❌ Mail transporter verification failed:', error && error.message ? error.message : error)
  }
})()

// Contact form submission: POST /api/contact
app.post('/api/contact', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({ message: 'Email service is not initialized. Please try again in a moment.' })
    }
    
    const { name, email, phone, message } = req.body || {}
    
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    const submissionTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@pmtc-trading.com',
      to: 'pmtcpowertools@gmail.com',
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #1f2937;">New Contact Form Submission</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 10px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Submission Date/Time:</strong> ${submissionTime}</p>
            <hr style="border: none; border-top: 1px solid #d1d5db; margin: 15px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">This is an automated email from PMTC Trading Portal contact form.</p>
        </div>
      `
    }
    
    console.log(`➡️ Attempting to send email to ${mailOptions.to} (from ${mailOptions.from})`)
    console.log(`   Subject: ${mailOptions.subject}`)
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email send succeeded:', info.messageId)

    // For test accounts, provide preview URL
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_PASS) {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) console.log('🔗 Preview URL:', previewUrl)
    }
    
    return res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('❌ Error sending email:', error.message)
    return res.status(500).json({ message: 'Failed to send email. Please try again later.' })
  }
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log('Mock API listening on port', port))
