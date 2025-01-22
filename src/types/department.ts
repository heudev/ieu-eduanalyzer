export interface Department {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DepartmentInput {
    name: string;
} 