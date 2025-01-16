import React, { useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Course } from '../types';
import { updateCourse, addCourse } from '../store/courseSlice';
import departments from '../data/departments.json';

const { Option } = Select;

interface RootState {
    course: {
        courses: Course[];
    };
}

interface Department {
    department: string;
    courses: any[];
}

interface Faculty {
    faculty: string;
    departments: Department[];
}

const FacultyDepartmentSelector: React.FC = () => {
    const dispatch = useDispatch();
    const [selectedFaculty, setSelectedFaculty] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
    const [departmentCourses, setDepartmentCourses] = useState<any[]>([]);

    const faculties = departments.map((faculty: Faculty) => faculty.faculty);

    const handleFacultyChange = (value: string) => {
        setSelectedFaculty(value);
        setSelectedDepartment('');
        const faculty = departments.find((f: Faculty) => f.faculty === value);
        setAvailableDepartments(faculty?.departments || []);
        setDepartmentCourses([]);
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        const department = availableDepartments.find(
            (dept: Department) => dept.department === value
        );
        setDepartmentCourses(department?.courses || []);
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg shadow">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fakülte Seçimi
                </label>
                <Select
                    className="w-full"
                    placeholder="Fakülte seçin"
                    value={selectedFaculty}
                    onChange={handleFacultyChange}
                >
                    {faculties.map((faculty: string) => (
                        <Option key={faculty} value={faculty}>
                            {faculty}
                        </Option>
                    ))}
                </Select>
            </div>

            {selectedFaculty && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bölüm Seçimi
                    </label>
                    <Select
                        className="w-full"
                        placeholder="Bölüm seçin"
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                    >
                        {availableDepartments.map((dept: Department) => (
                            <Option key={dept.department} value={dept.department}>
                                {dept.department}
                            </Option>
                        ))}
                    </Select>
                </div>
            )}

            {departmentCourses.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bölüm Dersleri</h3>
                    <div className="space-y-2">
                        {departmentCourses.map((course) => (
                            <div
                                key={course.code}
                                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                            >
                                <div className="font-medium">{course.code} - {course.name}</div>
                                <div className="text-sm text-gray-600">
                                    <span>ECTS: {course.ects}</span>
                                    <span className="mx-2">|</span>
                                    <span>Dönem: {course.semester}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDepartmentSelector; 