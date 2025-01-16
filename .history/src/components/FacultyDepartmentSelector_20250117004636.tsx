import React from 'react';
import { Select, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Course } from '../types';
import { updateCourse, addCourse } from '../store/courseSlice';

const { Option } = Select;

interface RootState {
    course: {
        courses: Course[];
    };
}

const FacultyDepartmentSelector: React.FC = () => {
    const dispatch = useDispatch();
    const courses = useSelector((state: RootState) => state.course.courses);

    // Benzersiz bölümleri al
    const departments = Array.from(new Set(courses.map(course => course.code.split(' ')[0])));

    const handleDepartmentAdd = (departmentCode: string) => {
        // Seçilen bölüme ait örnek bir ders ekle
        const newCourse: Course = {
            id: Date.now().toString(),
            code: `${departmentCode} 101`,
            name: 'New Course',
            ects: 0,
            credits: 0,
            semester: '1',
            prerequisites: null,
            letterGrade: 'NA',
            status: 'NOT_TAKEN'
        };
        dispatch(addCourse(newCourse));
    };

    const handleDepartmentRemove = (departmentCode: string) => {
        // Seçilen bölüme ait tüm dersleri kaldır
        courses
            .filter(course => course.code.startsWith(departmentCode))
            .forEach(course => {
                dispatch(updateCourse({
                    courseId: course.id!,
                    updates: {
                        status: 'NOT_TAKEN',
                        letterGrade: 'NA'
                    }
                }));
            });
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg shadow">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bölüm Ekle
                </label>
                <Select
                    className="w-full"
                    placeholder="Bölüm seçin"
                    onChange={handleDepartmentAdd}
                >
                    {departments.map(department => (
                        <Option key={department} value={department}>
                            {department}
                        </Option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Seçili Bölümler
                </label>
                <div className="flex flex-wrap gap-2">
                    {departments.map(department => (
                        <Tag
                            key={department}
                            closable
                            onClose={() => handleDepartmentRemove(department)}
                            className="px-3 py-1"
                        >
                            {department}
                        </Tag>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FacultyDepartmentSelector; 