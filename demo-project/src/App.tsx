import { Routes, Route, Navigate } from 'react-router';
import { useStore } from './store/StoreContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import Journal from './pages/Journal';

export default function App() {
  const { store } = useStore();
  const ready = store.openingEntry !== null;

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={ready ? <Navigate to="/dashboard" replace /> : <Onboarding />}
      />
      <Route
        path="/"
        element={ready ? <Layout /> : <Navigate to="/onboarding" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sales" element={<Sales />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="journal" element={<Journal />} />
      </Route>
      <Route path="*" element={<Navigate to={ready ? '/dashboard' : '/onboarding'} replace />} />
    </Routes>
  );
}
