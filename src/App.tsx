import { Layout, Typography, Card } from 'antd';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './store/courseSlice';
import { localStorageMiddleware, loadState } from './store/middleware/localStorage';
import FacultyDepartmentSelector from './components/FacultyDepartmentSelector';
import CourseTable from './components/CourseTable';
import CourseStats from './components/CourseStats';

const { Header, Content } = Layout;
const { Title } = Typography;

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    course: courseReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});


const AppContent: React.FC = () => {

  return (
    <Layout className={`min-h-screen`}>
      <Header className={`shadow flex items-center justify-between bg-gray-100`}>
        <Title level={3} className={`py-4 m-3`}>
          IEU EduAnalyzer
        </Title>
      </Header>
      <Content className="p-6">
        <div className="max-w-7xl mx-auto space-y-5">
          <Card
            title="Department Selection"
            className={`shadow-sm`}
          >
            <FacultyDepartmentSelector />
          </Card>
          <Card
            title="Course Statistics"
            className={`shadow-sm`}
          >
            <CourseStats />
          </Card>
          <Card
            title="Course Management"
            className={`shadow-sm`}
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
