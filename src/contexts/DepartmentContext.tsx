import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Department, DepartmentInput } from '../types/department';
import * as departmentService from '../services/departmentService';

interface DepartmentContextType {
    departments: Department[];
    currentDepartment: Department | null;
    setCurrentDepartment: (department: Department | null) => void;
    addDepartment: (input: DepartmentInput) => Promise<void>;
    updateDepartment: (departmentId: string, input: DepartmentInput) => Promise<void>;
    deleteDepartment: (departmentId: string) => Promise<void>;
    isLoading: boolean;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDepartments = await departmentService.getUserDepartments(user.uid);
                    setDepartments(userDepartments);
                } catch (error) {
                    console.error('Departmanlar yüklenirken hata:', error);
                }
            } else {
                setDepartments([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addDepartment = async (input: DepartmentInput) => {
        const user = auth.currentUser;
        if (user) {
            const newDepartment = await departmentService.createDepartment(user.uid, input);
            setDepartments([...departments, newDepartment]);
        }
    };

    const updateDepartment = async (departmentId: string, input: DepartmentInput) => {
        const user = auth.currentUser;
        if (user) {
            await departmentService.updateDepartment(departmentId, user.uid, input);
            setDepartments(departments.map(dept =>
                dept.id === departmentId ? { ...dept, ...input, updatedAt: new Date() } : dept
            ));
        }
    };

    const deleteDepartment = async (departmentId: string) => {
        const user = auth.currentUser;
        if (user) {
            await departmentService.deleteDepartment(departmentId);
            setDepartments(departments.filter(dept => dept.id !== departmentId));
            if (currentDepartment?.id === departmentId) {
                setCurrentDepartment(null);
            }
        }
    };

    return (
        <DepartmentContext.Provider
            value={{
                departments,
                currentDepartment,
                setCurrentDepartment,
                addDepartment,
                updateDepartment,
                deleteDepartment,
                isLoading
            }}
        >
            {children}
        </DepartmentContext.Provider>
    );
};

export const useDepartments = () => {
    const context = useContext(DepartmentContext);
    if (context === undefined) {
        throw new Error('useDepartments must be used within a DepartmentProvider');
    }
    return context;
}; 