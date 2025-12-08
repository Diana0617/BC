// Update business settings with test rules for specialist workflow
const { Pool } = require('pg')
require('dotenv').config({ path: __dirname + '/../.env' })

const businessId = process.argv[2] || process.env.TEST_BUSINESS_ID
if (!businessId) {
  console.error('Usage: node set-test-business-rules.js <businessId> OR set TEST_BUSINESS_ID in .env')
  process.exit(1)
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beauty_control_dev'
})

const rules = {
  businessRules: {
    allowCloseWithoutPayment: false,
    requiresConsent: true,
    requiresManagerApproval: false
  }
}

;(async () => {
  try {
    const res = await pool.query(
      `UPDATE businesses
       SET settings = COALESCE(settings, '{}'::jsonb) || $1::jsonb
       WHERE id = $2
       RETURNING id, settings`,
      [JSON.stringify(rules), businessId]
    )

    if (res.rowCount === 0) {
      console.error('No business updated - check businessId')
      process.exit(2)
    }

    console.log('Updated business:', res.rows[0])
  } catch (err) {
    console.error('Error updating business rules:', err)
    process.exit(3)
  } finally {
    await pool.end()
  }
})()
