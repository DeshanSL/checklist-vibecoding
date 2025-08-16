import { NextPageContext } from 'next'
import Head from 'next/head'
import Link from 'next/link'

interface ErrorProps {
  statusCode: number
  hasGetInitialPropsRun?: boolean
  err?: Error
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  const is404 = statusCode === 404
  const title = is404 ? 'Page Not Found' : 'An Error Occurred'
  const description = is404 
    ? "The page you're looking for doesn't exist."
    : `A ${statusCode} error occurred on ${typeof window !== 'undefined' ? 'client' : 'server'}`

  return (
    <>
      <Head>
        <title>{statusCode} - {title} | Checklist App</title>
        <meta name="description" content={description} />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              is404 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {is404 ? (
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v-.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">{statusCode}</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{description}</p>

            {process.env.NODE_ENV === 'development' && err && (
              <details className="text-left text-sm text-gray-600 dark:text-gray-400 mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">Error Details (Development Only)</summary>
                <pre className="whitespace-pre-wrap overflow-auto">
                  {err.stack || err.message || 'Unknown error'}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!is404 && (
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}

            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={is404 
                  ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                  : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                } />
              </svg>
              {is404 ? 'Back to Home' : 'Go Home'}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404
  return { statusCode }
}

export default Error
