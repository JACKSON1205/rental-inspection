import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ContactPageIcon from '@material-ui/icons/Contacts';
import RequestPageIcon from '@material-ui/icons/Edit';
import CircleNotificationsIcon from '@material-ui/icons/Notifications';

const toNotificationPage = () => {
  window.location = '/tenant/notification';
}

const toDashboardPage = () => {
  window.location = '/tenant/home';
}

const toContactPage = () => {
  window.location = '/tenant/contact';
}

const toRequestPage = () => {
  window.location = '/tenant/request';
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
      backgroundColor: window.location.href.indexOf('contact') !== -1 ? '#B0C4DE' : '',
    }}onClick={toContactPage}>
      <ListItemIcon>
        <ContactPageIcon />
      </ListItemIcon>
      <ListItemText primary="Contacts" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('request') !== -1 ? '#B0C4DE' : '',
    }}onClick={toRequestPage}>
      <ListItemIcon>
        <RequestPageIcon />
      </ListItemIcon>
      <ListItemText primary="Requests" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('notification') !== -1 ? '#B0C4DE' : '',
    }}onClick={toNotificationPage}>
      <ListItemIcon>
        <CircleNotificationsIcon />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
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
      backgroundColor: window.location.href.indexOf('contact') !== -1 ? '#B0C4DE' : '',
    }}onClick={toContactPage}>
      <ListItemIcon>
        <ContactPageIcon />
      </ListItemIcon>
      <ListItemText primary="Contacts" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('request') !== -1 ? '#B0C4DE' : '',
    }}onClick={toRequestPage}>
      <ListItemIcon>
        <RequestPageIcon />
      </ListItemIcon>
      <ListItemText primary="Requests" />
    </ListItem>
    <ListItem button style={{
      backgroundColor: window.location.href.indexOf('notification') !== -1 ? '#B0C4DE' : '',
    }}onClick={toNotificationPage}>
      <ListItemIcon>
        <CircleNotificationsIcon color="secondary" />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
    </ListItem>
  </div>
);
