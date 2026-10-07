/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  level: string;
  status: 'active' | 'graduated' | 'suspended';
  admissionDate: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: 'active' | 'on_leave';
  courses: string[];
  avatar?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  duration: string;
  modulesCount: number;
  icon: string;
}

export type NewsCategory = 
  | 'Événement' 
  | 'Vie du Centre' 
  | 'Diplômes & DQP' 
  | 'Inscriptions' 
  | 'Partenariat' 
  | 'Masterclass' 
  | 'Innovation';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  coverImage: string;
  gallery?: string[];
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  date: string;
  eventDate?: string;
  eventLocation?: string;
  isPinned: boolean;
  isEvent: boolean;
  status: 'published' | 'draft' | 'archived';
  tags: string[];
  readTime: string;
  viewsCount: number;
  likesCount?: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSpecialties: number;
  activeExams: number;
  monthlyRevenue: number;
  attendanceRate: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  items?: NavItem[];
}
