import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'

// This would be your checklist component content
// For now, I'll create a basic structure
interface ChecklistPageProps {
  id: string
}

export default function ChecklistPage({ id }: ChecklistPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Checklist... | Checklist App</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading your checklist...</h2>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Checklist {id} | Checklist App</title>
        <meta name="description" content={`Your personal checklist ${id}`} />
      </Head>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Your Checklist
          </h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Checklist ID: {id}</p>
            {/* Add your checklist functionality here */}
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate a few sample paths for static generation
  const sampleIds = ['sample-1', 'sample-2', 'demo']

  const paths = sampleIds.map((id) => ({
    params: { id: [id] }
  }))

  return {
    paths,
    fallback: 'blocking' // This enables ISR for new routes
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = Array.isArray(params?.id) ? params.id.join('/') : params?.id || 'default'

  return {
    props: {
      id
    },
    revalidate: 3600 // Revalidate every hour
  }
}
