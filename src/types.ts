export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  imageUrl?: string;
  driveLink?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  approved: boolean;
  rejected?: boolean;
  pinned?: boolean;
}

export interface StudentWork {
  id: string;
  title: string;
  content: string;
  link?: string;
  driveLink?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  studentName: string;
  workType: string;
  imageUrl?: string;
  year: string;
  authorId: string;
  createdAt: any;
  approved: boolean;
  rejected?: boolean;
  pinned?: boolean;
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  driveLink?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  subject: string;
  teacherName: string;
  authorId: string;
  createdAt: any;
  approved: boolean;
  rejected?: boolean;
  pinned?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  driveLink?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  authorId: string;
  createdAt: any;
  approved: boolean;
  rejected?: boolean;
  category?: string;
  pinned?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string; // 'Estudiante' | 'Apoderado' | 'Egresado' | 'Vecino' | 'Otro'
  content: string;
  approved: boolean;
  rejected?: boolean;
  createdAt: any;
  pinned?: boolean;
  authorId?: string;
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
