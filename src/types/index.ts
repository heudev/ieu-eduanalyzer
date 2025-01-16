export type ThemeMode = 'light' | 'dark';

export type LetterGrade = 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FF' | 'NA';

export type CourseStatus = 'PASSED' | 'FAILED' | 'TAKING' | 'NOT_TAKEN';

export interface Course {
    id: string;
    name: string;
    code: string;
    credits: number;
    letterGrade: LetterGrade;
    status: CourseStatus;
    semester: string;
    year?: number;
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
    selectedFaculty: string | null;
    selectedDepartment: string | null;
    stats: CourseStats;
    theme: ThemeMode;
    loading: boolean;
    error: string | null;
}

export interface Department {
    id: string;
    name: string;
    facultyId: string;
    department: string;
    courses: Course[];
}

export interface Faculty {
    id: string;
    name: string;
    faculty: string;
    image: string;
    departments: Department[];
}

export interface RootState {
    course: CourseState;
} 