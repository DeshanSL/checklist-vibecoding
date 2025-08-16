import { db } from '../lib/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  createdAt: Timestamp
  order: number
}

export interface ChecklistData {
  id: string
  title: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export class ChecklistService {
  private getChecklistRef(checklistId: string) {
    return doc(db, 'checklists', checklistId)
  }

  private getItemsCollection(checklistId: string) {
    return collection(db, 'checklists', checklistId, 'items')
  }

  private getItemRef(checklistId: string, itemId: string) {
    return doc(db, 'checklists', checklistId, 'items', itemId)
  }

  async createChecklist(checklistId: string, title: string = 'My Checklist'): Promise<void> {
    const checklistRef = this.getChecklistRef(checklistId)
    const now = Timestamp.now()

    await setDoc(checklistRef, {
      id: checklistId,
      title,
      createdAt: now,
      updatedAt: now
    })
  }

  async getChecklist(checklistId: string): Promise<ChecklistData | null> {
    const checklistRef = this.getChecklistRef(checklistId)
    const snapshot = await getDoc(checklistRef)

    if (snapshot.exists()) {
      return snapshot.data() as ChecklistData
    }
    return null
  }

  async updateTitle(checklistId: string, title: string): Promise<void> {
    const checklistRef = this.getChecklistRef(checklistId)

    await updateDoc(checklistRef, {
      title,
      updatedAt: Timestamp.now()
    })
  }

  async addItem(checklistId: string, text: string): Promise<string> {
    const itemsCollection = this.getItemsCollection(checklistId)
    const checklistRef = this.getChecklistRef(checklistId)

    // Get current max order for proper ordering
    const itemsQuery = query(itemsCollection, orderBy('order', 'desc'))
    const itemsSnapshot = await getDocs(itemsQuery)
    const maxOrder = itemsSnapshot.empty ? 0 : itemsSnapshot.docs[0].data().order + 1

    const item: Omit<ChecklistItem, 'id'> = {
      text,
      completed: false,
      createdAt: Timestamp.now(),
      order: maxOrder
    }

    // Add item and update checklist timestamp
    const docRef = await addDoc(itemsCollection, item)
    await updateDoc(checklistRef, { updatedAt: Timestamp.now() })

    return docRef.id
  }

  async updateItem(checklistId: string, itemId: string, updates: Partial<Omit<ChecklistItem, 'id' | 'createdAt'>>): Promise<void> {
    const itemRef = this.getItemRef(checklistId, itemId)
    const checklistRef = this.getChecklistRef(checklistId)

    await Promise.all([
      updateDoc(itemRef, updates),
      updateDoc(checklistRef, { updatedAt: Timestamp.now() })
    ])
  }

  async deleteItem(checklistId: string, itemId: string): Promise<void> {
    const itemRef = this.getItemRef(checklistId, itemId)
    const checklistRef = this.getChecklistRef(checklistId)

    await Promise.all([
      deleteDoc(itemRef),
      updateDoc(checklistRef, { updatedAt: Timestamp.now() })
    ])
  }

  async clearCompletedItems(checklistId: string): Promise<void> {
    const itemsCollection = this.getItemsCollection(checklistId)
    const completedQuery = query(itemsCollection, where('completed', '==', true))
    const snapshot = await getDocs(completedQuery)

    if (!snapshot.empty) {
      const batch = writeBatch(db)

      // Delete all completed items
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      // Update checklist timestamp
      const checklistRef = this.getChecklistRef(checklistId)
      batch.update(checklistRef, { updatedAt: Timestamp.now() })

      await batch.commit()
    }
  }

  // Real-time listeners
  onChecklistChange(checklistId: string, callback: (data: ChecklistData | null) => void): () => void {
    const checklistRef = this.getChecklistRef(checklistId)

    return onSnapshot(checklistRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as ChecklistData)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Firestore listener error:', error)
      callback(null)
    })
  }

  onItemsChange(checklistId: string, callback: (items: ChecklistItem[]) => void): () => void {
    const itemsCollection = this.getItemsCollection(checklistId)
    const itemsQuery = query(itemsCollection, orderBy('order', 'desc'))

    return onSnapshot(itemsQuery, (snapshot) => {
      const items: ChecklistItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChecklistItem))
      callback(items)
    }, (error) => {
      console.error('Firestore items listener error:', error)
      callback([])
    })
  }
}

export const checklistService = new ChecklistService()
