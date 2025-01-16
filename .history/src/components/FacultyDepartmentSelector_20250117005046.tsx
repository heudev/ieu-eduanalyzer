import React, { useEffect, useState } from 'react';
import { Select, Button, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Faculty, Department } from '../types';
import { setSelectedFaculty, addDepartment, removeDepartment } from '../store/courseSlice';
import departments from '../data/departments.json';

const { Option } = Select;

interface RootState {
    course: {
        selectedFaculty: Faculty | null;
        selectedDepartments: Department[];
    };
}

const FacultyDepartmentSelector: React.FC = () => {
    const dispatch = useDispatch();
    const selectedFaculty = useSelector((state: RootState) => state.course.selectedFaculty);
    const selectedDepartments = useSelector((state: RootState) => state.course.selectedDepartments);

    const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);

    useEffect(() => {
        // Extract unique faculties from departments data
        const uniqueFaculties = Array.from(
            new Set(departments.map(dept => dept.facultyId))
        ).map(facultyId => ({
            id: facultyId,
            name: departments.find(dept => dept.facultyId === facultyId)?.facultyName || '',
        }));
        setFaculties(uniqueFaculties);
    }, []);

    useEffect(() => {
        if (selectedFaculty) {
            const depts = departments.filter(
                dept => dept.facultyId === selectedFaculty.id
            );
            setAvailableDepartments(depts);
        }
    }, [selectedFaculty]);

    const handleFacultyChange = (facultyId: string) => {
        const faculty = faculties.find(f => f.id === facultyId);
        if (faculty) {
            dispatch(setSelectedFaculty(faculty));
        }
    };

    const handleDepartmentAdd = (departmentId: string) => {
        const department = departments.find(dept => dept.id === departmentId);
        if (department) {
            dispatch(addDepartment(department));
        }
    };

    const handleDepartmentRemove = (departmentId: string) => {
        dispatch(removeDepartment(departmentId));
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg shadow">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Faculty
                </label>
                <Select
                    className="w-full"
                    placeholder="Select a faculty"
                    onChange={handleFacultyChange}
                    value={selectedFaculty?.id}
                >
                    {faculties.map(faculty => (
                        <Option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                        </Option>
                    ))}
                </Select>
            </div>

            {selectedFaculty && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Department
                    </label>
                    <Select
                        className="w-full"
                        placeholder="Select a department"
                        onChange={handleDepartmentAdd}
                    >
                        {availableDepartments
                            .filter(dept => !selectedDepartments.find(d => d.id === dept.id))
                            .map(department => (
                                <Option key={department.id} value={department.id}>
                                    {department.name}
                                </Option>
                            ))}
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Selected Departments
                </label>
                <div className="flex flex-wrap gap-2">
                    {selectedDepartments.map(department => (
                        <Tag
                            key={department.id}
                            closable
                            onClose={() => handleDepartmentRemove(department.id)}
                            className="px-3 py-1"
                        >
                            {department.name}
                        </Tag>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FacultyDepartmentSelector; 