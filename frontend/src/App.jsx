import {Routes, Route ,Navigate} from "react-router";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Homepage from "./pages/Homepage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FavoriteLists from "./pages/FavoriteLists.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice.js";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel.jsx";
import ProblemPage from "./pages/ProblemPage.jsx"
import Admin from "./pages/Admin.jsx";
import AdminVideo from "./components/AdminVideo.jsx"
import AdminDelete from "./components/AdminDelete.jsx"
import AdminUpload from "./components/AdminUpload.jsx"
import AdminUpdate from "./components/AdminUpdate.jsx"
import AdminUpdateForm from "./components/AdminUpdateForm.jsx"
import PremiumPlans from "./pages/PremiumPlans.jsx";
import Assessments from "./pages/Assessments.jsx";
import AssessmentPage from "./pages/AssessmentPage.jsx";
import AssessmentReport from "./pages/AssessmentReport.jsx";
import PointActivityPage from "./pages/PointActivityPage.jsx";
import socket from './utils/socket.js';
import MissionsPage from "./pages/MissionsPage.jsx";
import StorePage from './pages/StorePage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import OrderTrackPage from './pages/OrderTrackPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import AdminCustomerOrdersPage from './pages/AdminCustomerOrdersPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import ContestPage from './pages/ContestPage.jsx';
import ContestRegisterPage from './pages/ContestRegisterPage.jsx';
import ContestLivePage from './pages/ContestLivePage.jsx';
import ContestReportPage from './pages/ContestReportPage.jsx';
import AdminContestPage from './pages/AdminContestPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

function App(){
  
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    socket.on('point_rewarded', ({ mission, points }) => {
      // setPointNotification({ mission, points }); // REMOVED
      // setTimeout(() => setPointNotification(null), 4000); // REMOVED
    });
    return () => {
      socket.off('point_rewarded');
    };
  }, []);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
  <>
    {/* REMOVE: Point Notification UI here, now handled by provider */}
    <Routes>
      <Route path="/" element={isAuthenticated ? <Homepage /> : <LandingPage />} />
      <Route path="/home" element={isAuthenticated ? <Homepage /> : <Navigate to="/" />} />
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/favorites" element={isAuthenticated ? <FavoriteLists /> : <Navigate to="/login" />} />
      <Route path="/premium" element={isAuthenticated ? <PremiumPlans /> : <Navigate to="/login" />} />
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />} />
      <Route path="/admin/update/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdateForm /> : <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      <Route path="/assessments" element={isAuthenticated ? <Assessments /> : <Navigate to="/login" />} />
      <Route path="/assessment/:assessmentId" element={isAuthenticated ? <AssessmentPage /> : <Navigate to="/login" />} />
      <Route path="/assessment/:assessmentId/report/:submissionId" element={isAuthenticated ? <AssessmentReport /> : <Navigate to="/login" />} />
      <Route path="/points" element={isAuthenticated ? <PointActivityPage /> : <Navigate to="/login" />} />
      <Route path="/missions" element={isAuthenticated ? <MissionsPage /> : <Navigate to="/login" />} />
      <Route path="/store" element={isAuthenticated ? <StorePage /> : <Navigate to="/login" />} />
      <Route path="/contest" element={isAuthenticated ? <ContestPage /> : <Navigate to="/login" />} />
      <Route path="/contest/:contestId/register" element={isAuthenticated ? <ContestRegisterPage /> : <Navigate to="/login" />} />
      <Route path="/contest/:contestId/live" element={isAuthenticated ? <ContestLivePage /> : <Navigate to="/login" />} />
      <Route path="/contest/:contestId/report" element={isAuthenticated ? <ContestReportPage /> : <Navigate to="/login" />} />
      <Route path="/order" element={isAuthenticated ? <OrderPage /> : <Navigate to="/login" />} />
      <Route path="/order-track" element={isAuthenticated ? <OrderTrackPage /> : <Navigate to="/login" />} />
      <Route path="/orders" element={isAuthenticated ? <OrderHistoryPage /> : <Navigate to="/login" />} />
      <Route path="/badges" element={isAuthenticated ? <BadgesPage /> : <Navigate to="/login" />} />
      <Route path="/admin/orders" element={isAuthenticated && user?.role === 'admin' ? <AdminCustomerOrdersPage /> : <Navigate to="/" />} />
      <Route path="/admin/contest" element={isAuthenticated && user?.role === 'admin' ? <AdminContestPage /> : <Navigate to="/" />} />
      <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
    </Routes>
  </>
  )
}

export default App;