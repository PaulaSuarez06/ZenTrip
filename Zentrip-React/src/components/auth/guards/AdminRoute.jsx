import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../config/routes';
import SplashScreen from '../../shared/SplashScreen';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

export default function AdminRoute() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <SplashScreen />;
  if (!user || !ADMIN_EMAILS.includes(user.email)) return <Navigate to={ROUTES.HOME} replace />;

  return <Outlet />;
}
