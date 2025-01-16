import React, { useMemo } from 'react';
import { Row, Col, Statistic, Card, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { CourseState, RootState } from '../types';
import {
    TrophyOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    BookOutlined,
    CheckSquareOutlined
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
            title: 'Başarılı Dersler',
            value: stats.passedCourses,
            icon: <CheckCircleOutlined />,
            color: '#3f8600',
            tooltip: 'Başarıyla tamamlanan ders sayısı'
        },
        {
            title: 'Başarısız Dersler',
            value: stats.failedCourses,
            icon: <CloseCircleOutlined />,
            color: '#cf1322',
            tooltip: 'Başarısız olunan ders sayısı'
        },
        {
            title: 'Aktif Dersler',
            value: stats.activeCourses,
            icon: <LoadingOutlined />,
            color: '#096dd9',
            tooltip: 'Şu an alınan ders sayısı'
        },
        {
            title: 'Toplam Kredi',
            value: stats.totalCredits,
            icon: <BookOutlined />,
            tooltip: 'Toplam kredi sayısı'
        },
        {
            title: 'Tamamlanan Kredi',
            value: stats.completedCredits,
            icon: <CheckSquareOutlined />,
            color: '#3f8600',
            tooltip: 'Başarıyla tamamlanan kredi sayısı'
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