import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// Generate a unique ID using timestamp and random string
function generateUniqueId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomStr}`
}

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Generate unique ID and redirect
      const uniqueId = generateUniqueId()
      router.replace(`/checklist/${uniqueId}/`)
    }
  }, [router, mounted])

  return (
    <>
      <Head>
        <title>Redirecting... | Checklist App</title>
        <meta name="description" content="Creating your personal checklist..." />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary-600 rounded-full flex items-center justify-center animate-spin">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Creating Your Checklist</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we set up your personal checklist...
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
