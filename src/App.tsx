import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card } from 'antd';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './store/courseSlice';
import { firebaseSyncMiddleware, loadFirebaseState } from './store/middleware/firebaseSync';
import FacultyDepartmentSelector from './components/FacultyDepartmentSelector';
import CourseTable from './components/CourseTable';
import CourseStats from './components/CourseStats';
import Auth from './components/Auth';
import { BarChartOutlined } from '@ant-design/icons';
import { DepartmentProvider } from './contexts/DepartmentContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';


const { Header, Content } = Layout;
const { Title } = Typography;

const store = configureStore({
  reducer: {
    course: courseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(firebaseSyncMiddleware),
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
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin tip="Loading" size="large">
          <div className="p-12 rounded-md"></div>
        </Spin>
      </div>
    );
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
            <div className="space-y-8">
              <Card className="text-center p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Title level={2} className="!text-white mb-4">Welcome to IEU EduAnalyzer</Title>
                <p className="text-white text-lg mb-8">
                  An innovative platform that simplifies course analysis and strengthens your academic planning
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl text-blue-500 mb-4">📊</div>
                  <Title level={4}>Detailed Statistics</Title>
                  <p>Course success rates, grade distributions and trend analysis</p>
                </Card>

                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl text-blue-500 mb-4">🎓</div>
                  <Title level={4}>Department Based Analysis</Title>
                  <p>Comprehensive academic performance evaluation of all faculties and departments</p>
                </Card>

                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl text-blue-500 mb-4">📈</div>
                  <Title level={4}>Visual Reporting</Title>
                  <p>Easy to understand graphics and interactive data visualizations</p>
                </Card>
              </div>

              <Card className="bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Title level={3}>Why IEU EduAnalyzer?</Title>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Analyze academic performance in detail</li>
                      <li>Track course success trends</li>
                      <li>Make data-driven decisions</li>
                      <li>Compare department performance</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-inner">
                    <img
                      src="/demo-stats.png"
                      alt="Demo Statistics"
                      className="w-full rounded-lg opacity-75"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                </div>
              </Card>
            </div>
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
