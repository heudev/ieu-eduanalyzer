export type LetterGrade = 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FF' | 'NA';

export type CourseStatus = 'PASSED' | 'FAILED' | 'TAKING' | 'NOT_TAKEN';

export interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    letterGrade: LetterGrade;
    status: CourseStatus;
}

export interface Department {
    id: string;
    name: string;
    facultyId: string;
    courses: Course[];
}

export interface Faculty {
    id: string;
    name: string;
}

export interface CourseState {
    selectedFaculty: Faculty | null;
    selectedDepartments: Department[];
    courses: Course[];
    stats: {
        gpa: number;
        termAverages: { [key: string]: number };
        passedCourses: number;
        failedCourses: number;
        activeCourses: number;
        totalCredits: number;
        completedCredits: number;
    };
} 