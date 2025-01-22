import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, LetterGrade } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
    stats: {
        totalCredits: number;
        completedCredits: number;
        gpa: number;
        activeCourses: number;
        remainingCourses: number;
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
    const activeCourses = courses.filter(c => c.status === 'TAKING').length;
    const passedCourses = completedCourses.filter(c => (c.letterGrade !== 'FF' && c.letterGrade !== 'FD') && c.status !== "TAKING").length;
    const failedCourses = completedCourses.filter(c => (c.letterGrade === 'FF' || c.letterGrade === 'FD') && c.status !== "TAKING").length;
    const remainingCourses = courses.filter(c => c.status !== 'TAKING' && c.letterGrade === 'NA').length;

    return {
        totalCredits,
        completedCredits,
        gpa,
        activeCourses,
        passedCourses,
        failedCourses,
        remainingCourses
    };
};

const initialState: CourseState = {
    faculty: null,
    department: null,
    courses: [],
    departments: [],
    stats: {
        gpa: 0,
        activeCourses: 0,
        totalCredits: 0,
        completedCredits: 0,
        remainingCourses: 0
    }
};

const updateFirestore = async (userId: string | null, faculty: string, department: string, courses: Course[]) => {
    if (!userId) return;

    const departmentId = `${userId}_${faculty}_${department}`;
    const departmentRef = doc(db, 'departments', departmentId);

    try {
        await updateDoc(departmentRef, {
            courses,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating Firestore:', error);
    }
};

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setState: (state, action) => {
            return {
                ...state,
                ...action.payload
            };
        },
        setSelectedFacultyAndDepartment: (state, action: PayloadAction<{
            faculty: string;
            department: string;
            courses: Course[];
            userId?: string | null;
        }>) => {
            const existingDeptIndex = state.departments.findIndex(
                d => d.faculty === action.payload.faculty && d.department === action.payload.department
            );

            if (existingDeptIndex === -1) {
                state.departments.push({
                    faculty: action.payload.faculty,
                    department: action.payload.department,
                    courses: action.payload.courses
                });
                state.faculty = action.payload.faculty;
                state.department = action.payload.department;
                state.courses = action.payload.courses;
            } else {
                state.faculty = action.payload.faculty;
                state.department = action.payload.department;
                state.courses = state.departments[existingDeptIndex].courses;
            }

            state.stats = computeCourseStats(state.courses);

            // Firestore güncelleme
            if (action.payload.userId) {
                updateFirestore(
                    action.payload.userId,
                    action.payload.faculty,
                    action.payload.department,
                    state.courses
                );
            }
        },
        updateCourse: (state, action: PayloadAction<{
            courseId: string;
            updates: Partial<Course>;
            userId?: string | null;
        }>) => {
            const courseIndex = state.courses.findIndex(c => c.id === action.payload.courseId);
            if (courseIndex !== -1) {
                const oldCourse = state.courses[courseIndex];
                const updatedCourse = {
                    ...oldCourse,
                    ...action.payload.updates
                };
                state.courses[courseIndex] = updatedCourse;

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

                // Firestore güncelleme
                if (action.payload.userId && state.faculty && state.department) {
                    updateFirestore(
                        action.payload.userId,
                        state.faculty,
                        state.department,
                        state.courses
                    );
                }
            }
        },
        addCourse: (state, action: PayloadAction<{
            course: Course;
            userId?: string | null;
        }>) => {
            state.courses.push(action.payload.course);

            const deptIndex = state.departments.findIndex(
                d => d.faculty === state.faculty && d.department === state.department
            );
            if (deptIndex !== -1) {
                state.departments[deptIndex].courses.push(action.payload.course);
            }

            state.stats = computeCourseStats(state.courses);

            // Firestore güncelleme
            if (action.payload.userId && state.faculty && state.department) {
                updateFirestore(
                    action.payload.userId,
                    state.faculty,
                    state.department,
                    state.courses
                );
            }
        },
        deleteCourse: (state, action: PayloadAction<{
            courseId: string;
            userId?: string | null;
        }>) => {
            state.courses = state.courses.filter(course => course.id !== action.payload.courseId);

            const deptIndex = state.departments.findIndex(
                d => d.faculty === state.faculty && d.department === state.department
            );
            if (deptIndex !== -1) {
                state.departments[deptIndex].courses = state.departments[deptIndex].courses.filter(
                    course => course.id !== action.payload.courseId
                );
            }

            state.stats = computeCourseStats(state.courses);

            // Firestore güncelleme
            if (action.payload.userId && state.faculty && state.department) {
                updateFirestore(
                    action.payload.userId,
                    state.faculty,
                    state.department,
                    state.courses
                );
            }
        },
        calculateStats: (state) => {
            state.stats = computeCourseStats(state.courses);
        },
        removeDepartment: (state, action: PayloadAction<{
            faculty: string;
            department: string;
            userId?: string | null;
        }>) => {
            state.departments = state.departments.filter(
                d => !(d.faculty === action.payload.faculty && d.department === action.payload.department)
            );

            if (state.faculty === action.payload.faculty && state.department === action.payload.department) {
                state.faculty = null;
                state.department = null;
                state.courses = [];
                state.stats = computeCourseStats([]);
            }
        }
    }
});

export const {
    setState,
    setSelectedFacultyAndDepartment,
    updateCourse,
    addCourse,
    deleteCourse,
    calculateStats,
    removeDepartment,
} = courseSlice.actions;

export default courseSlice.reducer;