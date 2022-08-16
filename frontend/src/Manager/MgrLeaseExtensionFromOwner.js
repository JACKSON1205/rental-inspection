import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
// import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { mainListItems, mainListItemsUnreadNotification } from '../Manager/Mgr_ListItems';

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  declineButton: {
    left: '5%',
    width: '15%',
  },
  acceptButton: {
    right: '5%',
    width: '15%',
  },
  forwardButton: {
    width: '20%',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
}));

export default function ManagerLeaseExtensionFromOwner (props) {
  const notificationIndex = props.notificationIndex;
  const artifactId = props.artifactId;
  const clientId = props.clientId;
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [notifications, setNotifications] = React.useState([]);
  const [propertyId, setPropertyId] = React.useState();
  console.log(propertyId);
  const [propertyDetail, setpropertyDetail] = React.useState([]);
  const [extensionDate, setExtenstionDate] = React.useState('');
  // const [ownerEmail, setOwnerEmail] = React.useState('');
  const [tenantId, setTenantId] = React.useState('');
  const [artifactIdFromTenant, setArtifactIdFromTenant] = React.useState('');

  console.log(`propertyAddress: ${propertyDetail.address}`);
  React.useEffect(() => {
    // Make api request to get all notifications
    async function getNotifications () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/notifications', options);
      const data = await res.json();
      console.log(data);

      if (res.status === 200) {
        setNotifications(data.notifications);
        sessionStorage.setItem('token', data.token);
        getPropertyId();
      } else if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else if (res.status === 500) {
        console.log(data.error);
        alert(res.status + ': Internal Error');
      } else {
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
      sessionStorage.setItem('token', data.token);
    }

    // Make api request to get particular client's name
    async function getPropertyId () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }
      const res = await fetch(url + '/admin/owner/' + clientId[notificationIndex] + '/artifacts/' + artifactId[notificationIndex], options);
      const data = await res.json();
      console.log(data.artifact.artifact_json.property_id);

      if (res.status === 200) {
        setPropertyId(data.artifact.artifact_json.property_id);
        sessionStorage.setItem('token', data.token);
        getProperty(data.artifact.artifact_json.property_id);
      } else if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else if (res.status === 500) {
        console.log(data.error);
        alert(res.status + ': Internal Error');
      } else {
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
      sessionStorage.setItem('token', data.token);
    }

    // Make api request to get detail of the property
    async function getProperty (propertyId) {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/properties/' + propertyId, options);
      const data = await res.json();
      console.log(data.property);

      if (res.status === 200) {
        sessionStorage.setItem('token', data.token);
        setpropertyDetail(data.property);
        // setOwnerEmail(data.property.owner_email);
        getArtifact(clientId[notificationIndex], artifactId[notificationIndex]);
        // setLoading(false);
      } else if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else if (res.status === 500) {
        console.log(data.error);
        alert(res.status + ': Internal Error');
      } else {
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
      sessionStorage.setItem('token', data.token);
    }
    // Make api request to get detail of the artifact
    async function getArtifact (ownerId, artifactId) {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/owner/' + ownerId + '/artifacts/' + artifactId, options);
      const data = await res.json();
      console.log(data);

      if (res.status === 200) {
        sessionStorage.setItem('token', data.token);
        setExtenstionDate(data.artifact.artifact_json.extension_date);
        setTenantId(data.artifact.artifact_json.tenant_id);
        setArtifactIdFromTenant(data.artifact.artifact_json.artifact_id_from_tenant);
      } else if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else if (res.status === 500) {
        console.log(data.error);
        alert(res.status + ': Internal Error');
      } else {
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
      sessionStorage.setItem('token', data.token);
    }
    getNotifications();
  }, []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Request Property Lease Extension Approval
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <CheckAllRead notifications={notifications} />
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <br />
          <br />
          <Typography component="h1" variant="h4" align="center">
            Do you approve the property lease extension request from {propertyDetail.owner_first_name} {propertyDetail.owner_last_name}?
          </Typography>
          <br />
          <br />
          <Typography component="h1" variant="h5" align="center">
            Property Address: {propertyDetail.address}
          </Typography>
          <Typography component="h1" variant="h5" align="center">
            Postcode: {propertyDetail.post_code}
          </Typography>
          <br />
          <Typography component="h1" variant="h6" align="center">
            Extension Date: {extensionDate}
          </Typography>
          <br />
          <br />
          <div className={classes.buttonsContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              id="approveRequestButton"
              className={classes.acceptButton}
              // onClick={(event) => { event.preventDefault(); approveRequest(artifactId[notificationIndex], clientId[notificationIndex]); }}
              onClick={(event) => { event.preventDefault(); approveRequest(artifactIdFromTenant, tenantId); }}
            >
              Approve
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              id="declineRequestButton"
              className={classes.declineButton}
              // onClick={(event) => { event.preventDefault(); declineRequest(artifactId[notificationIndex], clientId[notificationIndex]); }}
              onClick={(event) => { event.preventDefault(); declineRequest(artifactIdFromTenant, tenantId); }}
            >
              Decline
            </Button>
          </div>
        </Container>
      </main >
    </div >
  );
}
// Backend url
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

async function approveRequest (artifactId, clientId) {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      status: 'approved_by_manager',
    }),
  }
  // Get data using fetch
  // const res = await fetch(url + '/admin/owner/' + clientId + '/artifacts/' + artifactId, options);
  const res = await fetch(url + '/admin/tenant/' + clientId + '/artifacts/' + artifactId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200 || res.status === 201) {
    console.log('Request of repairing approve');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/notification';
  } else if (res.status === 400 || res.status === 403) {
    console.log(data.error);
    alert(res.status + ': ' + data.error);
    // window.location = '/Login';
  } else {
    console.log('Fail to approve request');
    alert('Fail to approve request');
  }
  sessionStorage.setItem('token', data.token);
}

// Make api request of denieding connection from owner
async function declineRequest (artifactId, clientId) {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      status: 'denied_by_manager',
    }),
  }
  // Get data using fetch
  // const res = await fetch(url + '/admin/owner/' + clientId + '/artifacts/' + artifactId, options);
  const res = await fetch(url + '/admin/tenant/' + clientId + '/artifacts/' + artifactId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200 || res.status === 201) {
    console.log('Denied Request Success');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/notification';
  } else if (res.status === 400 || res.status === 403) {
    console.log(data.error);
    alert(res.status + ': ' + data.error);
    // window.location = '/Login';
  } else {
    console.log('Fail to denied request');
    alert('Fail to denied request');
  }
  sessionStorage.setItem('token', data.token);
}

ManagerLeaseExtensionFromOwner.propTypes = {
  artifactId: PropTypes.array,
  clientId: PropTypes.array,
  notificationIndex: PropTypes.number,
}

function CheckAllRead (props) {
  const notifications = props.notifications;
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].read === false) {
      return (
        <List>{mainListItemsUnreadNotification}</List>
      )
    }
  }
  return (
    <List>{mainListItems}</List>
  )
}

CheckAllRead.propTypes = {
  notifications: PropTypes.array.isRequired,
}
