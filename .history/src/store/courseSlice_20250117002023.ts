import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseState, Department, Faculty, LetterGrade } from '../types';
import departmentsData from '../data/departments.json';

const calculateStats = (courses: Course[]) => {
    const stats = {
        gpa: 0,
        termAverages: {},
        passedCourses: 0,
        failedCourses: 0,
        activeCourses: 0,
        totalCredits: 0,
        completedCredits: 0,
    };

    const gradePoints: { [key in LetterGrade]: number } = {
        'AA': 4.0,
        'BA': 3.5,
        'BB': 3.0,
        'CB': 2.5,
        'CC': 2.0,
        'DC': 1.5,
        'DD': 1.0,
        'FF': 0.0,
        'NA': 0.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
        if (course.status === 'PASSED' && course.letterGrade && course.credits) {
            stats.passedCourses++;
            stats.completedCredits += course.credits;
            totalPoints += gradePoints[course.letterGrade] * course.credits;
            totalCredits += course.credits;
        } else if (course.status === 'FAILED') {
            stats.failedCourses++;
        } else if (course.status === 'TAKING') {
            stats.activeCourses++;
        }
        if (course.credits) {
            stats.totalCredits += course.credits;
        }
    });

    stats.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    return stats;
};

const initialState: CourseState = {
    selectedFaculty: null,
    selectedDepartments: [],
    courses: [],
    theme: 'light',
    stats: calculateStats([]),
    faculties: departmentsData,
};

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('courseState');
        if (serializedState === null) {
            return initialState;
        }
        return JSON.parse(serializedState);
    } catch {
        return initialState;
    }
};

const saveState = (state: CourseState) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('courseState', serializedState);
    } catch {
        // Handle errors
    }
};

export const courseSlice = createSlice({
    name: 'course',
    initialState: loadState(),
    reducers: {
        setSelectedFaculty: (state, action: PayloadAction<Faculty>) => {
            state.selectedFaculty = action.payload;
            saveState(state);
        },
        addDepartment: (state, action: PayloadAction<Department>) => {
            if (!state.selectedDepartments.find((dept: Department) => dept.department === action.payload.department)) {
                state.selectedDepartments.push(action.payload);
                state.courses = [...state.courses, ...action.payload.courses];
                state.stats = calculateStats(state.courses);
                saveState(state);
            }
        },
        removeDepartment: (state, action: PayloadAction<string>) => {
            state.selectedDepartments = state.selectedDepartments.filter(
                (dept: Department) => dept.department !== action.payload
            );
            state.courses = state.courses.filter(
                (course: Course) => !course.code.startsWith(action.payload)
            );
            state.stats = calculateStats(state.courses);
            saveState(state);
        },
        updateCourse: (state, action: PayloadAction<{ courseId: string; updates: Partial<Course> }>) => {
            const courseIndex = state.courses.findIndex((c: Course) => c.id === action.payload.courseId);
            if (courseIndex !== -1) {
                state.courses[courseIndex] = {
                    ...state.courses[courseIndex],
                    ...action.payload.updates,
                };
                state.stats = calculateStats(state.courses);
                saveState(state);
            }
        },
        addCourse: (state, action: PayloadAction<Course>) => {
            state.courses.push(action.payload);
            state.stats = calculateStats(state.courses);
            saveState(state);
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            saveState(state);
        },
        loadInitialData: (state) => {
            state.faculties = departmentsData;
            saveState(state);
        },
    },
});

export const {
    setSelectedFaculty,
    addDepartment,
    removeDepartment,
    updateCourse,
    addCourse,
    toggleTheme,
    loadInitialData,
} = courseSlice.actions;

export default courseSlice.reducer; 