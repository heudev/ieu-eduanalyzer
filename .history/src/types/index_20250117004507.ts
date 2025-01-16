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
}

export type LetterGrade = 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FF' | 'NA';

export type CourseStatus = 'PASSED' | 'FAILED' | 'TAKING' | 'NOT_TAKEN';

export interface Course {
    id?: string;
    code: string;
    name: string;
    ects: number;
    credits: number;
    semester: string;
    prerequisites: string[] | null;
    letterGrade: LetterGrade;
    status: CourseStatus;
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