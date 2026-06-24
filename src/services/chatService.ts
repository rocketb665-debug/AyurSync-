import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  Timestamp,
  collectionGroup
} from 'firebase/firestore';

export interface ChatMessage {
  id?: string;
  sender: 'User' | 'Council' | 'Specialist';
  text: string;
  timestamp: any;
  debateData?: any;
}

export interface Consultation {
  id?: string;
  userId: string;
  specialistId: string;
  specialistName: string;
  lastMessage: string;
  createdAt: any;
  updatedAt: any;
  memoryCard?: string;
  snapshot?: any;
}

export const chatService = {
  async saveMessage(consultationId: string, userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const path = `users/${userId}/consultations/${consultationId}/messages`;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...message,
        timestamp: serverTimestamp()
      });

      const consultationRef = doc(db, `users/${userId}/consultations/${consultationId}`);
      await updateDoc(consultationRef, {
        lastMessage: message.text.substring(0, 100),
        updatedAt: serverTimestamp(),
        // If it's a council response with debateData, save the snapshot to the consultation for quick view
        ...(message.debateData ? { snapshot: message.debateData } : {})
      });

      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async startConsultation(userId: string, specialistId: string, specialistName: string) {
    const path = `users/${userId}/consultations`;
    try {
      const docRef = await addDoc(collection(db, path), {
        userId,
        specialistId,
        specialistName,
        lastMessage: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async getMessages(userId: string, consultationId: string, max: number = 15) {
    const path = `users/${userId}/consultations/${consultationId}/messages`;
    try {
      const q = query(
        collection(db, path),
        orderBy('timestamp', 'asc'),
        limit(max)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return [];
    }
  },

  async getAllPastConsultations(userId: string) {
    const path = `users/${userId}/consultations`;
    try {
      const q = query(
        collection(db, path),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return [];
    }
  },

  async updateMemoryCard(userId: string, consultationId: string, memoryCard: string) {
    const path = `users/${userId}/consultations/${consultationId}`;
    try {
      const docRef = doc(db, path);
      await updateDoc(docRef, {
        memoryCard,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async getCachedWisdom(userQuery: string) {
    const path = 'wisdomCache';
    try {
      // Normalize query for better cache hits
      const normalized = userQuery.toLowerCase().trim().replace(/[?.,!]/g, '');
      const q = query(
        collection(db, path),
        where('query', '==', normalized),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return (snapshot.docs[0].data() as any).response;
      }
      return null;
    } catch (e) {
      console.warn("Cache fetch failed:", e);
      return null;
    }
  },

  async cacheWisdom(userQuery: string, response: string) {
    const path = 'wisdomCache';
    try {
      const normalized = userQuery.toLowerCase().trim().replace(/[?.,!]/g, '');
      await addDoc(collection(db, path), {
        query: normalized,
        response,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Cache save failed:", e);
    }
  },

  /**
   * Fetches the last N messages across ALL consultations for this user.
   * Uses collection group query. Note: Requires index on 'timestamp' for collection messages.
   */
  async getUnifiedHistory(userId: string, max: number = 15) {
    // For development, collection group might need an index.
    // If we want to stay simple, we can fetch all consultations and get messages from them.
    // But since we want "Unified Brain", a collection group query is best.
    try {
      // NOTE: This usually requires a composite index in production.
      // In this environment, it should work for flat lists if we filter by userId if possible.
      // But subcollections are nested under users/{userId}.
      // A better way without a complex index is to list consultations then fetch messages.
      const consultations = await this.getAllPastConsultations(userId);
      let allMessages: ChatMessage[] = [];
      
      // Get messages from last 3 consultations to form a history
      for (const consult of consultations.slice(0, 3)) {
        const msgs = await this.getMessages(userId, consult.id!, 5);
        allMessages = [...allMessages, ...msgs];
      }
      
      return allMessages.sort((a, b) => {
        const tA = a.timestamp?.seconds || 0;
        const tB = b.timestamp?.seconds || 0;
        return tA - tB;
      }).slice(-max);
    } catch (e) {
      console.error("History fetch error:", e);
      return [];
    }
  }
};
