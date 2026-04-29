export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return
  }

  const { connectToDatabase } = await import("./lib/mongodb")

  try {
    await connectToDatabase()
    console.log("[Seed] Startup database check completed")
  } catch (error) {
    console.error("[Seed] Startup database check failed:", error)
  }
}
