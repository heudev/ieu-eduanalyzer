import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
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

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        } as Department;
    });
};

export const updateDepartment = async (departmentId: string, input: DepartmentInput): Promise<void> => {
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