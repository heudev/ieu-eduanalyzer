import React, { useState, useMemo, useCallback } from 'react';
import { Table, Select, Button, Space, Modal, Form, InputNumber, Input, message, Tooltip, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Course, LetterGrade, CourseStatus, RootState } from '../types';
import { updateCourse, addCourse, calculateStats, deleteCourse } from '../store/courseSlice';
import { PlusOutlined, DownloadOutlined, DeleteOutlined, EditOutlined, TrophyOutlined, CompassOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase';
const { Option } = Select;

const CourseTable: React.FC = () => {
    const dispatch = useDispatch();
    const { courses } = useSelector((state: RootState) => state.course);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const { currentUser } = useAuth();

    const letterGrades: LetterGrade[] = useMemo(() =>
        ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF', 'NA'],
        []
    );

    const courseStatuses: CourseStatus[] = useMemo(() =>
        ['TAKING', 'NOT TAKING'],
        []
    );

    const handleGradeChange = useCallback((courseId: string, letterGrade: LetterGrade) => {
        const courseToUpdate = courses.find(course => course.id === courseId);
        if (!courseToUpdate) {
            message.error('Course not found');
            return;
        }

        dispatch(updateCourse({
            courseId,
            updates: {
                letterGrade
            },
            userId: currentUser?.uid
        }));
        dispatch(calculateStats());

        logEvent(analytics, 'grade_update', {
            course_code: courseToUpdate.code,
            grade: letterGrade
        });
    }, [dispatch, courses, currentUser]);

    const handleStatusChange = useCallback((courseId: string, status: CourseStatus) => {
        const courseToUpdate = courses.find(course => course.id === courseId);
        if (!courseToUpdate) {
            message.error('Course not found');
            return;
        }

        dispatch(updateCourse({
            courseId,
            updates: {
                status
            },
            userId: currentUser?.uid
        }));
        dispatch(calculateStats());

        logEvent(analytics, 'course_status_update', {
            course_code: courseToUpdate.code,
            status: status
        });
    }, [dispatch, courses, currentUser]);

    const handleDeleteCourse = useCallback((courseId: string) => {
        const courseToDelete = courses.find(course => course.id === courseId);
        if (!courseToDelete) return;

        Modal.confirm({
            title: 'Delete Course',
            content: 'Are you sure you want to delete this course?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => {
                dispatch(deleteCourse({
                    courseId,
                    userId: currentUser?.uid
                }));
                dispatch(calculateStats());
                message.success('Course successfully deleted');

                logEvent(analytics, 'course_delete', {
                    course_code: courseToDelete.code
                });
            }
        });
    }, [dispatch, currentUser, courses]);

    const handleAddCourse = useCallback(() => {
        form.validateFields().then(values => {
            const newCourse: Course = {
                id: Date.now().toString(),
                code: values.code,
                name: values.name,
                credits: values.credits,
                semester: values.semester,
                letterGrade: 'NA',
                status: 'NOT TAKING'
            };
            dispatch(addCourse({
                course: newCourse,
                userId: currentUser?.uid
            }));
            dispatch(calculateStats());
            setIsModalVisible(false);
            form.resetFields();
            message.success('Course successfully added');

            logEvent(analytics, 'course_add', {
                course_code: values.code,
                course_name: values.name,
                credits: values.credits,
                semester: values.semester
            });
        });
    }, [dispatch, form, currentUser]);

    const handleExport = useCallback(() => {
        try {
            const csvContent = [
                ['Code', 'Name', 'Credit', 'Grade', 'Status', 'Semester'],
                ...courses.map(course => [
                    course.code,
                    course.name,
                    course.credits,
                    course.letterGrade,
                    course.status,
                    course.semester,
                ])
            ].map(row => row.join(';')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'department.csv';
            link.click();
            message.success('Courses exported successfully');

            logEvent(analytics, 'courses_export', {
                total_courses: courses.length
            });
        } catch (error: any) {
            message.error('Error exporting courses');
            logEvent(analytics, 'courses_export_error', {
                error: error.message
            });
        }
    }, [courses]);

    const uniqueSemesters = useMemo(() =>
        Array.from(new Set(courses.map(course => course.semester))).sort(),
        [courses]
    );

    const calculateSemesterAverage = useCallback((semesterCourses: Course[]) => {
        const gradePoints: { [key in LetterGrade]: number } = {
            'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
            'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'FD': 0.5, 'FF': 0.0, 'NA': 0.0
        };

        const completedCourses = semesterCourses.filter(course =>
            course.letterGrade !== 'NA'
        );

        if (completedCourses.length === 0) return 0;

        const totalPoints = completedCourses.reduce((sum, course) => {
            const grade = course.letterGrade || 'NA';
            return sum + (gradePoints[grade] * (course.credits || 0));
        }, 0);

        const totalCredits = completedCourses.reduce((sum, course) =>
            sum + (course.credits || 0), 0
        );

        return totalCredits > 0 ? Number(totalPoints / totalCredits).toFixed(2) : 0;
    }, []);

    const handleEditCourse = useCallback((course: Course) => {
        setEditingCourse(course);
        editForm.setFieldsValue({
            code: course.code,
            name: course.name,
            credits: course.credits,
            semester: course.semester,
        });
        setIsEditModalVisible(true);
    }, [editForm]);

    const handleUpdateCourse = useCallback(() => {
        if (!editingCourse) return;

        editForm.validateFields().then(values => {
            dispatch(updateCourse({
                courseId: editingCourse.id,
                updates: {
                    ...values,
                    letterGrade: editingCourse.letterGrade,
                    status: editingCourse.status
                },
                userId: currentUser?.uid
            }));
            dispatch(calculateStats());
            setIsEditModalVisible(false);
            setEditingCourse(null);
            editForm.resetFields();
            message.success('Course successfully updated');
        });
    }, [dispatch, editForm, editingCourse, currentUser]);

    const MAX_COURSE_NAME_LENGTH = 50;

    const columns = useMemo(() => [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 400,
            render: (name: string) => {
                const truncatedName = name.length > MAX_COURSE_NAME_LENGTH
                    ? `${name.substring(0, MAX_COURSE_NAME_LENGTH)}...`
                    : name;
                return (
                    <Tooltip title={name} placement="topLeft">
                        <span>{truncatedName}</span>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Credit',
            dataIndex: 'credits',
            key: 'credits',
            width: 70,
        },
        {
            title: 'Letter Grade',
            dataIndex: 'letterGrade',
            key: 'letterGrade',
            width: 120,
            render: (_: LetterGrade | undefined, record: Course) => (
                <Select
                    value={record.letterGrade || 'NA'}
                    onChange={(value: LetterGrade) => handleGradeChange(record.id, value)}
                    className={`!w-20 ${record.letterGrade === 'FF' || record.letterGrade === 'FD'
                        ? 'text-gray-500'
                        : record.letterGrade !== 'NA'
                            ? 'text-green-600 font-semibold'
                            : ''
                        }`}
                >
                    {letterGrades.map(grade => (
                        <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (_: CourseStatus | undefined, record: Course) => (
                <Select
                    value={record.status || 'NOT TAKING'}
                    onChange={(value: CourseStatus) => handleStatusChange(record.id, value)}
                    className="!w-32"
                >
                    {courseStatuses.map(status => (
                        <Option key={status} value={status}>
                            {status === 'TAKING' ? 'TAKING' : 'NOT TAKING'}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_: any, record: Course) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCourse(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteCourse(record.id)}
                    />
                </Space>
            ),
        }
    ], [letterGrades, courseStatuses, handleGradeChange, handleStatusChange, handleDeleteCourse, handleEditCourse]);

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
                        Export to CSV
                    </Button>
                </Space>
            </div>

            <div className='space-y-10 overflow-x-auto'>
                {uniqueSemesters.map(semester => (
                    <div key={semester} className="mb-8">
                        <div className="text-lg font-semibold mb-2 flex justify-between items-center">
                            <div className='text-gray-700 flex items-center'>
                                <Tooltip title="This is the average grade for the semester">
                                    <CompassOutlined className="ml-2 mr-2" />
                                </Tooltip>
                                {semester}
                            </div>
                            <Tag icon={<TrophyOutlined />} color="success">
                                Semester Average: {calculateSemesterAverage(courses.filter(course => course.semester === semester))}
                            </Tag>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={courses.filter(course => course.semester === semester)}
                            rowKey="id"
                            className={`${semester.includes("Fall") ? "bg-gray-100" : "bg-gray-100"} rounded-lg shadow p-1.5`}
                            pagination={false}
                            rowHoverable={false}
                            size='small'
                            rowClassName={(record) => {
                                if (record.status === 'TAKING') {
                                    return 'bg-orange-200';
                                }
                                else if ((record.letterGrade as LetterGrade) === 'FF' || (record.letterGrade as LetterGrade) === 'FD') {
                                    return 'bg-red-200';
                                }
                                else if (record.letterGrade !== 'NA' && record.letterGrade !== 'FD' && record.letterGrade !== 'FF') {
                                    return 'bg-green-100';
                                }
                                return '';
                            }}
                        />
                    </div>
                ))}
            </div>

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
                        rules={[{ required: true, message: 'Course code is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Course Name"
                        rules={[{ required: true, message: 'Course name is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="credits"
                        label="Course Credit"
                        rules={[{ required: true, message: 'Course credit is required' }]}
                    >
                        <InputNumber min={1} max={30} />
                    </Form.Item>
                    <Form.Item
                        name="semester"
                        label="Semester"
                        rules={[{ required: true, message: 'Semester is required' }]}
                    >
                        <Select>
                            {uniqueSemesters.map(semester => (
                                <Option key={semester} value={semester}>{semester}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Edit Course"
                open={isEditModalVisible}
                onOk={handleUpdateCourse}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingCourse(null);
                    editForm.resetFields();
                }}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="code"
                        label="Course Code"
                        rules={[{ required: true, message: 'Course code is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Course Name"
                        rules={[{ required: true, message: 'Course name is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="credits"
                        label="Course Credit"
                        rules={[{ required: true, message: 'Course credit is required' }]}
                    >
                        <InputNumber min={1} max={30} />
                    </Form.Item>
                    <Form.Item
                        name="semester"
                        label="Semester"
                        rules={[{ required: true, message: 'Semester is required' }]}
                    >
                        <Select>
                            {uniqueSemesters.map(semester => (
                                <Option key={semester} value={semester}>{semester}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default React.memo(CourseTable);