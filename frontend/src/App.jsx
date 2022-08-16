import React from 'react';
import './App.css';
// pages for AllUsers
import LoginForm from './AllUsers/LoginScreen.js';
import RegisterForm from './AllUsers/RegisterScreen.js';
import ExtraRoute from './AllUsers/ExtraRoute.js';
import ForgotPassword1 from './AllUsers/ForgotPassword1.js';
import ForgotPassword2 from './AllUsers/ForgotPassword2.js';
import ForgotPassword3 from './AllUsers/ForgotPassword3.js';
// pages for Manager
import HomeManager from './Manager/HomepageMgr.js';
import MultiInspectionPage from './Manager/MultiInspection.js';
import ManagerDeleteAccount from './Manager/DeleteAccountMgr.js';
import MgrNotificationPage from './Manager/NotificationMgr';
import MgrChangeAccountDetails from './Manager/ChangeAccountDetails_Mgr.js';
import MgrContactPage from './Manager/ContactMgr.js';
import MgrAddContactPage from './Manager/AddContactMgr.js';
import MgrSelectReport from './Manager/SelectReportTemplate.js';
import RenderTemplate from './Manager/RenderTemplate';
import ItineraryPage from './Manager/ItineraryMgr.js';
import MgrPropertiesPage from './Manager/PropertiesMgr.js';
import MgrScheduleNoticePage from './Manager/MgrNotice.js';
import ReportPage from './Manager/ReportMgr.js';
// pages for Owner
import HomeOwner from './Owner/HomepageOwner.js';
import OwnerNotificationPage from './Owner/NotificationOwner';
import OwnerChangeAccountDetails from './Owner/ChangeAccountDetails_Owner.js';
import OwnerDeleteAccount from './Owner/DeleteAccountOwner.js';
import OwnerProperties from './Owner/PropertiesOwner.js';
import OwnerAddProperties from './Owner/AddPropertyOwner.js';
import OwnerContactPage from './Owner/ContactOwner.js';
import OwnerAddContactPage from './Owner/AddContactOwner.js';
// pages for Tenant
import HomeTenant from './Tenant/HomepageTenant.js';
import TenantNotificationPage from './Tenant/NotificationTenant';
import TenantChangeAccountDetails from './Tenant/ChangeAccountDetails_Tenant.js';
import TenantDeleteAccount from './Tenant/DeleteAccountTenant.js';
import TenantContactPage from './Tenant/ContactTenant.js';
import TenantAddContactPage from './Tenant/AddContactTenant.js';
import TenantRequestPage from './Tenant/RequestTenant.js';
import RenderTemplateTenant from './Tenant/RenderTemplate';
// Landing pages
import Landing from './landing.js';
import About from './About.js';
import Contact from './Contact.js';
import {
  Route,
  Switch,
  BrowserRouter as Router,
} from 'react-router-dom';

function App () {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Landing />
        </Route>
        <Route exact path="/About">
          <About />
        </Route>
        <Route exact path="/Contact">
          <Contact />
        </Route>
        <Route path="/Login">
          <LoginForm />
        </Route>
        <Route path="/auth/register">
          <RegisterForm />
        </Route>
        <Route path="/owner/home">
          <HomeOwner />
        </Route>
        <Route path="/tenant/home">
          <HomeTenant />
        </Route>
        <Route path="/manager/home">
          <HomeManager />
        </Route>
        <Route path="/reset/sec">
          <ForgotPassword2 />
        </Route>
        <Route path="/reset/set">
          <ForgotPassword3 />
        </Route>
        <Route path="/reset">
          <ForgotPassword1 />
        </Route>
        <Route path="/manager/contact">
          <MgrContactPage />
        </Route>
        <Route path="/manager/contact_addNew">
          <MgrAddContactPage />
        </Route>
        <Route path="/manager/properties">
          <MgrPropertiesPage />
        </Route>
        <Route path="/manager/notices">
          <MgrScheduleNoticePage />
        </Route>
        <Route path="/tenant/notification">
          <TenantNotificationPage />
        </Route>
        <Route path="/owner/notification">
          <OwnerNotificationPage />
        </Route>
        <Route path="/manager/notification">
          <MgrNotificationPage />
        </Route>
        <Route path="/manager/account/delete">
          <ManagerDeleteAccount />
        </Route>
        <Route path="/manager/account">
          <MgrChangeAccountDetails />
        </Route>
        <Route path="/owner/account/delete">
          <OwnerDeleteAccount />
        </Route>
        <Route path="/owner/account">
          <OwnerChangeAccountDetails />
        </Route>
        <Route path="/owner/properties">
          <OwnerProperties />
        </Route>
        <Route path="/owner/addNewProperty">
          <OwnerAddProperties />
        </Route>
        <Route path="/owner/contact">
          <OwnerContactPage />
        </Route>
        <Route path="/owner/contact_connect_manager">
          <OwnerAddContactPage />
        </Route>
        <Route path="/tenant/account/delete">
          <TenantDeleteAccount />
        </Route>
        <Route path="/tenant/account">
          <TenantChangeAccountDetails />
        </Route>
        <Route path="/tenant/request">
          <TenantRequestPage />
        </Route>
        <Route path="/tenant/contact">
          <TenantContactPage />
        </Route>
        <Route path="/tenant/fulfill">
          <RenderTemplateTenant />
        </Route>
        <Route path="/tenant/contact_connect_manager">
          <TenantAddContactPage />
        </Route>
        <Route path="/manager/itineraries/schd_multi">
          <MultiInspectionPage />
        </Route>
        <Route path="/manager/itineraries">
          <ItineraryPage />
        </Route>
        <Route path='/manager/reports/preview'>
          <RenderTemplate />
        </Route>
        <Route path="/manager/reports/select_tmplates">
          <MgrSelectReport />
        </Route>
        <Route path='/manager/reports'>
          <ReportPage />
        </Route>
        {/* "ExtraRoute" must be the last Route,
            please add Route in front of it */}
        <ExtraRoute />
      </Switch>
    </Router>
  );
}

export default App;
