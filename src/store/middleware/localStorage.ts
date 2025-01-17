import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../../types';

const STORAGE_KEY = 'courseState';

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem(STORAGE_KEY);
        if (serializedState === null) {
            return undefined;
        }
        const state = JSON.parse(serializedState);
        return {
            course: {
                ...state.course,
                theme: state.course?.theme || 'light',
                departments: state.course?.departments || []
            }
        };
    } catch (err) {
        return undefined;
    }
};

export const localStorageMiddleware: Middleware = store => next => action => {
    const result = next(action);
    const state = store.getState() as RootState;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            course: {
                faculty: state.course.faculty,
                department: state.course.department,
                courses: state.course.courses,
                departments: state.course.departments,
                theme: state.course.theme,
                stats: state.course.stats
            }
        }));
    } catch (err) {
        console.error('Could not save state to localStorage:', err);
    }

    return result;
}; 