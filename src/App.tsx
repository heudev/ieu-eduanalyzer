import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Select } from 'antd';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './store/courseSlice';
import { localStorageMiddleware, loadState } from './store/middleware/localStorage';
import { firebaseSyncMiddleware, loadFirebaseState } from './store/middleware/firebaseSync';
import { auth } from './firebase';
import FacultyDepartmentSelector from './components/FacultyDepartmentSelector';
import CourseTable from './components/CourseTable';
import CourseStats from './components/CourseStats';
import Auth from './components/Auth';
import { BarChartOutlined } from '@ant-design/icons';
import { DepartmentProvider } from './contexts/DepartmentContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const { Header, Content } = Layout;
const { Title } = Typography;

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    course: courseReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware, firebaseSyncMiddleware),
});

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        const firebaseState = await loadFirebaseState(currentUser.uid);
        if (firebaseState) {
          Object.entries(firebaseState).forEach(([reducerName, state]) => {
            store.dispatch({ type: `${reducerName}/setState`, payload: state });
          });
        }
      }
      setIsLoading(false);
    };

    if (!loading) {
      loadUserData();
    }
  }, [currentUser, loading]);

  if (loading || isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Layout className={`min-h-screen`}>
      <Header className={`shadow flex items-center justify-between bg-gray-50`}>
        <div className="flex items-center">
          <BarChartOutlined style={{ fontSize: '24px', marginRight: '10px' }} />
          <Title level={3} className={`py-4 m-3`}>
            IEU EduAnalyzer
          </Title>
        </div>
        <div className="flex items-center space-x-4">
          <Auth isLoggedIn={!!currentUser} />
        </div>
      </Header>
      <Content className="p-6 bg-[#F0F2F5]">
        <div className="max-w-5xl flex flex-col justify-center mx-auto space-y-5">
          {currentUser ? (
            <>
              <Card
                title="Department Selection"
                className={`shadow`}
              >
                <FacultyDepartmentSelector />
              </Card>
              <Card
                title="Course Statistics"
                className={`shadow`}
              >
                <CourseStats />
              </Card>
              <Card
                title="Course Management"
                className={`shadow`}
              >
                <CourseTable />
              </Card>
            </>
          ) : (
            <Card className="text-center p-8">
              <Title level={4}>Lütfen devam etmek için giriş yapın</Title>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <DepartmentProvider>
          <AppContent />
        </DepartmentProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
