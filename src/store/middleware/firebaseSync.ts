import { Middleware, Action, AnyAction } from '@reduxjs/toolkit';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { RootState } from '../../types';

export const loadFirebaseState = async (userId: string) => {
    try {
        const docRef = doc(db, 'userCourses', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                course: {
                    ...data,
                    departments: data.departments || []
                }
            };
        }
        return undefined;
    } catch (err) {
        console.error('Firebase\'den veri yüklenirken hata oluştu:', err);
        return undefined;
    }
};

export const syncToFirebase = async (state: RootState) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
        await setDoc(doc(db, 'userCourses', currentUser.uid), {
            faculty: state.course.faculty,
            department: state.course.department,
            courses: state.course.courses,
            departments: state.course.departments,
            stats: state.course.stats
        });
    } catch (err) {
        console.error('Veriler Firebase\'e aktarılırken hata oluştu:', err);
    }
};

export const firebaseSyncMiddleware: Middleware = store => next => action => {
    const result = next(action);
    const state = store.getState() as RootState;
    const currentUser = auth.currentUser;

    if (currentUser) {
        syncToFirebase(state);
    }

    return result;
}; 