
export enum Role {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN'
}

export interface User {
  email: string;
  name: string;
  role: Role;
  registeredCourseIds?: string[];
}

export interface Course {
  id: string;
  title: string;
  titleEn: string;
  instructor: string;
  description: string;
  dates: string[];
  type?: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
}

export interface Resource {
  id: string;
  courseId: string; // Added to distinguish resources by course
  title: string;
  date: string;
  link: string;
  type: 'file' | 'link';
}

export interface DefenseSchedule {
  date: string;
  time: string;
  students: string[];
}

export interface AttendanceRecord {
  courseId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}
