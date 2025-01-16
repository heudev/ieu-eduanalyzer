import React, { useState, useMemo } from 'react';
import { Select, Card, Row, Col, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { Faculty, Department, RootState } from '../types';
import facultiesData from '../data/faculties.json';

const { Option } = Select;
const { Title } = Typography;

const FacultyDepartmentSelector: React.FC = () => {
    const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const theme = useSelector((state: RootState) => state.course.theme);

    const faculties: Faculty[] = useMemo(() =>
        facultiesData.faculties,
        []
    );

    const selectedFacultyData = useMemo(() =>
        faculties.find(f => f.id === selectedFaculty),
        [faculties, selectedFaculty]
    );

    const departments = useMemo(() =>
        selectedFacultyData?.departments || [],
        [selectedFacultyData]
    );

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
                                <Option key={faculty.id} value={faculty.id}>
                                    {faculty.name}
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
                                <Option key={department.id} value={department.id}>
                                    {department.name}
                                </Option>
                            ))}
                        </Select>
                    </Card>
                </Col>
            </Row>

            {selectedFacultyData && (
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
                        {selectedFacultyData.name}
                    </Title>
                    <p style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        {selectedDepartment
                            ? `Seçili Bölüm: ${departments.find(d => d.id === selectedDepartment)?.name}`
                            : 'Lütfen bir bölüm seçiniz'}
                    </p>
                </Card>
            )}
        </div>
    );
};

export default FacultyDepartmentSelector;
