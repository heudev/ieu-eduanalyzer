import React, { useState, useMemo, useEffect } from 'react';
import { Select, Card, Row, Col, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Faculty, Department, RootState } from '../types';
import departmentsData from '../data/departments.json';
import { setSelectedFacultyAndDepartment } from '../store/courseSlice';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;
const { Title } = Typography;

const FacultyDepartmentSelector: React.FC = () => {
    const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const theme = useSelector((state: RootState) => state.course.theme);
    const dispatch = useDispatch();

    const faculties = useMemo(() =>
        [...new Set(departmentsData.map(item => item.faculty))],
        []
    );

    const departments = useMemo(() => {
        if (!selectedFaculty) return [];
        const facultyData = departmentsData.find(f => f.faculty === selectedFaculty);
        return facultyData ? facultyData.departments.map(d => d.department) : [];
    }, [selectedFaculty]);

    useEffect(() => {
        if (selectedFaculty && selectedDepartment) {
            const facultyData = departmentsData.find(f => f.faculty === selectedFaculty);
            const departmentData = facultyData?.departments.find(d => d.department === selectedDepartment);

            if (facultyData && departmentData) {
                const coursesWithIds = departmentData.courses.map(course => ({
                    ...course,
                    id: uuidv4(),
                    credits: course.ects,
                    letterGrade: course.grade as LetterGrade || 'NA',
                    status: course.enrolled ? 'TAKING' : 'NOT_TAKEN'
                }));

                dispatch(setSelectedFacultyAndDepartment({
                    faculty: selectedFaculty,
                    department: selectedDepartment,
                    courses: coursesWithIds
                }));
            }
        }
    }, [selectedFaculty, selectedDepartment, dispatch]);

    const handleFacultyChange = (value: string) => {
        setSelectedFaculty(value);
        setSelectedDepartment(null);
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
    };

    return (
        <div className="space-y-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card
                        title="Fakülte Seçimi"
                        className="h-full"
                        style={{
                            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
                            borderColor: theme === 'dark' ? '#434343' : '#f0f0f0'
                        }}
                    >
                        <Select
                            placeholder="Fakülte seçiniz"
                            style={{ width: '100%' }}
                            value={selectedFaculty}
                            onChange={handleFacultyChange}
                        >
                            {faculties.map(faculty => (
                                <Option key={faculty} value={faculty}>
                                    {faculty}
                                </Option>
                            ))}
                        </Select>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title="Bölüm Seçimi"
                        className="h-full"
                        style={{
                            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
                            borderColor: theme === 'dark' ? '#434343' : '#f0f0f0'
                        }}
                    >
                        <Select
                            placeholder="Bölüm seçiniz"
                            style={{ width: '100%' }}
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            disabled={!selectedFaculty}
                        >
                            {departments.map(department => (
                                <Option key={department} value={department}>
                                    {department}
                                </Option>
                            ))}
                        </Select>
                    </Card>
                </Col>
            </Row>

            {selectedFaculty && (
                <Card
                    className="mt-4"
                    style={{
                        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
                        borderColor: theme === 'dark' ? '#434343' : '#f0f0f0'
                    }}
                >
                    <Title
                        level={4}
                        style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                    >
                        {selectedFaculty}
                    </Title>
                    <p style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        {selectedDepartment
                            ? `Seçili Bölüm: ${selectedDepartment}`
                            : 'Lütfen bir bölüm seçiniz'}
                    </p>
                </Card>
            )}
        </div>
    );
};

export default FacultyDepartmentSelector;
