import React, { useState } from 'react';
import { Table, Select, Button, Space, Input, Modal, Form, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Course, LetterGrade, CourseStatus } from '../types';
import { updateCourse, addCourse } from '../store/courseSlice';
import { SearchOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

interface RootState {
    course: {
        courses: Course[];
    };
}

const CourseTable: React.FC = () => {
    const dispatch = useDispatch();
    const courses = useSelector((state: RootState) => state.course.courses);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<string>('all');
    const [form] = Form.useForm();

    const letterGrades: LetterGrade[] = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF', 'NA'];
    const courseStatuses: CourseStatus[] = ['PASSED', 'FAILED', 'TAKING', 'NOT_TAKEN'];
    const semesters = ['1. Year Fall', '1. Year Spring', '2. Year Fall', '2. Year Spring', '3. Year Fall', '3. Year Spring', '4. Year Fall', '4. Year Spring'];

    const handleGradeChange = (courseId: string, letterGrade: LetterGrade) => {
        dispatch(updateCourse({ courseId, updates: { letterGrade } }));
    };

    const handleStatusChange = (courseId: string, status: CourseStatus) => {
        dispatch(updateCourse({ courseId, updates: { status } }));
    };

    const handleAddCourse = () => {
        form.validateFields().then(values => {
            const newCourse: Course = {
                id: Date.now().toString(),
                code: values.code,
                name: values.name,
                credits: values.credits,
                letterGrade: 'NA',
                status: 'NOT_TAKEN',
                semester: values.semester
            };
            dispatch(addCourse(newCourse));
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleExport = () => {
        const csvContent = [
            ['Code', 'Name', 'Credits', 'Letter Grade', 'Status', 'Semester'],
            ...filteredCourses.map(course => [
                course.code,
                course.name,
                course.credits,
                course.letterGrade,
                course.status,
                course.semester
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'courses.csv';
        link.click();
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.code.toLowerCase().includes(searchText.toLowerCase()) ||
            course.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesSemester = selectedSemester === 'all' || course.semester?.includes(selectedSemester);
        return matchesSearch && matchesSemester;
    });

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
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <Space>
                    <Search
                        placeholder="Search courses..."
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        style={{ width: 200 }}
                        value={selectedSemester}
                        onChange={setSelectedSemester}
                        placeholder="Filter by semester"
                    >
                        <Option value="all">All Semesters</Option>
                        {semesters.map(sem => (
                            <Option key={sem} value={sem}>{sem}</Option>
                        ))}
                    </Select>
                </Space>
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

            <Table
                columns={columns}
                dataSource={filteredCourses}
                rowKey="id"
                className="bg-white rounded-lg shadow"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} courses`,
                }}
            />

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
                        label="Credits"
                        rules={[{ required: true, message: 'Please enter credits' }]}
                    >
                        <InputNumber min={1} max={30} />
                    </Form.Item>
                    <Form.Item
                        name="semester"
                        label="Semester"
                        rules={[{ required: true, message: 'Please select semester' }]}
                    >
                        <Select>
                            {semesters.map(sem => (
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