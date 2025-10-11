#!/usr/bin/env node

/**
 * Test script for new Supabase Auth OTP system
 * Run: node test-new-auth.js
 */

const BASE_URL = 'http://localhost:3000'

console.log('🧪 Testing New Supabase Auth OTP System\n')
console.log('=' .repeat(60))

async function testSystem() {
  let allPassed = true

  // Test 1: Check if login page loads
  console.log('\n📱 TEST 1: Login Page Loads')
  try {
    const response = await fetch(`${BASE_URL}/login`)
    if (response.ok) {
      console.log('✅ PASS - Login page accessible')
    } else {
      console.log(`❌ FAIL - Status: ${response.status}`)
      allPassed = false
    }
  } catch (error) {
    console.log('❌ FAIL - Server not running')
    console.log(`   Error: ${error.message}`)
    console.log('\n💡 Start server with: npm run dev')
    process.exit(1)
  }

  // Test 2: Check if signup page loads
  console.log('\n📝 TEST 2: Signup Page Loads')
  try {
    const response = await fetch(`${BASE_URL}/signup`)
    if (response.ok) {
      console.log('✅ PASS - Signup page accessible')
    } else {
      console.log(`❌ FAIL - Status: ${response.status}`)
      allPassed = false
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`)
    allPassed = false
  }

  // Test 3: Check if auth callback page loads
  console.log('\n🔗 TEST 3: Auth Callback Page Loads')
  try {
    const response = await fetch(`${BASE_URL}/auth/callback`)
    if (response.ok) {
      console.log('✅ PASS - Callback page accessible')
    } else {
      console.log(`❌ FAIL - Status: ${response.status}`)
      allPassed = false
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`)
    allPassed = false
  }

  // Test 4: Check if dashboard redirects when not logged in
  console.log('\n🔒 TEST 4: Protected Route Redirects')
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      redirect: 'manual'
    })
    if (response.status === 307 || response.status === 302) {
      const location = response.headers.get('location')
      if (location && location.includes('/login')) {
        console.log('✅ PASS - Dashboard redirects to login')
      } else {
        console.log(`❌ FAIL - Unexpected redirect: ${location}`)
        allPassed = false
      }
    } else if (response.status === 200) {
      console.log('⚠️  WARNING - Dashboard accessible without auth')
      console.log('   This might be OK if you have a public landing page')
    } else {
      console.log(`❌ FAIL - Unexpected status: ${response.status}`)
      allPassed = false
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`)
    allPassed = false
  }

  // Test 5: Check if Supabase client is configured
  console.log('\n⚙️  TEST 5: Environment Variables')
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (hasSupabaseUrl) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set')
  } else {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL not found (check .env.local)')
  }
  
  if (hasSupabaseKey) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set')
  } else {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found (check .env.local)')
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('\n✅ Your authentication system is ready to test manually:')
    console.log('\n1. Go to http://localhost:3000/signup')
    console.log('2. Fill in the form and submit')
    console.log('3. Check your email for a 6-digit code')
    console.log('4. Enter the code to complete signup')
    console.log('\n📚 Read NEW_AUTH_SETUP_GUIDE.md for full instructions')
  } else {
    console.log('\n⚠️  SOME TESTS FAILED')
    console.log('\nPlease check:')
    console.log('1. Server is running (npm run dev)')
    console.log('2. All new files are in place')
    console.log('3. No console errors in terminal')
  }
  
  console.log()
}

testSystem().catch(console.error)

