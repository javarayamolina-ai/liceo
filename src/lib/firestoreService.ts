import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const FirestoreService = {
  async getAll<T>(collectionPath: string): Promise<T[]> {
    try {
      const q = query(collection(db, collectionPath));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
      return [];
    }
  },

  subscribeToCollection<T>(collectionPath: string, callback: (data: T[]) => void) {
    const q = query(collection(db, collectionPath));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    });
  },

  async create<T extends object>(collectionPath: string, data: any) {
    try {
      const payload = {
        ...data,
        authorId: data.authorId || auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      };
      return await addDoc(collection(db, collectionPath), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
    }
  },

  async update<T extends object>(collectionPath: string, id: string, data: Partial<T>) {
    try {
      const docRef = doc(db, collectionPath, id);
      return await updateDoc(docRef as any, data as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${id}`);
    }
  },

  async remove(collectionPath: string, id: string) {
    try {
      const docRef = doc(db, collectionPath, id);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${id}`);
    }
  }
};
