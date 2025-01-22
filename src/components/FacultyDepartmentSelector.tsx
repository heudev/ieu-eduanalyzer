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
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase';

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
            message.error('An error occurred while loading departments');
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
        logEvent(analytics, 'faculty_select', {
            faculty: value
        });
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        logEvent(analytics, 'department_select', {
            faculty: selectedFaculty,
            department: value
        });
    };

    const handleDepartmentClick = (dept: SavedDepartment) => {
        setActiveDepartment(dept);
        dispatch(setSelectedFacultyAndDepartment({
            faculty: dept.faculty,
            department: dept.department,
            courses: dept.courses,
            userId: currentUser?.uid
        }));
        logEvent(analytics, 'saved_department_select', {
            faculty: dept.faculty,
            department: dept.department
        });
    };

    const handleDeleteDepartment = (dept: SavedDepartment) => {
        setDepartmentToDelete(dept);
        logEvent(analytics, 'department_delete_attempt', {
            faculty: dept.faculty,
            department: dept.department
        });
    };

    const confirmDelete = async () => {
        if (!departmentToDelete) return;

        try {
            await deleteDepartmentFromFirestore(
                departmentToDelete.faculty,
                departmentToDelete.department
            );
            dispatch(removeDepartment({
                faculty: departmentToDelete.faculty,
                department: departmentToDelete.department
            }));
            setSelectedDepartments(prev =>
                prev.filter(d =>
                    d.faculty !== departmentToDelete.faculty ||
                    d.department !== departmentToDelete.department
                )
            );
            message.success('Department successfully deleted');
            logEvent(analytics, 'department_delete_success', {
                faculty: departmentToDelete.faculty,
                department: departmentToDelete.department
            });
        } catch (error: any) {
            message.error('Error deleting department');
            logEvent(analytics, 'department_delete_error', {
                faculty: departmentToDelete.faculty,
                department: departmentToDelete.department,
                error: error.message
            });
        }
        setDepartmentToDelete(null);
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
            message.error('An error occurred while saving department');
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
            message.error('An error occurred while deleting department');
        }
    };

    const updateActiveDepartment = async (dept: SavedDepartment) => {
        if (!currentUser) return;

        const departmentId = `${currentUser.uid}_${dept.faculty}_${dept.department}`;
        const departmentRef = doc(db, 'departments', departmentId);

        try {
            const docSnap = await getDocs(query(collection(db, 'departments'),
                where('userId', '==', currentUser.uid),
                where('faculty', '==', dept.faculty),
                where('department', '==', dept.department)
            ));

            if (docSnap.empty) {
                console.log('Document does not exist, skipping update');
                return;
            }

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

                const otherDocSnap = await getDocs(query(collection(db, 'departments'),
                    where('userId', '==', currentUser.uid),
                    where('faculty', '==', otherDept.faculty),
                    where('department', '==', otherDept.department)
                ));

                if (!otherDocSnap.empty) {
                    await updateDoc(otherRef, {
                        isActive: false,
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error('Error updating active department:', error);
            message.error('An error occurred while updating active department');
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
                                    handleDeleteDepartment(dept);
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