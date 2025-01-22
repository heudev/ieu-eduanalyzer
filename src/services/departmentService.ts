import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Department, DepartmentInput } from '../types/department';

const COLLECTION_NAME = 'departments';

export const createDepartment = async (userId: string, input: DepartmentInput): Promise<Department> => {
    const now = new Date();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...input,
        userId,
        createdAt: now,
        updatedAt: now
    });

    return {
        id: docRef.id,
        ...input,
        userId,
        createdAt: now,
        updatedAt: now
    };
};

export const getUserDepartments = async (userId: string): Promise<Department[]> => {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
    } as Department));
};

export const updateDepartment = async (departmentId: string, userId: string, input: DepartmentInput): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, departmentId);
    await updateDoc(docRef, {
        ...input,
        updatedAt: new Date()
    });
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, departmentId);
    await deleteDoc(docRef);
};

// Local Storage işlemleri için yardımcı fonksiyonlar
const LOCAL_STORAGE_KEY = 'tempDepartments';

export const saveDepartmentToLocalStorage = (department: Omit<Department, 'id'>): void => {
    const existingDepartments = getDepartmentsFromLocalStorage();
    const tempId = Date.now().toString();
    existingDepartments.push({ ...department, id: tempId });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingDepartments));
};

export const getDepartmentsFromLocalStorage = (): Department[] => {
    const departments = localStorage.getItem(LOCAL_STORAGE_KEY);
    return departments ? JSON.parse(departments) : [];
};

export const clearLocalStorageDepartments = (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}; 