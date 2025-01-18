import React, { useMemo } from 'react';
import { Row, Col, Statistic, Card, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../types';
import {
    TrophyOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    HourglassOutlined,
    BookOutlined,
    CheckSquareOutlined,
    ExceptionOutlined,
    PercentageOutlined
} from '@ant-design/icons';

const CourseStats: React.FC = () => {
    const { stats } = useSelector((state: RootState) => state.course);

    const statItems = useMemo(() => [
        {
            title: 'GPA',
            value: stats.gpa,
            precision: 2,
            icon: <TrophyOutlined />,
            color: '#3f8600',
            tooltip: 'Grade Point Average'
        },
        {
            title: 'Total Credits',
            value: stats.totalCredits,
            icon: <BookOutlined />,
            tooltip: 'Total number of credits'
        },
        {
            title: 'Completed Credits',
            value: stats.completedCredits,
            icon: <CheckSquareOutlined />,
            color: '#3f8600',
            tooltip: 'Number of successfully completed credits'
        },
        {
            title: 'Remaining Credits',
            value: stats.totalCredits - stats.completedCredits,
            icon: <ExceptionOutlined />,
            color: '#faad14',
            tooltip: 'Number of credits remaining for graduation'
        },
        {
            title: 'Passed Courses',
            value: stats.passedCourses,
            icon: <CheckCircleOutlined />,
            color: '#3f8600',
            tooltip: 'Number of successfully completed courses'
        },
        {
            title: 'Failed Courses',
            value: stats.failedCourses,
            icon: <CloseCircleOutlined />,
            color: '#cf1322',
            tooltip: 'Number of failed courses'
        },
        {
            title: 'Active Courses',
            value: stats.activeCourses,
            icon: <HourglassOutlined />,
            color: '#096dd9',
            tooltip: 'Number of courses currently being taken'
        },
        {
            title: 'Remaining Courses',
            value: stats.remainingCourses,
            icon: <ExceptionOutlined />,
            color: '#eb2f96',
            tooltip: 'Number of courses yet to be taken'
        },
        {
            title: 'Pass Rate',
            value: ((stats.passedCourses / (stats.passedCourses + stats.failedCourses)) * 100),
            precision: 1,
            suffix: '%',
            icon: <PercentageOutlined />,
            color: '#1890ff',
            tooltip: 'Percentage of courses successfully completed'
        },
    ], [stats]);

    return (
        <Row gutter={[16, 16]}>
            {statItems.map((item, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <Tooltip title={item.tooltip}>
                        <Card
                            className="text-center hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-center mb-2">
                                <span
                                    className="text-xl"
                                    style={{ color: item.color }}
                                >
                                    {item.icon}
                                </span>
                            </div>
                            <Statistic
                                title={
                                    <span>
                                        {item.title}
                                    </span>
                                }
                                value={item.value}
                                precision={item.precision}
                                valueStyle={{
                                    color: item.color,
                                    fontSize: '24px'
                                }}
                            />
                        </Card>
                    </Tooltip>
                </Col>
            ))}
        </Row>
    );
};

export default React.memo(CourseStats);