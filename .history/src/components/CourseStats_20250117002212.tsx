import React from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { useSelector } from 'react-redux';
import { CourseState } from '../types';

interface RootState {
    course: CourseState;
}

const CourseStats: React.FC = () => {
    const stats = useSelector((state: RootState) => state.course.stats);

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="text-center">
                    <Statistic
                        title="GPA"
                        value={stats.gpa.toFixed(2)}
                        precision={2}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="text-center">
                    <Statistic
                        title="Passed Courses"
                        value={stats.passedCourses}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="text-center">
                    <Statistic
                        title="Failed Courses"
                        value={stats.failedCourses}
                        valueStyle={{ color: '#cf1322' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="text-center">
                    <Statistic
                        title="Active Courses"
                        value={stats.activeCourses}
                        valueStyle={{ color: '#096dd9' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="text-center">
                    <Statistic
                        title="Total ECTS"
                        value={stats.totalCredits}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="text-center">
                    <Statistic
                        title="Completed ECTS"
                        value={stats.completedCredits}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default CourseStats; 