import React from 'react';
import { Layout, Typography, Card } from 'antd';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './store/courseSlice';
import FacultyDepartmentSelector from './components/FacultyDepartmentSelector';
import CourseTable from './components/CourseTable';
import CourseStats from './components/CourseStats';

const { Header, Content } = Layout;
const { Title } = Typography;

const store = configureStore({
  reducer: {
    course: courseReducer,
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Layout className="min-h-screen">
        <Header className="bg-white shadow">
          <Title level={3} className="text-center py-4 m-0">
            Course Analysis Dashboard
          </Title>
        </Header>
        <Content className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card title="Department Selection" className="shadow-sm">
              <FacultyDepartmentSelector />
            </Card>
            <Card title="Course Statistics" className="shadow-sm">
              <CourseStats />
            </Card>
            <Card title="Course Management" className="shadow-sm">
              <CourseTable />
            </Card>
          </div>
        </Content>
      </Layout>
    </Provider>
  );
};

export default App;
