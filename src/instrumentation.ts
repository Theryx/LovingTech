export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env')

    const result = validateEnv()

    if (!result.valid) {
      console.error('\n  ENVIRONMENT VALIDATION FAILED\n')
      for (const err of result.errors) {
        console.error(`   ERROR   ${err}`)
      }
      console.error('')
    }

    for (const warn of result.warnings) {
      console.warn(`   WARN    ${warn}`)
    }

    if (!result.valid) {
      console.error('   The server will start but some features may be broken.\n')
    } else {
      console.log('   Environment validation passed')
    }
  }
}
