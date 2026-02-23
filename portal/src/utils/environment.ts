/**
 * Utility function to get the base URL according to the environment
 * Production: https://edgecity.simplefi.tech
 * Development or other environments: https://citizen-portal-git-develop-p2planes.vercel.app
 */
export const getBaseUrl = (): string => {
  const isDevelopment = process.env.NEXT_PUBLIC_DEVELOP === "true"

  return isDevelopment
    ? "https://citizen-portal-git-develop-p2planes.vercel.app"
    : "https://edgecity.simplefi.tech"
}
