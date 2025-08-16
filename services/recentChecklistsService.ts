export interface RecentChecklist {
  id: string
  title: string
  url: string
  lastVisited: string
  itemCount?: number
  completedCount?: number
}

export class RecentChecklistsService {
  private static readonly STORAGE_KEY = 'checklist-recent'
  private static readonly MAX_RECENT = 10

  static getRecentChecklists(): RecentChecklist[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load recent checklists:', error)
      return []
    }
  }

  static addRecentChecklist(checklist: Omit<RecentChecklist, 'lastVisited'>): void {
    if (typeof window === 'undefined') return

    try {
      const recent = this.getRecentChecklists()
      const now = new Date().toISOString()

      // Remove existing entry if it exists
      const filtered = recent.filter(item => item.id !== checklist.id)

      // Add new entry at the beginning
      const updated = [
        { ...checklist, lastVisited: now },
        ...filtered
      ].slice(0, this.MAX_RECENT) // Keep only the most recent items

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save recent checklist:', error)
    }
  }

  static updateChecklistStats(id: string, itemCount: number, completedCount: number): void {
    if (typeof window === 'undefined') return

    try {
      const recent = this.getRecentChecklists()
      const updated = recent.map(item =>
        item.id === id
          ? { ...item, itemCount, completedCount, lastVisited: new Date().toISOString() }
          : item
      )

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to update checklist stats:', error)
    }
  }

  static removeRecentChecklist(id: string): void {
    if (typeof window === 'undefined') return

    try {
      const recent = this.getRecentChecklists()
      const filtered = recent.filter(item => item.id !== id)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to remove recent checklist:', error)
    }
  }

  static clearRecentChecklists(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear recent checklists:', error)
    }
  }
}
