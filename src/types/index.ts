export type LetterGrade = 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FD' | 'FF' | 'NA';

export type CourseStatus = 'TAKING' | 'NOT TAKING';

export interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    letterGrade: LetterGrade;
    status: CourseStatus;
    semester: string;
}

export interface Faculty {
    faculty: string;
    departments: Department[];
}

export interface Department {
    department: string;
    courses: Course[];
}

export interface DepartmentData {
    faculty: string;
    department: string;
    courses: Course[];
}

export interface RootState {
    course: {
        faculty: string | null;
        department: string | null;
        courses: Course[];
        departments: DepartmentData[];
        stats: {
            activeCourses: any;
            failedCourses: any;
            passedCourses: any;
            totalCredits: number;
            completedCredits: number;
            gpa: number;
            remainingCourses: number;
        };
    };
} 