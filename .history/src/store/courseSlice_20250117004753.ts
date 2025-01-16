import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseState } from '../types';

const initialState: CourseState = {
    courses: [],
    stats: {
        gpa: 0,
        passedCourses: 0,
        failedCourses: 0,
        activeCourses: 0,
        totalCredits: 0,
        completedCredits: 0
    },
    theme: 'light'
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
        addCourse: (state, action: PayloadAction<Course>) => {
            state.courses.push(action.payload);
        },
        updateCourse: (state, action: PayloadAction<{ courseId: string, updates: Partial<Course> }>) => {
            const index = state.courses.findIndex(course => course.id === action.payload.courseId);
            if (index !== -1) {
                state.courses[index] = { ...state.courses[index], ...action.payload.updates };
            }
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
        },
        loadInitialData: (state) => {
            const savedCourses = localStorage.getItem('courses');
            const savedTheme = localStorage.getItem('theme');

            if (savedCourses) {
                state.courses = JSON.parse(savedCourses);
            }

            if (savedTheme) {
                state.theme = savedTheme as 'light' | 'dark';
            }
        }
    }
});

export const { addCourse, updateCourse, calculateStats, toggleTheme, loadInitialData } = courseSlice.actions;
export default courseSlice.reducer; 