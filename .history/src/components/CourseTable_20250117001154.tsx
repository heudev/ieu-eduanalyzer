import React from 'react';
import { Table, Select, Button, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Course, LetterGrade, CourseStatus } from '../types';
import { updateCourse, addCourse } from '../store/courseSlice';

const { Option } = Select;

interface RootState {
    course: {
        courses: Course[];
    };
}

const CourseTable: React.FC = () => {
    const dispatch = useDispatch();
    const courses = useSelector((state: RootState) => state.course.courses);

    const letterGrades: LetterGrade[] = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF', 'NA'];
    const courseStatuses: CourseStatus[] = ['PASSED', 'FAILED', 'TAKING', 'NOT_TAKEN'];

    const handleGradeChange = (courseId: string, letterGrade: LetterGrade) => {
        dispatch(updateCourse({ courseId, updates: { letterGrade } }));
    };

    const handleStatusChange = (courseId: string, status: CourseStatus) => {
        dispatch(updateCourse({ courseId, updates: { status } }));
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            sorter: (a: Course, b: Course) => a.code.localeCompare(b.code),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Course, b: Course) => a.name.localeCompare(b.name),
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            sorter: (a: Course, b: Course) => a.credits - b.credits,
        },
        {
            title: 'Letter Grade',
            dataIndex: 'letterGrade',
            key: 'letterGrade',
            render: (letterGrade: LetterGrade, record: Course) => (
                <Select
                    value={letterGrade}
                    onChange={(value: LetterGrade) => handleGradeChange(record.id, value)}
                    className="w-24"
                >
                    {letterGrades.map(grade => (
                        <Option key={grade} value={grade}>
                            {grade}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: CourseStatus, record: Course) => (
                <Select
                    value={status}
                    onChange={(value: CourseStatus) => handleStatusChange(record.id, value)}
                    className="w-32"
                >
                    {courseStatuses.map(status => (
                        <Option key={status} value={status}>
                            {status.replace('_', ' ')}
                        </Option>
                    ))}
                </Select>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Table
                columns={columns}
                dataSource={courses}
                rowKey="id"
                className="bg-white rounded-lg shadow"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} courses`,
                }}
            />
        </div>
    );
};

export default CourseTable; 