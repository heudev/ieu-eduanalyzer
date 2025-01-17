import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, LetterGrade } from '../types';

interface DepartmentData {
    faculty: string;
    department: string;
    courses: Course[];
}

interface CourseState {
    faculty: string | null;
    department: string | null;
    courses: Course[];
    departments: DepartmentData[];
    theme: 'light' | 'dark';
    stats: {
        totalCredits: number;
        completedCredits: number;
        gpa: number;
    };
}

const calculateGPA = (courses: Course[]): number => {
    const gradePoints: { [key in LetterGrade]: number } = {
        'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
        'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'FD': 0.5,
        'FF': 0.0, 'NA': 0.0
    };

    const completedCourses = courses.filter(course => course.letterGrade !== 'NA');
    if (completedCourses.length === 0) return 0;

    const totalPoints = completedCourses.reduce((sum, course) => {
        return sum + (gradePoints[course.letterGrade] * course.credits);
    }, 0);

    const totalCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0);
    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
};

const computeCourseStats = (courses: Course[]) => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const completedCourses = courses.filter(course => course.letterGrade !== 'NA');
    const completedCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0);
    const gpa = calculateGPA(courses);

    return {
        totalCredits,
        completedCredits,
        gpa
    };
};

const initialState: CourseState = {
    faculty: null,
    department: null,
    courses: [],
    departments: [],
    theme: 'light',
    stats: {
        totalCredits: 0,
        completedCredits: 0,
        gpa: 0
    }
};

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setSelectedFacultyAndDepartment: (state, action: PayloadAction<{
            faculty: string;
            department: string;
            courses: Course[];
        }>) => {
            const existingDeptIndex = state.departments.findIndex(
                d => d.faculty === action.payload.faculty && d.department === action.payload.department
            );

            if (existingDeptIndex === -1) {
                // Yeni bölüm ekleniyor
                state.departments.push({
                    faculty: action.payload.faculty,
                    department: action.payload.department,
                    courses: action.payload.courses
                });
                // Aktif bölümü güncelle
                state.faculty = action.payload.faculty;
                state.department = action.payload.department;
                state.courses = action.payload.courses;
            } else {
                // Var olan bölüme geçiş yapılıyor
                state.faculty = action.payload.faculty;
                state.department = action.payload.department;
                state.courses = state.departments[existingDeptIndex].courses;
            }

            state.stats = computeCourseStats(state.courses);
        },
        updateCourse: (state, action: PayloadAction<{
            courseId: string;
            updates: Partial<Course>;
        }>) => {
            const courseIndex = state.courses.findIndex(c => c.id === action.payload.courseId);
            if (courseIndex !== -1) {
                const oldCourse = state.courses[courseIndex];
                const updatedCourse = {
                    ...oldCourse,
                    ...action.payload.updates
                };
                state.courses[courseIndex] = updatedCourse;

                // Bölüm listesindeki dersi de güncelle
                const deptIndex = state.departments.findIndex(
                    d => d.faculty === state.faculty && d.department === state.department
                );
                if (deptIndex !== -1) {
                    const courseDeptIndex = state.departments[deptIndex].courses.findIndex(
                        c => c.id === action.payload.courseId
                    );
                    if (courseDeptIndex !== -1) {
                        state.departments[deptIndex].courses[courseDeptIndex] = updatedCourse;
                    }
                }

                state.stats = computeCourseStats(state.courses);
            }
        },
        addCourse: (state, action: PayloadAction<Course>) => {
            state.courses.push(action.payload);

            // Bölüm listesine de ekle
            const deptIndex = state.departments.findIndex(
                d => d.faculty === state.faculty && d.department === state.department
            );
            if (deptIndex !== -1) {
                state.departments[deptIndex].courses.push(action.payload);
            }

            state.stats = computeCourseStats(state.courses);
        },
        deleteCourse: (state, action: PayloadAction<string>) => {
            state.courses = state.courses.filter(course => course.id !== action.payload);

            // Bölüm listesinden de sil
            const deptIndex = state.departments.findIndex(
                d => d.faculty === state.faculty && d.department === state.department
            );
            if (deptIndex !== -1) {
                state.departments[deptIndex].courses = state.departments[deptIndex].courses.filter(
                    course => course.id !== action.payload
                );
            }

            state.stats = computeCourseStats(state.courses);
        },
        calculateStats: (state) => {
            state.stats = computeCourseStats(state.courses);
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        }
    }
});

export const {
    setSelectedFacultyAndDepartment,
    updateCourse,
    addCourse,
    deleteCourse,
    calculateStats,
    setTheme
} = courseSlice.actions;

export default courseSlice.reducer; 