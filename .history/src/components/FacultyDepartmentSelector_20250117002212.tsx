import React from 'react';
import { Select, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Faculty, Department } from '../types';
import { setSelectedFaculty, addDepartment, removeDepartment } from '../store/courseSlice';

const { Option } = Select;

interface RootState {
    course: {
        selectedFaculty: Faculty | null;
        selectedDepartments: Department[];
        faculties: Faculty[];
    };
}

const FacultyDepartmentSelector: React.FC = () => {
    const dispatch = useDispatch();
    const selectedFaculty = useSelector((state: RootState) => state.course.selectedFaculty);
    const selectedDepartments = useSelector((state: RootState) => state.course.selectedDepartments);
    const faculties = useSelector((state: RootState) => state.course.faculties);

    const handleFacultyChange = (facultyName: string) => {
        const faculty = faculties.find(f => f.faculty === facultyName);
        if (faculty) {
            dispatch(setSelectedFaculty(faculty));
        }
    };

    const handleDepartmentAdd = (departmentName: string) => {
        if (selectedFaculty) {
            const department = selectedFaculty.departments.find(
                dept => dept.department === departmentName
            );
            if (department) {
                dispatch(addDepartment(department));
            }
        }
    };

    const handleDepartmentRemove = (departmentName: string) => {
        dispatch(removeDepartment(departmentName));
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
                    value={selectedFaculty?.faculty}
                >
                    {faculties.map(faculty => (
                        <Option key={faculty.faculty} value={faculty.faculty}>
                            {faculty.faculty}
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
                        {selectedFaculty.departments
                            .filter(dept => !selectedDepartments.find(d => d.department === dept.department))
                            .map(department => (
                                <Option key={department.department} value={department.department}>
                                    {department.department}
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
                            key={department.department}
                            closable
                            onClose={() => handleDepartmentRemove(department.department)}
                            className="px-3 py-1"
                        >
                            {department.department}
                        </Tag>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FacultyDepartmentSelector; 