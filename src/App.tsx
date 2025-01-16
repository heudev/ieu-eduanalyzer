import React, { useEffect } from 'react';
import { Layout, Typography, Card, Switch } from 'antd';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import courseReducer, { toggleTheme, loadInitialData } from './store/courseSlice';
import FacultyDepartmentSelector from './components/FacultyDepartmentSelector';
import CourseTable from './components/CourseTable';
import CourseStats from './components/CourseStats';
import { ThemeMode } from './types';

const { Header, Content } = Layout;
const { Title } = Typography;

const store = configureStore({
  reducer: {
    course: courseReducer,
  },
});

interface RootState {
  course: {
    theme: ThemeMode;
  };
}

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.course.theme);

  useEffect(() => {
    dispatch(loadInitialData());
  }, [dispatch]);

  return (
    <Layout className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Header className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow flex items-center justify-between`}>
        <Title level={3} className={`py-4 m-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Course Analysis Dashboard
        </Title>
        <Switch
          checked={theme === 'dark'}
          onChange={() => dispatch(toggleTheme())}
          checkedChildren="🌙"
          unCheckedChildren="☀️"
        />
      </Header>
      <Content className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card
            title="Department Selection"
            className={`shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}
          >
            <FacultyDepartmentSelector />
          </Card>
          <Card
            title="Course Statistics"
            className={`shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}
          >
            <CourseStats />
          </Card>
          <Card
            title="Course Management"
            className={`shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}
          >
            <CourseTable />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
