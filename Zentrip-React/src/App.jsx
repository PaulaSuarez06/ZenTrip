import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatNotificationProvider } from './context/ChatNotificationContext';
import { ChatUIProvider } from './context/ChatUIContext';
import { PrivateChatProvider } from './context/PrivateChatContext';
import MessagesPage from './components/messages/MessagesPage';
import { LanguageProvider } from './context/LanguageContext';
import { ROUTES } from './config/routes';
import Register from './components/auth/register/Register';
import Login from './components/auth/login/Login';
import VerifyEmail from './components/auth/verify-email/VerifyEmail';
import AuthActionHandler from './components/auth/action/AuthActionHandler';
import EditProfile from './components/profile/EditProfile';
import CreateTrip from './components/trips/create/CreateTrip';
import MisViajes from './components/trips/list/MisViajes';
import FlightsExplorer from './components/flights/FlightsExplorer';
import HotelsExplorer from './components/hotels/HotelsExplorer';
import CarsExplorer from './components/cars/CarsExplorer';
import RestaurantsExplorer from './components/restaurants/RestaurantsExplorer';
import ActivitiesExplorer from './components/activities/ActivitiesExplorer';
import RoutesExplorer from './components/routes/RoutesExplorer';
import TripDetail from './components/trips/detail/TripDetail';
import Landing from './components/landing/landing';
import Home from './components/home/Home';
import MainLayout from './layouts/MainLayout';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfUse from './components/legal/TermsOfUse';
import ProtectedRoute from './components/auth/guards/ProtectedRoute';
import GuestRoute from './components/auth/guards/GuestRoute';
import AdminRoute from './components/auth/guards/AdminRoute';
import InspirationReader from './components/inspiration/InspirationReader';
import CommunityPage from './components/community/CommunityPage';
import CommunityPostPublic from './components/community/CommunityPostPublic';
import TripSharePublic from './components/trips/share/TripSharePublic';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminInspirations from './components/admin/AdminInspirations';
import AdminDestinations from './components/admin/AdminDestinations';
import ExplorePage from './components/explore/ExplorePage';

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.HOME, element: <Home /> },
          { path: ROUTES.FLIGHTS, element: <FlightsExplorer /> },
          { path: ROUTES.HOTELS, element: <HotelsExplorer /> },
          { path: ROUTES.CARS, element: <CarsExplorer /> },
          { path: ROUTES.RESTAURANTS, element: <RestaurantsExplorer /> },
          { path: ROUTES.ACTIVITIES, element: <ActivitiesExplorer /> },
          { path: ROUTES.ROUTES_EXPLORER, element: <RoutesExplorer /> },
          { path: ROUTES.PROFILE.EDIT, element: <EditProfile /> },
          { path: ROUTES.TRIPS.CREATE, element: <CreateTrip /> },
          { path: ROUTES.TRIPS.LIST, element: <MisViajes /> },
          { path: ROUTES.TRIPS.DETAIL, element: <TripDetail /> },
          { path: ROUTES.MESSAGES, element: <MessagesPage /> },
          { path: ROUTES.PROFILE.SETUP, element: <EditProfile isOnboarding /> },
          { path: ROUTES.LEGAL.PRIVACY, element: <PrivacyPolicy /> },
          { path: ROUTES.LEGAL.TERMS, element: <TermsOfUse /> },
          { path: ROUTES.INSPIRATION.READER, element: <InspirationReader /> },
          { path: ROUTES.EXPLORE, element: <ExplorePage /> },
          { path: ROUTES.COMMUNITY, element: <CommunityPage /> },
          { path: ROUTES.COMMUNITY_POST, element: <CommunityPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: ROUTES.ADMIN.DASHBOARD, element: <AdminDashboard /> },
              { path: ROUTES.ADMIN.READINGS, element: <AdminInspirations /> },
              { path: ROUTES.ADMIN.DESTINATIONS, element: <AdminDestinations /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: ROUTES.AUTH.LOGIN,
        element: <Login />,
      },
      {
        path: ROUTES.AUTH.REGISTER,
        element: <Register />,
      },
      {
        path: ROUTES.AUTH.VERIFY_EMAIL,
        element: <VerifyEmail />,
      },
    ],
  },
  {
    path: ROUTES.AUTH.ACTION,
    element: <AuthActionHandler />,
  },
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.PUBLIC_POST, element: <CommunityPostPublic /> },
    ],
  },
  { path: ROUTES.TRIP_SHARE, element: <TripSharePublic /> },
]);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <ChatNotificationProvider>
            <ChatUIProvider>
              <PrivateChatProvider>
                <RouterProvider router={router} />
              </PrivateChatProvider>
            </ChatUIProvider>
          </ChatNotificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
