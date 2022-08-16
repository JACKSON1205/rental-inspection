import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ContactPageIcon from '@material-ui/icons/Contacts';
import CircleNotificationsIcon from '@material-ui/icons/Notifications';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ExploreIcon from '@material-ui/icons/Explore';
import HouseIcon from '@material-ui/icons/House';
import AssessmentIcon from '@material-ui/icons/Assessment';

const toNotificationPage = () => {
  window.location = '/manager/notification';
}

const toDashboardPage = () => {
  window.location = '/manager/home';
}

const toContactPage = () => {
  window.location = '/manager/contact';
}

const toNoticesPage = () => {
  window.location = '/manager/notices';
}

const toInspectionsPage = async () => {
  window.location = '/manager/itineraries';
}

const toPropertiesPage = () => {
  window.location = '/manager/properties';
}

const toReportPage = () => {
  window.location = '/manager/reports';
}

export const mainListItems = (
  <div>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('home') !== -1 ? '#B0C4DE' : '',
    }}onClick={toDashboardPage}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('notices') !== -1 ? '#B0C4DE' : '',
    }}onClick={toNoticesPage}>
      <ListItemIcon>
        <ScheduleIcon />
      </ListItemIcon>
      <ListItemText primary="Notices" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('itineraries') !== -1 ? '#B0C4DE' : '',
    }}onClick={toInspectionsPage}>
      <ListItemIcon>
        <ExploreIcon />
      </ListItemIcon>
      <ListItemText primary="Inspections" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('properties') !== -1 ? '#B0C4DE' : '',
    }}onClick={toPropertiesPage}>
      <ListItemIcon>
        <HouseIcon />
      </ListItemIcon>
      <ListItemText primary="Properties" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('contact') !== -1 ? '#B0C4DE' : '',
    }}onClick={toContactPage}>
      <ListItemIcon>
        <ContactPageIcon />
      </ListItemIcon>
      <ListItemText primary="Contacts" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('notification') !== -1 ? '#B0C4DE' : '',
    }}onClick={toNotificationPage}>
      <ListItemIcon>
        <CircleNotificationsIcon />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('report') !== -1 ? '#B0C4DE' : '',
    }}onClick={toReportPage}>
      <ListItemIcon>
        <AssessmentIcon />
      </ListItemIcon>
      <ListItemText primary="Report" />
    </ListItem>
  </div>
);

export const mainListItemsUnreadNotification = (
  <div>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('home') !== -1 ? '#B0C4DE' : '',
    }}onClick={toDashboardPage}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('notices') !== -1 ? '#B0C4DE' : '',
    }}onClick={toNoticesPage}>
      <ListItemIcon>
        <ScheduleIcon />
      </ListItemIcon>
      <ListItemText primary="Notices" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('itineraries') !== -1 ? '#B0C4DE' : '',
    }}onClick={toInspectionsPage}>
      <ListItemIcon>
        <ExploreIcon />
      </ListItemIcon>
      <ListItemText primary="Inspections" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('properties') !== -1 ? '#B0C4DE' : '',
    }}onClick={toPropertiesPage}>
      <ListItemIcon>
        <HouseIcon />
      </ListItemIcon>
      <ListItemText primary="Properties" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('contact') !== -1 ? '#B0C4DE' : '',
    }}onClick={toContactPage}>
      <ListItemIcon>
        <ContactPageIcon />
      </ListItemIcon>
      <ListItemText primary="Contacts" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('notification') !== -1 ? '#B0C4DE' : '',
    }}onClick={toNotificationPage}>
      <ListItemIcon>
        <CircleNotificationsIcon color="secondary" />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('report') !== -1 ? '#B0C4DE' : '',
    }}onClick={toReportPage}>
      <ListItemIcon>
        <AssessmentIcon />
      </ListItemIcon>
      <ListItemText primary="Report" />
    </ListItem>
  </div>
);
