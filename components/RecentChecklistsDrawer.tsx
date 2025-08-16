import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { RecentChecklistsService, RecentChecklist } from '../services/recentChecklistsService'

interface RecentChecklistsDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentChecklistId?: string
}

export default function RecentChecklistsDrawer({ isOpen, onClose, currentChecklistId }: RecentChecklistsDrawerProps) {
  const router = useRouter()
  const [recentChecklists, setRecentChecklists] = useState<RecentChecklist[]>([])

  useEffect(() => {
    if (isOpen) {
      const recent = RecentChecklistsService.getRecentChecklists()
      setRecentChecklists(recent)
    }
  }, [isOpen])

  const handleChecklistClick = (checklist: RecentChecklist) => {
    onClose()
    if (checklist.id !== currentChecklistId) {
      router.push(checklist.url)
    }
  }

  const handleRemoveChecklist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    RecentChecklistsService.removeRecentChecklist(id)
    setRecentChecklists(prev => prev.filter(item => item.id !== id))
  }

  const handleClearAll = () => {
    RecentChecklistsService.clearRecentChecklists()
    setRecentChecklists([])
  }

  const createNewChecklist = () => {
    onClose()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Lists</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* New Checklist Button */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <button
              onClick={createNewChecklist}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Checklist
            </button>
          </div>

          {/* Recent Checklists */}
          <div className="p-4">
            {recentChecklists.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Recent ({recentChecklists.length})
                  </span>
                  {recentChecklists.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {recentChecklists.map((checklist) => (
                    <div
                      key={checklist.id}
                      onClick={() => handleChecklistClick(checklist)}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                        checklist.id === currentChecklistId
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-gray-50 dark:hover:bg-dark-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                              {checklist.title}
                            </h3>
                            {checklist.id === currentChecklistId && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-400">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatDate(checklist.lastVisited)}</span>
                            {checklist.itemCount !== undefined && (
                              <span>
                                {checklist.completedCount || 0}/{checklist.itemCount} completed
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                            ID: {checklist.id}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleRemoveChecklist(e, checklist.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all duration-200 ml-2"
                          title="Remove from recent"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No recent checklists</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Create or visit checklists to see them here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
