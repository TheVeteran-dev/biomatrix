import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Common/Layout';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Today from './pages/Today';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/today" element={<Today />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;