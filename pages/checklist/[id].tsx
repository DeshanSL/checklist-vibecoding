import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { checklistService, ChecklistItem } from '../../services/checklistService'
import { RecentChecklistsService } from '../../services/recentChecklistsService'
import RecentChecklistsDrawer from '../../components/RecentChecklistsDrawer'

export default function ChecklistPage() {
  const router = useRouter()
  const { id } = router.query
  const checklistId = Array.isArray(id) ? id[0] : id

  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItemText, setNewItemText] = useState('')
  const [title, setTitle] = useState('My Checklist')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('My Checklist')
  const [copyFeedback, setCopyFeedback] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    message: string
    action: () => void
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Initialize checklist and set up real-time listener
  useEffect(() => {
    if (!checklistId) return

    setIsLoading(true)

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('checklist-theme')
    const prefersDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDarkMode(prefersDark)

    // Apply theme to document
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Set up real-time listener for checklist metadata
    const unsubscribeChecklist = checklistService.onChecklistChange(checklistId, async (data) => {
      if (data) {
        setTitle(data.title)
        setEditTitle(data.title)
        setIsOnline(true)

        // Save to recent checklists
        RecentChecklistsService.addRecentChecklist({
          id: checklistId,
          title: data.title,
          url: window.location.href
        })
      } else {
        // Checklist doesn't exist, create it
        try {
          await checklistService.createChecklist(checklistId, 'My Checklist')
          setIsOnline(true)
        } catch (error) {
          console.error('Failed to create checklist:', error)
          setIsOnline(false)
        }
      }
      setIsLoading(false)
    })

    // Set up real-time listener for checklist items
    const unsubscribeItems = checklistService.onItemsChange(checklistId, (items) => {
      setItems(items)

      // Update stats in recent checklists
      if (checklistId) {
        const completedCount = items.filter(item => item.completed).length
        RecentChecklistsService.updateChecklistStats(checklistId, items.length, completedCount)
      }
    })

    // Cleanup listeners on unmount
    return () => {
      unsubscribeChecklist()
      unsubscribeItems()
    }
  }, [checklistId])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addItem = async () => {
    if (newItemText.trim() && checklistId) {
      try {
        await checklistService.addItem(checklistId, newItemText.trim())
        setNewItemText('')
        inputRef.current?.focus()
      } catch (error) {
        console.error('Failed to add item:', error)
        setIsOnline(false)
      }
    }
  }

  const toggleItem = async (itemId: string) => {
    if (!checklistId) return

    const item = items.find(i => i.id === itemId)
    if (item) {
      try {
        await checklistService.updateItem(checklistId, itemId, { 
          completed: !item.completed 
        })
      } catch (error) {
        console.error('Failed to toggle item:', error)
        setIsOnline(false)
      }
    }
  }

  const updateItemText = async (itemId: string, text: string) => {
    if (!checklistId) return

    try {
      await checklistService.updateItem(checklistId, itemId, { text })
    } catch (error) {
      console.error('Failed to update item text:', error)
      setIsOnline(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!checklistId) return

    try {
      await checklistService.deleteItem(checklistId, itemId)
    } catch (error) {
      console.error('Failed to delete item:', error)
      setIsOnline(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addItem()
    }
  }

  const handleTitleEditStart = () => {
    setIsEditingTitle(true)
    setEditTitle(title)
  }

  const handleTitleEditSave = async () => {
    const newTitle = editTitle.trim() || 'My Checklist'
    setIsEditingTitle(false)

    if (checklistId && newTitle !== title) {
      try {
        await checklistService.updateTitle(checklistId, newTitle)
      } catch (error) {
        console.error('Failed to update title:', error)
        setIsOnline(false)
        // Revert title on error
        setEditTitle(title)
      }
    }
  }

  const handleTitleEditCancel = () => {
    setEditTitle(title)
    setIsEditingTitle(false)
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleEditSave()
    } else if (e.key === 'Escape') {
      handleTitleEditCancel()
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value)
  }

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const handleShareList = async () => {
    try {
      // Create shareable data object
      const shareData = {
        title: title,
        items: items.map(item => ({
          text: item.text,
          completed: item.completed
        })),
        createdAt: new Date().toISOString()
      }

      // Current URL is already shareable
      const shareableUrl = window.location.href

      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl)
      setCopyFeedback('Link copied to clipboard!')

      // Clear feedback after 3 seconds
      setTimeout(() => setCopyFeedback(''), 3000)
    } catch (error) {
      setCopyFeedback('Failed to copy link')
      setTimeout(() => setCopyFeedback(''), 3000)
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('checklist-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('checklist-theme', 'light')
    }
  }

  const showConfirmation = (title: string, message: string, action: () => void) => {
    setConfirmAction({ title, message, action })
    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.action()
    }
    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const deleteItemWithConfirm = (id: string, itemText: string) => {
    showConfirmation(
      'Delete Task',
      `Are you sure you want to delete "${itemText}"?`,
      () => deleteItem(id)
    )
  }

  const clearCompletedWithConfirm = () => {
    showConfirmation(
      'Clear Completed Tasks',
      `Are you sure you want to clear all ${completedCount} completed tasks?`,
      async () => {
        if (checklistId) {
          try {
            await checklistService.clearCompletedItems(checklistId)
          } catch (error) {
            console.error('Failed to clear completed items:', error)
            setIsOnline(false)
          }
        }
      }
    )
  }

  const createNewChecklist = () => {
    // Navigate to home to create a new checklist
    router.push('/')
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Checklist... | Checklist App</title>
        </Head>

        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-600 rounded-full flex items-center justify-center animate-spin">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Loading Your Checklist</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Please wait while we load your checklist...
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
        <title>{title} | Checklist App</title>
        <meta name="description" content={`${title} - A personal checklist with ${totalCount} tasks`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Checklist</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={createNewChecklist}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
              >
                New List
              </button>
              <span 
                className="text-gray-400 dark:text-gray-500 cursor-not-allowed font-medium opacity-60"
                title="Templates - Coming Soon"
              >
                Templates
              </span>
              <span 
                className="text-gray-400 dark:text-gray-500 cursor-not-allowed font-medium opacity-60"
                title="Settings - Coming Soon"
              >
                Settings
              </span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Profile/User - Disabled */}
              <div 
                className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center cursor-not-allowed opacity-60"
                title="User Account - Coming Soon"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Recent Lists button */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 font-medium"
                title="View Recent Lists"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline text-sm">Recent</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen py-8 px-4 bg-gray-50 dark:bg-dark-900">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-left mb-8">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="relative flex-1 group min-w-0">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editTitle}
                    onChange={handleTitleChange}
                    onKeyDown={handleTitleKeyPress}
                    onBlur={handleTitleEditSave}
                    className="text-2xl sm:text-4xl font-bold mb-2 transition-all duration-200 outline-none text-gray-900 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:border-primary-500 dark:focus:border-primary-400 w-full max-w-full resize-none"
                    style={{ minHeight: '2.5rem' }}
                  />
                ) : (
                  <div
                    onClick={handleTitleEditStart}
                    className="text-2xl sm:text-4xl font-bold mb-2 transition-all duration-200 outline-none text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 px-1 -mx-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 break-words line-clamp-2 max-w-full"
                    title="Click to edit title"
                  >
                    {title}
                  </div>
                )}
                {!isEditingTitle && (
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Share Button - Compact on mobile */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={handleShareList}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 transition-all duration-200 font-medium text-sm sm:text-base"
                  title="Share this checklist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="hidden sm:inline">Share</span>
                </button>

                {/* Copy feedback */}
                {copyFeedback && (
                  <div className="absolute top-12 right-0 z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-dark-700 rounded-lg shadow-lg animate-fade-in whitespace-nowrap">
                    {copyFeedback}
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 dark:bg-dark-700 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist ID and connection status */}
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600 mb-4">
              <span>Checklist ID: {checklistId}</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* Progress indicator */}
            {totalCount > 0 && (
              <div className="text-gray-600 dark:text-gray-400">
                <span className="text-lg font-medium">
                  {completedCount} of {totalCount} completed
                </span>
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Add new item */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:focus:ring-primary-400 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                disabled={isLoading}
              />
              <button
                onClick={addItem}
                disabled={!newItemText.trim() || isLoading}
                className="px-3 sm:px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center min-w-[48px] sm:min-w-auto"
                title="Add Task"
                aria-label="Add Task"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No tasks yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Add your first task to get started!</p>
              </div>
            ) : (
              items.map((item) => (
                <ChecklistItemComponent
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id)}
                  onUpdateText={(text) => updateItemText(item.id, text)}
                  onDelete={deleteItemWithConfirm}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={clearCompletedWithConfirm}
                className="btn-secondary"
                disabled={completedCount === 0}
              >
                Clear Completed ({completedCount})
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <ConfirmationModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Recent Checklists Drawer */}
      <RecentChecklistsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentChecklistId={checklistId}
      />
    </>
  )
}

interface ChecklistItemProps {
  item: ChecklistItem
  onToggle: () => void
  onUpdateText: (text: string) => void
  onDelete: (id: string, text: string) => void
}

function ChecklistItemComponent({ item, onToggle, onUpdateText, onDelete }: ChecklistItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleEditStart = () => {
    setIsEditing(true)
    setEditText(item.text)
  }

  const handleEditSave = () => {
    onUpdateText(editText.trim() || item.text)
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditText(item.text)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  return (
    <div className="checklist-item animate-slide-in group">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="checkbox"
      />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleEditSave}
          className="editable-text"
        />
      ) : (
        <div
          onClick={handleEditStart}
          className={`editable-text cursor-text ${item.completed ? 'completed' : ''}`}
        >
          {item.text}
        </div>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!isEditing && (
          <button
            onClick={handleEditStart}
            className="p-1 text-gray-400 hover:text-primary-600 transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(item.id, item.text)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

interface ConfirmationModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmationModal({ title, message, onConfirm, onCancel }: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-dark-800 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800 transition-all duration-200 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
