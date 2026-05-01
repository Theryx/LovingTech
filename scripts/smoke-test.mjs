/**
 * Post-deploy smoke test
 *
 * Usage:
 *   node scripts/smoke-test.mjs [baseUrl]
 *
 * Default baseUrl: https://loving-tech.vercel.app
 *
 * Run after every deploy to verify critical paths work.
 * Exits with code 1 if any check fails.
 */

const BASE_URL = process.argv[2] || 'https://loving-tech.vercel.app'

const CHECKS = [
  { name: 'Home page', path: '/', expectStatus: 200 },
  { name: 'Products listing', path: '/products', expectStatus: 200 },
  { name: 'Admin login page', path: '/admin/login', expectStatus: 200 },
  { name: 'Health endpoint', path: '/api/health', expectStatus: 200 },
  { name: 'API products', path: '/api/products', expectStatus: 200 },
]

let failures = 0

for (const check of CHECKS) {
  try {
    const res = await fetch(`${BASE_URL}${check.path}`)
    if (res.status === check.expectStatus) {
      console.log(`  OK    ${check.name}`)
    } else {
      console.log(`  FAIL  ${check.name} — expected ${check.expectStatus}, got ${res.status}`)
      failures++
    }
  } catch (err) {
    console.log(`  FAIL  ${check.name} — ${err.message}`)
    failures++
  }
}

// Health endpoint deep check
try {
  const res = await fetch(`${BASE_URL}/api/health`)
  const body = await res.json()
  if (body.status === 'healthy') {
    console.log(`  OK    Health deep check — ${Object.keys(body.checks).length} checks passed`)
  } else {
    console.log(`  FAIL  Health deep check — status: ${body.status}`)
    for (const [name, check] of Object.entries(body.checks)) {
      const c = check as any
      if (c.status !== 'ok') console.log(`         ${name}: ${c.status} — ${c.message}`)
    }
    failures++
  }
} catch (err) {
  console.log(`  FAIL  Health deep check — ${err.message}`)
  failures++
}

console.log('')
if (failures === 0) {
  console.log('All smoke tests passed.')
  process.exit(0)
} else {
  console.log(`${failures} smoke test(s) failed.`)
  process.exit(1)
}
