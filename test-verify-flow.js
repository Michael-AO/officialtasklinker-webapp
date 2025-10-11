/**
 * Test Magic Link Verification Flow
 * Tests the complete flow from sending to verification
 */

const API_BASE_URL = 'http://localhost:3003'

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

async function testCompleteFlow() {
  console.clear()
  log('╔══════════════════════════════════════════════╗', colors.cyan)
  log('║   Testing Magic Link Verification Flow      ║', colors.cyan)
  log('╚══════════════════════════════════════════════╝\n', colors.cyan)

  try {
    // Step 1: Send magic link
    log('Step 1: Sending magic link...', colors.cyan)
    const sendResponse = await fetch(`${API_BASE_URL}/api/auth/send-magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        user_type: 'freelancer',
        type: 'signup',
      }),
    })

    const sendData = await sendResponse.json()
    console.log('Send Response:', JSON.stringify(sendData, null, 2))

    if (!sendData.success) {
      log('❌ Failed to send magic link', colors.red)
      return
    }

    log('✅ Magic link sent successfully\n', colors.green)

    // Step 2: Get the token from database (we need to query it)
    log('Step 2: Retrieving token from database...', colors.cyan)
    log('⚠️  In production, you would click the link in your email', colors.yellow)
    log('⚠️  For testing, we need to query the database or check server logs\n', colors.yellow)

    // We can't easily get the token, so let's check if the email service logs it
    log('📧 Check your console/terminal running Next.js for the verification URL', colors.cyan)
    log('📧 Look for a line like: "Magic Link Verification URL: http://..."', colors.cyan)
    log('\nThe URL should look like:', colors.cyan)
    log('http://localhost:3003/api/auth/verify-magic-link?token=...&user_type=freelancer\n', colors.yellow)

    // Test session endpoint
    log('Step 3: Checking current session...', colors.cyan)
    const sessionResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
    })

    const sessionData = await sessionResponse.json()
    console.log('Session Response:', JSON.stringify(sessionData, null, 2))

    if (sessionData.success && sessionData.user) {
      log('✅ User is authenticated!', colors.green)
      log(`   Email: ${sessionData.user.email}`, colors.green)
      log(`   User Type: ${sessionData.user.user_type}`, colors.green)
    } else {
      log('ℹ️  No active session (expected before clicking link)', colors.cyan)
    }

    log('\n' + '='.repeat(50), colors.cyan)
    log('NEXT STEPS:', colors.cyan)
    log('='.repeat(50), colors.cyan)
    log('1. Check the terminal running "npm run dev" for the magic link URL', colors.yellow)
    log('2. Copy the full URL and paste it in your browser', colors.yellow)
    log('3. You should be redirected to /dashboard', colors.yellow)
    log('4. Run this script again to verify your session is active\n', colors.yellow)

  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red)
    console.error(error)
  }
}

testCompleteFlow()

