import React, { useState, useMemo, useCallback } from 'react';
import { Table, Select, Button, Space, Modal, Form, InputNumber, Input, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Course, LetterGrade, CourseStatus, RootState } from '../types';
import { updateCourse, addCourse, calculateStats, deleteCourse } from '../store/courseSlice';
import { PlusOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const CourseTable: React.FC = () => {
    const dispatch = useDispatch();
    const { courses, loading, error } = useSelector((state: RootState) => state.course);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const letterGrades: LetterGrade[] = useMemo(() =>
        ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF', 'NA'],
        []
    );

    const courseStatuses: CourseStatus[] = useMemo(() =>
        ['PASSED', 'FAILED', 'TAKING', 'NOT_TAKEN'],
        []
    );

    const handleGradeChange = useCallback((courseId: string, letterGrade: LetterGrade) => {
        const courseToUpdate = courses.find(course => course.id === courseId);
        if (!courseToUpdate) {
            message.error('Ders bulunamadı');
            return;
        }

        let status: CourseStatus = 'NOT_TAKEN';
        if (letterGrade === 'FF') {
            status = 'FAILED';
        } else if (letterGrade !== 'NA') {
            status = 'PASSED';
        }

        dispatch(updateCourse({
            courseId,
            updates: {
                letterGrade,
                status
            }
        }));
        dispatch(calculateStats());
    }, [dispatch, courses]);

    const handleStatusChange = useCallback((courseId: string, status: CourseStatus) => {
        const courseToUpdate = courses.find(course => course.id === courseId);
        if (!courseToUpdate) {
            message.error('Ders bulunamadı');
            return;
        }

        let letterGrade: LetterGrade = 'NA';
        if (status === 'FAILED') {
            letterGrade = 'FF';
        }

        dispatch(updateCourse({
            courseId,
            updates: {
                status,
                letterGrade
            }
        }));
        dispatch(calculateStats());
    }, [dispatch, courses]);

    const handleDeleteCourse = useCallback((courseId: string) => {
        Modal.confirm({
            title: 'Dersi Sil',
            content: 'Bu dersi silmek istediğinizden emin misiniz?',
            okText: 'Evet',
            cancelText: 'Hayır',
            onOk: () => {
                dispatch(deleteCourse(courseId));
                dispatch(calculateStats());
                message.success('Ders başarıyla silindi');
            }
        });
    }, [dispatch]);

    const handleAddCourse = useCallback(() => {
        form.validateFields().then(values => {
            const newCourse: Course = {
                id: Date.now().toString(),
                code: values.code,
                name: values.name,
                credits: values.credits,
                semester: values.semester,
                year: values.year,
                letterGrade: 'NA',
                status: 'NOT_TAKEN'
            };
            dispatch(addCourse(newCourse));
            dispatch(calculateStats());
            setIsModalVisible(false);
            form.resetFields();
            message.success('Ders başarıyla eklendi');
        });
    }, [dispatch, form]);

    const handleExport = useCallback(() => {
        try {
            const csvContent = [
                ['Kod', 'İsim', 'Kredi', 'Harf Notu', 'Durum', 'Dönem', 'Yıl'],
                ...courses.map(course => [
                    course.code,
                    course.name,
                    course.credits,
                    course.letterGrade,
                    course.status,
                    course.semester,
                    course.year
                ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'dersler.csv';
            link.click();
            message.success('Dersler başarıyla dışa aktarıldı');
        } catch (error) {
            message.error('Dışa aktarma sırasında bir hata oluştu');
        }
    }, [courses]);

    const uniqueSemesters = useMemo(() =>
        Array.from(new Set(courses.map(course => course.semester))).sort(),
        [courses]
    );

    const calculateSemesterAverage = useCallback((semesterCourses: Course[]) => {
        const gradePoints: { [key in LetterGrade]: number } = {
            'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
            'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'FF': 0.0, 'NA': 0.0
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

        return totalCredits > 0 ? Number(totalPoints / totalCredits).toFixed(2) : 0;
    }, []);

    const columns = useMemo(() => [
        {
            title: 'Kod',
            dataIndex: 'code',
            key: 'code'
        },
        {
            title: 'İsim',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Kredi',
            dataIndex: 'credits',
            key: 'credits'
        },
        {
            title: 'Dönem',
            dataIndex: 'semester',
            key: 'semester'
        },
        {
            title: 'Harf Notu',
            dataIndex: 'letterGrade',
            key: 'letterGrade',
            render: (_: LetterGrade | undefined, record: Course) => (
                <Select
                    value={record.letterGrade || 'NA'}
                    onChange={(value: LetterGrade) => handleGradeChange(record.id, value)}
                    className="w-24"
                >
                    {letterGrades.map(grade => (
                        <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (_: CourseStatus | undefined, record: Course) => (
                <Select
                    value={record.status || 'NOT_TAKEN'}
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
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: Course) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCourse(record.id)}
                />
            ),
        }
    ], [letterGrades, courseStatuses, handleGradeChange, handleStatusChange, handleDeleteCourse]);

    if (loading) {
        return <div className="text-center py-4">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        Ders Ekle
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                    >
                        CSV'ye Aktar
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
                        rowClassName={(record) => {
                            switch (record.status) {
                                case 'PASSED': return 'bg-green-50';
                                case 'FAILED': return 'bg-red-50';
                                case 'TAKING': return 'bg-blue-50';
                                default: return '';
                            }
                        }}
                    />
                </div>
            ))}

            <Modal
                title="Yeni Ders Ekle"
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
                        label="Ders Kodu"
                        rules={[{ required: true, message: 'Lütfen ders kodunu girin' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Ders Adı"
                        rules={[{ required: true, message: 'Lütfen ders adını girin' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="credits"
                        label="Kredi"
                        rules={[{ required: true, message: 'Lütfen krediyi girin' }]}
                    >
                        <InputNumber min={1} max={30} />
                    </Form.Item>
                    <Form.Item
                        name="semester"
                        label="Dönem"
                        rules={[{ required: true, message: 'Lütfen dönemi girin' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="year"
                        label="Yıl"
                        rules={[{ required: true, message: 'Lütfen yılı girin' }]}
                    >
                        <InputNumber min={1900} max={2100} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default React.memo(CourseTable); 