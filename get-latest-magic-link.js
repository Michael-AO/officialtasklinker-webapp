/**
 * Get Latest Magic Link from Database
 * Useful for testing when you can't access the email
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getLatestMagicLink() {
  try {
    console.log('\n🔍 Fetching latest magic links from database...\n')

    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error fetching magic links:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log('ℹ️  No unused magic links found in the database')
      console.log('   Run the test script first to generate a magic link:')
      console.log('   node test-magic-link.js\n')
      return
    }

    console.log(`Found ${data.length} unused magic link(s):\n`)

    data.forEach((link, index) => {
      // Use the correct port - check .env.local or default to 3003
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'
      const verificationUrl = `${appUrl}/api/auth/verify-magic-link?token=${link.token}&user_type=${link.user_type}`
      
      const expiresAt = new Date(link.expires_at)
      const isExpired = expiresAt < new Date()
      const status = isExpired ? '❌ EXPIRED' : '✅ VALID'

      console.log('='.repeat(80))
      console.log(`Magic Link #${index + 1} ${status}`)
      console.log('='.repeat(80))
      console.log(`📧 Email:        ${link.email}`)
      console.log(`👤 User Type:    ${link.user_type}`)
      console.log(`🔐 Type:         ${link.type}`)
      console.log(`⏰ Created:      ${new Date(link.created_at).toLocaleString()}`)
      console.log(`⏰ Expires:      ${expiresAt.toLocaleString()}`)
      console.log(`\n🔗 VERIFICATION URL:`)
      console.log(verificationUrl)
      console.log('='.repeat(80) + '\n')
    })

    console.log('💡 Copy one of the URLs above and paste it in your browser to test\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

getLatestMagicLink()

