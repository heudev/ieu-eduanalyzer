import React, { useMemo } from 'react';
import { Row, Col, Statistic, Card, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { CourseState, RootState } from '../types';
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
    const { stats, theme } = useSelector((state: RootState) => state.course);

    const statItems = useMemo(() => [
        {
            title: 'GPA',
            value: stats.gpa,
            precision: 2,
            icon: <TrophyOutlined />,
            color: '#3f8600',
            tooltip: 'Genel Not Ortalaması'
        },
        {
            title: 'Passed Courses',
            value: stats.passedCourses,
            icon: <CheckCircleOutlined />,
            color: '#3f8600',
            tooltip: 'Başarıyla tamamlanan ders sayısı'
        },
        {
            title: 'Failed Courses',
            value: stats.failedCourses,
            icon: <CloseCircleOutlined />,
            color: '#cf1322',
            tooltip: 'Başarısız olunan ders sayısı'
        },
        {
            title: 'Active Courses',
            value: stats.activeCourses,
            icon: <HourglassOutlined />,
            color: '#096dd9',
            tooltip: 'Şu an alınan ders sayısı'
        },
        {
            title: 'Total Credits',
            value: stats.totalCredits,
            icon: <BookOutlined />,
            tooltip: 'Toplam kredi sayısı'
        },
        {
            title: 'Completed Credits',
            value: stats.completedCredits,
            icon: <CheckSquareOutlined />,
            color: '#3f8600',
            tooltip: 'Başarıyla tamamlanan kredi sayısı'
        },
        {
            title: 'Remaining Credits',
            value: 240 - stats.completedCredits, // Varsayılan olarak 240 kredi
            icon: <ExceptionOutlined />,
            color: '#faad14',
            tooltip: 'Mezuniyet için kalan kredi sayısı'
        },
        {
            title: 'Pass Rate',
            value: ((stats.passedCourses / (stats.passedCourses + stats.failedCourses)) * 100),
            precision: 1,
            suffix: '%',
            icon: <PercentageOutlined />,
            color: '#1890ff',
            tooltip: 'Başarılı derslerin toplam derslere oranı'
        }
    ], [stats]);

    return (
        <Row gutter={[16, 16]}>
            {statItems.map((item, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <Tooltip title={item.tooltip}>
                        <Card
                            className="text-center hover:shadow-lg transition-shadow duration-300"
                            style={{
                                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
                                borderColor: theme === 'dark' ? '#434343' : '#f0f0f0'
                            }}
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
                                    <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
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