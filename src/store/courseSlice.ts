import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseState } from '../types';

interface FacultyDepartmentPayload {
    faculty: string;
    department: string;
    courses: Course[];
}

const initialState: CourseState = {
    courses: [],
    selectedFaculty: null,
    selectedDepartment: null,
    stats: {
        gpa: 0,
        passedCourses: 0,
        failedCourses: 0,
        activeCourses: 0,
        totalCredits: 0,
        completedCredits: 0
    },
    theme: 'light',
    loading: false,
    error: null
};

const calculateGPA = (courses: Course[]): number => {
    const gradePoints: { [key: string]: number } = {
        'AA': 4.0,
        'BA': 3.5,
        'BB': 3.0,
        'CB': 2.5,
        'CC': 2.0,
        'DC': 1.5,
        'DD': 1.0,
        'FF': 0.0,
        'NA': 0.0
    };

    const completedCourses = courses.filter(course =>
        course.letterGrade !== 'NA' && course.status === 'PASSED'
    );

    if (completedCourses.length === 0) return 0;

    const totalPoints = completedCourses.reduce((sum, course) => {
        const grade = course.letterGrade || 'NA';
        return sum + (gradePoints[grade] * (course.credits || 0));
    }, 0);

    const totalCredits = completedCourses.reduce((sum, course) =>
        sum + (course.credits || 0), 0
    );

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

export const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        addCourse: (state, action: PayloadAction<Course>) => {
            state.courses.push(action.payload);
            localStorage.setItem('courses', JSON.stringify(state.courses));
        },
        updateCourse: (state, action: PayloadAction<{ courseId: string, updates: Partial<Course> }>) => {
            const index = state.courses.findIndex(course => course.id === action.payload.courseId);
            if (index !== -1) {
                state.courses[index] = { ...state.courses[index], ...action.payload.updates };
                localStorage.setItem('courses', JSON.stringify(state.courses));
            }
        },
        deleteCourse: (state, action: PayloadAction<string>) => {
            state.courses = state.courses.filter(course => course.id !== action.payload);
            localStorage.setItem('courses', JSON.stringify(state.courses));
        },
        calculateStats: (state) => {
            const courses = state.courses;
            state.stats = {
                gpa: calculateGPA(courses),
                passedCourses: courses.filter(c => c.status === 'PASSED').length,
                failedCourses: courses.filter(c => c.status === 'FAILED').length,
                activeCourses: courses.filter(c => c.status === 'TAKING').length,
                totalCredits: courses.reduce((sum, c) => sum + (c.credits || 0), 0),
                completedCredits: courses
                    .filter(c => c.status === 'PASSED')
                    .reduce((sum, c) => sum + (c.credits || 0), 0)
            };
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
        },
        loadInitialData: (state) => {
            try {
                state.loading = true;
                const savedCourses = localStorage.getItem('courses');
                const savedTheme = localStorage.getItem('theme');

                if (savedCourses) {
                    state.courses = JSON.parse(savedCourses);
                }

                if (savedTheme) {
                    state.theme = savedTheme as 'light' | 'dark';
                }
                state.error = null;
            } catch (error) {
                state.error = 'Veri yüklenirken bir hata oluştu';
            } finally {
                state.loading = false;
            }
        },
        setSelectedFacultyAndDepartment: (state, action: PayloadAction<FacultyDepartmentPayload>) => {
            state.selectedFaculty = action.payload.faculty;
            state.selectedDepartment = action.payload.department;
            state.courses = action.payload.courses;
            state.stats = {
                gpa: calculateGPA(action.payload.courses),
                passedCourses: action.payload.courses.filter(c => c.status === 'PASSED').length,
                failedCourses: action.payload.courses.filter(c => c.status === 'FAILED').length,
                activeCourses: action.payload.courses.filter(c => c.status === 'TAKING').length,
                totalCredits: action.payload.courses.reduce((sum, c) => sum + (c.credits || 0), 0),
                completedCredits: action.payload.courses
                    .filter(c => c.status === 'PASSED')
                    .reduce((sum, c) => sum + (c.credits || 0), 0)
            };
        }
    }
});

export const {
    addCourse,
    updateCourse,
    deleteCourse,
    calculateStats,
    toggleTheme,
    loadInitialData,
    setLoading,
    setError,
    setSelectedFacultyAndDepartment
} = courseSlice.actions;

export default courseSlice.reducer; 