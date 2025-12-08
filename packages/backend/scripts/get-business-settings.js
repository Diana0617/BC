// packages/backend/scripts/get-business-settings.js
const { Pool } = require('pg')
require('dotenv').config({ path: __dirname + '/../.env' })

const businessId = process.argv[2] || '5c4f4c1a-62d4-4c61-9a89-ee8e33585fc7'

;(async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const res = await pool.query('SELECT id, settings FROM businesses WHERE id = $1', [businessId])
    console.log(JSON.stringify(res.rows[0], null, 2))
  } catch (err) {
    console.error('Query error:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
})()
