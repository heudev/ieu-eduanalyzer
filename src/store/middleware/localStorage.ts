import { Middleware } from '@reduxjs/toolkit';

// Local storage'dan state'i yükle
export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('courseState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error('State yüklenirken hata oluştu:', err);
        return undefined;
    }
};

// State'i local storage'a kaydet
export const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('courseState', serializedState);
    } catch (err) {
        console.error('State kaydedilirken hata oluştu:', err);
    }
};

// Redux middleware
export const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    saveState(store.getState());
    return result;
};