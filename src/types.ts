export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  approved: boolean;
}

export interface StudentWork {
  id: string;
  title: string;
  content: string;
  link?: string;
  studentName: string;
  workType: string;
  imageUrl?: string;
  year: string;
  authorId: string;
  createdAt: any;
  approved: boolean;
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  subject: string;
  teacherName: string;
  authorId: string;
  createdAt: any;
  approved: boolean;
  rejected?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorId: string;
  createdAt: any;
  approved: boolean;
  rejected?: boolean;
  category?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}
