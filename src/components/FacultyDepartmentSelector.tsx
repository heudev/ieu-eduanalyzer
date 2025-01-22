import React, { useState, useMemo, useEffect } from 'react';
import { Select, Card, Row, Col, Tag, Space, Modal, message } from 'antd';
import { useDispatch } from 'react-redux';
import { LetterGrade, CourseStatus } from '../types';
import departmentsData from '../data/departments.json';
import { setSelectedFacultyAndDepartment, removeDepartment } from '../store/courseSlice';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

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
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            loadDepartmentsFromFirestore();
        }
    }, [currentUser]);

    const loadDepartmentsFromFirestore = async () => {
        if (!currentUser) return;

        const departmentsRef = collection(db, 'departments');
        const q = query(departmentsRef, where('userId', '==', currentUser.uid));

        try {
            const querySnapshot = await getDocs(q);
            const departments: SavedDepartment[] = [];
            querySnapshot.forEach((doc) => {
                departments.push(doc.data() as SavedDepartment);
            });

            setSelectedDepartments(departments);

            if (departments.length > 0) {
                const active = departments[0];
                setActiveDepartment(active);
                dispatch(setSelectedFacultyAndDepartment({
                    faculty: active.faculty,
                    department: active.department,
                    courses: active.courses
                }));
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            message.error('Departmanlar yüklenirken bir hata oluştu');
        }
    };

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
                    saveDepartmentToFirestore(newDepartment);
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
        updateActiveDepartment(dept);
    };

    const handleRemoveDepartment = (dept: SavedDepartment) => {
        setDepartmentToDelete(dept);
    };

    const confirmDelete = async () => {
        if (!departmentToDelete) return;

        const deptToRemove = departmentToDelete;

        dispatch(removeDepartment({
            faculty: deptToRemove.faculty,
            department: deptToRemove.department
        }));

        await deleteDepartmentFromFirestore(deptToRemove.faculty, deptToRemove.department);

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
        message.success(`${deptToRemove.faculty} - ${deptToRemove.department} bölümü başarıyla silindi.`);
    };

    const cancelDelete = () => {
        setDepartmentToDelete(null);
    };

    const saveDepartmentToFirestore = async (department: SavedDepartment) => {
        if (!currentUser) return;

        const departmentId = `${currentUser.uid}_${department.faculty}_${department.department}`;
        const departmentRef = doc(db, 'departments', departmentId);

        try {
            await setDoc(departmentRef, {
                ...department,
                userId: currentUser.uid,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving department:', error);
            message.error('Departman kaydedilirken bir hata oluştu');
        }
    };

    const deleteDepartmentFromFirestore = async (faculty: string, department: string) => {
        if (!currentUser) return;

        const departmentId = `${currentUser.uid}_${faculty}_${department}`;
        const departmentRef = doc(db, 'departments', departmentId);

        try {
            await deleteDoc(departmentRef);
        } catch (error) {
            console.error('Error deleting department:', error);
            message.error('Departman silinirken bir hata oluştu');
        }
    };

    const updateActiveDepartment = async (dept: SavedDepartment) => {
        if (!currentUser) return;

        const departmentId = `${currentUser.uid}_${dept.faculty}_${dept.department}`;
        const departmentRef = doc(db, 'departments', departmentId);

        try {
            await updateDoc(departmentRef, {
                isActive: true,
                updatedAt: new Date().toISOString()
            });

            const otherDepts = selectedDepartments.filter(
                d => d.faculty !== dept.faculty || d.department !== dept.department
            );

            for (const otherDept of otherDepts) {
                const otherId = `${currentUser.uid}_${otherDept.faculty}_${otherDept.department}`;
                const otherRef = doc(db, 'departments', otherId);
                await updateDoc(otherRef, {
                    isActive: false,
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error updating active department:', error);
            message.error('Aktif departman güncellenirken bir hata oluştu');
        }
    };

    return (
        <div className="space-y-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card
                        title={"Faculty Selection"}
                        className="h-full !text-white shadow"
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
                        className="h-full shadow"
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
                    className="mt-4 overflow-x-auto shadow"
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
