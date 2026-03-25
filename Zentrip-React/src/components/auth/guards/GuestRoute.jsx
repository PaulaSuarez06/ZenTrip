import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import { useAuth } from '../../../context/AuthContext';
import SplashScreen from '../../shared/SplashScreen';

export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isVerifyEmailRoute = location.pathname === ROUTES.AUTH.VERIFY_EMAIL;
  const isLoginRoute = location.pathname === ROUTES.AUTH.LOGIN;

  if (loading) {
    return <SplashScreen />;
  }

  if (user) {
    if (!user.emailVerified && (isVerifyEmailRoute || isLoginRoute)) {
      return <Outlet />;
    }

    if (!user.emailVerified) {
      return <Navigate to={ROUTES.AUTH.VERIFY_EMAIL} replace />;
    }

    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
