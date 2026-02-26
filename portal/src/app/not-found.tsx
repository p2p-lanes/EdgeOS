import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <div className="text-center max-w-md p-8">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <p className="text-lg text-neutral-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
