import React, { useState } from 'react';
import { Table, Select, Button, Space, Modal, Form, InputNumber, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Course, LetterGrade, CourseStatus } from '../types';
import { updateCourse, addCourse } from '../store/courseSlice';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

interface RootState {
    course: {
        courses: Course[];
    };
}

const CourseTable: React.FC = () => {
    const dispatch = useDispatch();
    const courses = useSelector((state: RootState) => state.course.courses);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const letterGrades: LetterGrade[] = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF', 'NA'];
    const courseStatuses: CourseStatus[] = ['PASSED', 'FAILED', 'TAKING', 'NOT_TAKEN'];

    const handleGradeChange = (courseId: string, letterGrade: LetterGrade) => {
        let status: CourseStatus = 'NOT_TAKEN';
        if (letterGrade === 'FF') {
            status = 'FAILED';
        } else if (letterGrade !== 'NA') {
            status = 'PASSED';
        }
        dispatch(updateCourse({ courseId, updates: { letterGrade, status } }));
    };

    const handleStatusChange = (courseId: string, status: CourseStatus) => {
        let letterGrade: LetterGrade = 'NA';
        if (status === 'FAILED') {
            letterGrade = 'FF';
        }
        dispatch(updateCourse({ courseId, updates: { status, letterGrade } }));
    };

    const handleAddCourse = () => {
        form.validateFields().then(values => {
            const newCourse: Course = {
                id: Date.now().toString(),
                code: values.code,
                prerequisites: null,
                name: values.name,
                ects: values.credits,
                grade: null,
                semester: values.semester,
                checked: false,
                enrolled: false,
                credits: values.credits,
                letterGrade: 'NA',
                status: 'NOT_TAKEN'
            };
            dispatch(addCourse(newCourse));
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleExport = () => {
        const csvContent = [
            ['Code', 'Name', 'ECTS', 'Letter Grade', 'Status', 'Semester'],
            ...courses.map(course => [
                course.code,
                course.name,
                course.ects,
                course.letterGrade || course.grade,
                course.status || (course.enrolled ? 'TAKING' : 'NOT_TAKEN'),
                course.semester
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'courses.csv';
        link.click();
    };

    const uniqueSemesters = Array.from(new Set(courses.map(course => course.semester)));

    const calculateSemesterAverage = (semesterCourses: Course[]) => {
        const gradePoints: { [key in LetterGrade]: number } = {
            'AA': 4.0,
            'BA': 3.5,
            'BB': 3.0,
            'CB': 2.5,
            'CC': 2.0,
            'DC': 1.5,
            'DD': 1.0,
            'FF': 0.0,
            'NA': 0.0
        };

        const completedCourses = semesterCourses.filter(course =>
            course.letterGrade !== 'NA' && course.status === 'PASSED'
        );

        if (completedCourses.length === 0) return 0;

        const totalPoints = completedCourses.reduce((sum, course) => {
            const grade = course.letterGrade || 'NA';
            return sum + (gradePoints[grade] * (course.credits || 0));
        }, 0);

        const totalCredits = completedCourses.reduce((sum, course) =>
            sum + (course.credits || 0), 0
        );

        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'ECTS',
            dataIndex: 'ects',
            key: 'ects',
        },
        {
            title: 'Semester',
            dataIndex: 'semester',
            key: 'semester',
        },
        {
            title: 'Letter Grade',
            dataIndex: 'letterGrade',
            key: 'letterGrade',
            render: (letterGrade: LetterGrade, record: Course) => (
                <Select
                    key={`grade-${record.id}`}
                    value={record.letterGrade || 'NA'}
                    onChange={(value: LetterGrade) => handleGradeChange(record.id!, value)}
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
                    key={`status-${record.id}`}
                    value={record.status || 'NOT_TAKEN'}
                    onChange={(value: CourseStatus) => handleStatusChange(record.id!, value)}
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
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        Add Course
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                    >
                        Export CSV
                    </Button>
                </Space>
            </div>

            {uniqueSemesters.map(semester => (
                <div key={semester} className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">
                        {semester} - Dönem Ortalaması: {calculateSemesterAverage(courses.filter(course => course.semester === semester))}
                    </h3>
                    <Table
                        columns={columns}
                        dataSource={courses.filter(course => course.semester === semester)}
                        rowKey="id"
                        className="bg-white rounded-lg shadow"
                        pagination={false}
                    />
                </div>
            ))}

            <Modal
                title="Add New Course"
                open={isModalVisible}
                onOk={handleAddCourse}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="code"
                        label="Course Code"
                        rules={[{ required: true, message: 'Please enter course code' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Course Name"
                        rules={[{ required: true, message: 'Please enter course name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="credits"
                        label="ECTS"
                        rules={[{ required: true, message: 'Please enter ECTS' }]}
                    >
                        <InputNumber min={1} max={30} />
                    </Form.Item>
                    <Form.Item
                        name="semester"
                        label="Semester"
                        rules={[{ required: true, message: 'Please select semester' }]}
                    >
                        <Select>
                            {uniqueSemesters.map(sem => (
                                <Option key={sem} value={sem}>{sem}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CourseTable; 