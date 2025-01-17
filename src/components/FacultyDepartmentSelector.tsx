import React, { useState, useMemo, useEffect } from 'react';
import { Select, Card, Row, Col, Tag, Space, Modal, message } from 'antd';
import { useDispatch } from 'react-redux';
import { LetterGrade, CourseStatus } from '../types';
import departmentsData from '../data/departments.json';
import { setSelectedFacultyAndDepartment } from '../store/courseSlice';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

const STORAGE_KEY = 'selectedDepartments';
const ACTIVE_DEPARTMENT_KEY = 'activeDepartment';

interface SavedDepartment {
    faculty: string;
    department: string;
    courses: any[];
}

const FacultyDepartmentSelector: React.FC = () => {
    const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedDepartments, setSelectedDepartments] = useState<Array<SavedDepartment>>([]);
    const [activeDepartment, setActiveDepartment] = useState<SavedDepartment | null>(null);
    const [departmentToDelete, setDepartmentToDelete] = useState<SavedDepartment | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const savedDepartments = localStorage.getItem(STORAGE_KEY);
        const savedActiveDepartment = localStorage.getItem(ACTIVE_DEPARTMENT_KEY);

        if (savedDepartments) {
            const departments = JSON.parse(savedDepartments);
            setSelectedDepartments(departments);

            if (savedActiveDepartment) {
                const active = JSON.parse(savedActiveDepartment);
                setActiveDepartment(active);
                dispatch(setSelectedFacultyAndDepartment({
                    faculty: active.faculty,
                    department: active.department,
                    courses: active.courses
                }));
            }
        }
    }, []);

    useEffect(() => {
        if (selectedDepartments.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedDepartments));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [selectedDepartments]);

    useEffect(() => {
        if (activeDepartment) {
            localStorage.setItem(ACTIVE_DEPARTMENT_KEY, JSON.stringify(activeDepartment));
        } else {
            localStorage.removeItem(ACTIVE_DEPARTMENT_KEY);
        }
    }, [activeDepartment]);

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
                    letterGrade: (course.grade as unknown as LetterGrade) || 'NA',
                    status: (course.taking ? 'TAKING' : 'NOT TAKING') as CourseStatus
                }));

                const newDepartment = {
                    faculty: selectedFaculty,
                    department: selectedDepartment,
                    courses: coursesWithIds
                };

                if (!selectedDepartments.some(d =>
                    d.faculty === newDepartment.faculty &&
                    d.department === newDepartment.department
                )) {
                    setSelectedDepartments(prev => [...prev, newDepartment]);
                    setActiveDepartment(newDepartment);
                    dispatch(setSelectedFacultyAndDepartment(newDepartment));
                }
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

    const handleDepartmentClick = (dept: SavedDepartment) => {
        setActiveDepartment(dept);
        dispatch(setSelectedFacultyAndDepartment({
            faculty: dept.faculty,
            department: dept.department,
            courses: dept.courses
        }));
    };

    const handleRemoveDepartment = (dept: SavedDepartment) => {
        setDepartmentToDelete(dept);
    };

    const confirmDelete = () => {
        if (!departmentToDelete) return;

        const deptToRemove = departmentToDelete;

        setSelectedDepartments(prev => {
            const updatedDepts = prev.filter(d =>
                !(d.faculty === deptToRemove.faculty && d.department === deptToRemove.department)
            );
            return updatedDepts;
        });

        if (activeDepartment &&
            activeDepartment.faculty === deptToRemove.faculty &&
            activeDepartment.department === deptToRemove.department) {
            const remaining = selectedDepartments.filter(d =>
                !(d.faculty === deptToRemove.faculty && d.department === deptToRemove.department)
            );
            if (remaining.length > 0) {
                handleDepartmentClick(remaining[0]);
            } else {
                setActiveDepartment(null);
                dispatch(setSelectedFacultyAndDepartment({
                    faculty: '',
                    department: '',
                    courses: []
                }));
            }
        }

        setDepartmentToDelete(null);
        message.success(`${deptToRemove.faculty} - ${deptToRemove.department} department has been successfully deleted.`);
    };

    const cancelDelete = () => {
        setDepartmentToDelete(null);
    };

    return (
        <div className="space-y-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card
                        title={"Faculty Selection"}
                        className="h-full !text-white"
                    >
                        <Select
                            placeholder="Select a faculty"
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
                        title="Department Selection"
                        className="h-full"
                    >
                        <Select
                            placeholder="Select a department"
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

            {selectedDepartments.length > 0 && (
                <Card
                    title="Added Departments"
                    className="mt-4"
                >
                    <Space size={[0, 8]} wrap>
                        {selectedDepartments.map((dept) => (
                            <Tag
                                key={`${dept.faculty}-${dept.department}`}
                                color={activeDepartment &&
                                    activeDepartment.faculty === dept.faculty &&
                                    activeDepartment.department === dept.department
                                    ? 'blue'
                                    : 'default'}
                                style={{
                                    padding: '8px',
                                    margin: '4px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleDepartmentClick(dept)}
                                closable
                                onClose={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveDepartment(dept);
                                }}
                            >
                                {`${dept.faculty} - ${dept.department}`}
                            </Tag>
                        ))}
                    </Space>
                </Card>
            )}

            <Modal
                title="Department Deletion Confirmation"
                open={departmentToDelete !== null}
                onOk={confirmDelete}
                onCancel={cancelDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>
                    {departmentToDelete && `Are you sure you want to delete the ${departmentToDelete.faculty} - ${departmentToDelete.department} department? This action cannot be undone.`}
                </p>
            </Modal>

        </div>
    );
};

export default FacultyDepartmentSelector;
