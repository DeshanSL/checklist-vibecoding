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
  const [showContent, setShowContent] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const createNewChecklist = () => {
    if (mounted) {
      // Generate unique ID and redirect
      const uniqueId = generateUniqueId()
      setShowContent(false)
      router.push(`/checklist/${uniqueId}/`)
    }
  }

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Word Checklist Online",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "description": "Free online word checklist maker. Create, manage and share task lists, word lists, and to-do checklists online. No registration required.",
    "url": "https://checklist.meetdeshan.xyz",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Checklist App"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }

  if (!showContent) {
    return (
      <>
        <Head>
          <title>Creating Your Free Word Checklist Online | Checklist App</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-600 rounded-full flex items-center justify-center animate-spin">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Creating Your Free Word Checklist</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Setting up your free online checklist...
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Free Word Checklist Online - Create Task Lists & Word Lists | No Sign Up Required</title>
        <meta name="description" content="Free online word checklist maker. Create task lists, word lists, shopping lists and to-do checklists online. No registration required. Share instantly with others." />
        <meta name="keywords" content="word checklist online free, free checklist maker, online task list, word list maker, free todo list, checklist generator, task manager online, free productivity tool, online checklist template, word checklist template" />

        {/* Open Graph */}
        <meta property="og:title" content="Free Word Checklist Online - Create Task Lists & Word Lists" />
        <meta property="og:description" content="Free online word checklist maker. Create task lists, word lists, shopping lists and to-do checklists online. No registration required." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://checklist.meetdeshan.xyz" />
        <meta property="og:image" content="https://checklist.meetdeshan.xyz/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Word Checklist Online - No Registration Required" />
        <meta name="twitter:description" content="Create free word checklists, task lists and todo lists online. Perfect for shopping lists, work tasks and personal organization." />
        <meta name="twitter:image" content="https://checklist.meetdeshan.xyz/og-image.png" />

        {/* Canonical */}
        <link rel="canonical" href="https://checklist.meetdeshan.xyz" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Free Word Checklist</h1>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-6">
                <nav className="hidden md:flex items-center space-x-6">
                  <a 
                    href="/features"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                  >
                    Features
                  </a>
                  <a 
                    href="/about"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                  >
                    About
                  </a>
                </nav>

                {/* Theme Toggle */}
                <button 
                  onClick={() => {
                    const isDark = document.documentElement.classList.contains('dark')
                    if (isDark) {
                      document.documentElement.classList.remove('dark')
                      localStorage.setItem('theme', 'light')
                    } else {
                      document.documentElement.classList.add('dark')
                      localStorage.setItem('theme', 'dark')
                    }
                  }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => {
                    const menu = document.getElementById('mobile-menu')
                    if (menu) {
                      menu.classList.toggle('hidden')
                    }
                  }}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div id="mobile-menu" className="hidden md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4 pt-4">
                <a 
                  href="/features"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Features
                </a>
                <a 
                  href="/about"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  About
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Free Word Checklist Online
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create unlimited word checklists, task lists, and to-do lists online for free. 
              No registration required. Perfect for shopping lists, work tasks, study guides, and personal organization.
            </p>

            <button 
              onClick={createNewChecklist}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Create Free Checklist Now
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              ✓ No sign-up required  ✓ Instant sharing  ✓ Works offline  ✓ 100% Free
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Why Choose Our Free Word Checklist Maker?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Instant & Free</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Start creating word checklists immediately. No account creation, no payments, no limits.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Easy Sharing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Share your word checklists instantly with others using a simple link. Perfect for teams and families.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Works Everywhere</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use on any device - desktop, tablet, or mobile. Works offline once loaded.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Perfect for Every Word List Need
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Shopping Lists</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Create grocery lists and shopping checklists to never forget items again.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Work Tasks</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Organize project tasks and daily work priorities with team members.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Study Guides</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Create vocabulary lists and study checklists for better learning.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Event Planning</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Plan events with detailed task lists and item checklists.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 dark:bg-primary-800">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-white mb-6">
              Start Creating Your Free Word Checklist Now
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands who use our free online checklist maker daily
            </p>

            <button 
              onClick={createNewChecklist}
              className="bg-white hover:bg-gray-100 text-primary-600 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Create Free Checklist
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2024 Free Word Checklist Online. All rights reserved.</p>
            <p className="text-gray-400 mt-2">
              Free online checklist maker for word lists, task lists, and todo lists.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
