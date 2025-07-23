const c = require("ansi-colors")

const requiredEnvs = [
  // For Supabase integration, we check for Supabase credentials instead
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    description:
      "Your Supabase project URL. Get it from: https://supabase.com/dashboard/project/_/settings/api",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description:
      "Your Supabase anonymous key. Get it from: https://supabase.com/dashboard/project/_/settings/api",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    )

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`))
      }
    })

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    )

    process.exit(1)
  }
}

module.exports = checkEnvVariables
