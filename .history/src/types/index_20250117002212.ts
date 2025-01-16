export type LetterGrade = 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FF' | 'NA';

export type CourseStatus = 'PASSED' | 'FAILED' | 'TAKING' | 'NOT_TAKEN';

export type ThemeMode = 'light' | 'dark';

export interface Course {
    code: string;
    prerequisites: string | null;
    name: string;
    ects: number;
    grade: string | null;
    semester: string;
    checked: boolean;
    enrolled: boolean;
    id?: string;
    credits?: number;
    letterGrade?: LetterGrade;
    status?: CourseStatus;
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

export interface CourseState {
    selectedFaculty: Faculty | null;
    selectedDepartments: Department[];
    courses: Course[];
    theme: ThemeMode;
    stats: {
        gpa: number;
        termAverages: { [key: string]: number };
        passedCourses: number;
        failedCourses: number;
        activeCourses: number;
        totalCredits: number;
        completedCredits: number;
    };
    faculties: Faculty[];
} 