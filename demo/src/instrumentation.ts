/**
 * Next.js instrumentation hook. Runs once when the server process boots.
 * We only start the feed + scheduler in the Node.js runtime (not Edge).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapServer } = await import("@/lib/server/bootstrap");
    bootstrapServer();
  }
}
