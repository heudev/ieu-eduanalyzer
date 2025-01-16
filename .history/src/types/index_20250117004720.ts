export type ThemeMode = 'light' | 'dark';

export interface Course {
    id: string;
    name: string;
    code: string;
    credits: number;
    letterGrade?: string;
    status: 'PASSED' | 'FAILED' | 'TAKING';
}

export interface CourseStats {
    gpa: number;
    passedCourses: number;
    failedCourses: number;
    activeCourses: number;
    totalCredits: number;
    completedCredits: number;
}

export interface CourseState {
    courses: Course[];
    stats: CourseStats;
    theme: ThemeMode;
}

export interface Department {
    department: string;
    courses: Course[];
    id?: string;
    name?: string;
    facultyId?: string;
}

export interface Faculty {
    faculty: string;
    image: string;
    departments: Department[];
    id?: string;
    name?: string;
} 