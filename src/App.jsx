import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";



// LANDING PAGE
// import MainPage from './LandingPage/MainPage';
import Account from './LandingPage/pages/Account';

import CreateAccCitizen from './LandingPage/pages/Register/Create_Acc';
// import RequestMember from './LandingPage/pages/Register/MemberRequest';
import ActProg from './LandingPage/pages/ActProg';
import LPHome from './LandingPage/pages/Home';
import About from './LandingPage/pages/About';



// CLIENT SIDE
import CitizenLayout from './CitizenSide/CitizenLayout'
import MyProfile from './CitizenSide/pages/Member/MyProfile'
import EventCalendar from './CitizenSide/pages/Member/Calendar'
import Damayan from './CitizenSide/pages/Member/Damayan'
import CNotification from './CitizenSide/pages/Member/Notification'
import CDashboard from './CitizenSide/pages/Member/Dashboard'

// CLIENT SIDE NON MEMBER
import RequestMember from './CitizenSide/pages/Non-Member/BeAMember'
import CitizenVerifyAcc from './CitizenSide/pages/Non-Member/VerifyAccount'



// ADMIN SIDE
import AdminLogin from './LandingPage/pages/Logini/AdminLogin';
import AdminPasswordResetFlow from './LandingPage/pages/Logini/AdminPasswordResetFlow';
import AdminHome from './AdminSide/AdminHome';
import AdminEvent from './AdminSide/pages/Event';
import FederationMember from './AdminSide/pages/F_member';
import MemberRequest from './AdminSide/pages/MemberRequest';
import FAnalysis from './AdminSide/pages/F_analysis';
import DAnalysis from './AdminSide/pages/D_analysis';
import DamayanMember from './AdminSide/pages/D_member';
import DMemberRequest from './AdminSide/pages/D_MemberRequest';
import DPaymentApproval from './AdminSide/pages/D_PaymentApproval';
import DClaimRequest from './AdminSide/pages/D_ClaimRequest';
import Document from './AdminSide/pages/Documents';
import Dashboard from './AdminSide/pages/Dashboard';
import ANotification from './AdminSide/pages/Notification';
import Archive from './AdminSide/pages/Archieve';









// BUDGET OFFICE
import BudgetHome from './BudgetOffice/BudgetHome';





function App() {
  return (
      
      <Routes>
        {/* LANDING PAGE */}
        <Route path="/" element={<LPHome />} />
        <Route path="/LPHome" element={<LPHome />} />
        <Route path="/Account" element={<Account />} />
        <Route path="/ActProg" element={<ActProg />} />
        <Route path="/About" element={<About />} />

        {/* CREATE ACCOUNTS */}
        <Route path="/CCreateAcc" element={<CreateAccCitizen />} />
        <Route path="/RequestMember" element={<RequestMember />} />


        {/* ADMIN SIDE */}
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminPasswordResetFlow />} />
        <Route path="/Admin" element={<ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>}>
          <Route path="Event" element={<AdminEvent />} />
          <Route path="FederationMembers" element={<FederationMember />} />
          <Route path="DamayanMembers" element={<DamayanMember />} />
          <Route path="DMemberRequest" element={<DMemberRequest />} />
          <Route path="DPaymentApproval" element={<DPaymentApproval />} />
          <Route path="DClaimRequest" element={<DClaimRequest />} />
          <Route path="MemberRequest" element={<MemberRequest />} />
          <Route path="DAnalysis" element={<DAnalysis />} />
          <Route path="FAnalysis" element={<FAnalysis />} />
          <Route path="Document" element={<Document />} />
          <Route path="Dashboard" element={<Dashboard />} />
          <Route path="ANotification" element={<ANotification />} />
          <Route path="Archive" element={<Archive />} />
        </Route>


        {/* CLIENT SIDE */}
        <Route
          path="/Citizen"
          element={
            <ProtectedRoute role="citizen">
              <CitizenLayout />
            </ProtectedRoute>
          }
        >

          {/* MEMBER PAGES */}
          <Route path="CDashboard" element={<CDashboard />} />
          <Route path="MyProfile" element={<MyProfile />} />
          <Route path="Calendar" element={<EventCalendar />} />
          <Route path="Damayan" element={<Damayan />} />
          <Route path="CNotification" element={<CNotification />} />

          {/* NON-MEMBER PAGES */}
          <Route path="RequestMember" element={<RequestMember />} />
          <Route path="VerifyAccount" element={<CitizenVerifyAcc />} />
        </Route>

        {/* BUDGET HOME */}
        <Route path="/BudgetOffice" element={<BudgetHome />} />




      </Routes>
  );
}
export default App;

