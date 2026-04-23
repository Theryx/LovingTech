import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-zinc-500 text-lg mb-8">Page not found</p>
      <Link
        href="/"
        className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:opacity-90 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
