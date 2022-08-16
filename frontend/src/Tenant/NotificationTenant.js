import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MarkunreadIcon from '@material-ui/icons/Markunread';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { mainListItems, mainListItemsUnreadNotification } from './Tenant_ListItems';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Button from '@mui/material/Button';

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
    background: 'green',
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
  textField: {
    paddingBottom: theme.spacing(0),
    marginLeft: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    // overflow: 'auto',
    flexDirection: 'column',
    backgroundColor: '#dcdcfa',
    justifyContent: 'space-between',
  },
  fixedHeight: {
    height: 290,
  },
  addContactButton: {
    left: '90%',
  },
  addRemoveButton: {
    left: '60%',
  },
  addEditButton: {
    left: '50%',
  },
  addSchdInspctButton: {
    left: '5%',
  },
}));

export default function TenantNotificationsPage () {
  const account = () => { window.location = '/tenant/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const classes = useStyles();
  const [Open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState([]);
  React.useEffect(() => {
    // Make api request to get all contacts
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
      setNotifications(data.notifications);
      sessionStorage.setItem('token', data.token);
      setLoading(false);
    }
    getNotifications();
  }, []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, Open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, Open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Notification
          </Typography>
          <Button
            id="Profile-button"
            aria-controls="Profile-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            color="inherit"
          >
          <AccountCircleIcon fontSize="large"/>
          </Button>
          <Menu
            id="Amenu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={(event) => { event.preventDefault(); account() }}> <ManageAccountsIcon />My account</MenuItem>
            <MenuItem onClick={(event) => { event.preventDefault(); logoutProcess(); }}><ExitToAppIcon />Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !Open && classes.drawerPaperClose),
        }}
        Open={Open}
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
          <GetAllNotificationInfo loading={loading} notifications={notifications} />
          <Box pt={4}>
          </Box>
        </Container>
      </main>
    </div>
  );
}
// Backend url
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

// console.log(sessionStorage.getItem('token'));

function GetAllNotificationInfo (props) {
  const notifications = props.notifications;
  const loading = props.loading;

  if (loading) {
    return (
      <div>
        No Notification
      </div>
    )
  } else {
    return (
      <Grid container spacing={3}>
        {
          // looping to generate and display each contact detail according to contact_id
          notifications.map(notification => (
            <NotificationDetail notification={notification} key={notification.notification_id} />
          ))
        }
      </Grid>
    )
  }
}

GetAllNotificationInfo.propTypes = {
  notification: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
}

function NotificationDetail (props) {
  const notification = props.notification;
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  console.log(notification);

  return (
    <Grid item xs={7}>
      <Paper className={fixedHeightPaper}>
        <Typography component="body2" variant="h6" color="inherit" align="left" className={classes.smallContext}>
          {notification.read ? <IconButton onClick={(event) => { event.preventDefault(); updateReadStatus(notification.notification_id); }}><MarkunreadIcon /> </IconButton> : <IconButton onClick={(event) => { event.preventDefault(); updateReadStatus(notification.notification_id); }}><MarkunreadIcon color="secondary" /></IconButton>}
        </Typography>
        <Typography component="body2" variant="h6" color="inherit" align="left" className={classes.textField}>
          {notification.text}
        </Typography>
        <br />
        <br />
        <br />
        <Typography component="body2" variant="subtitle2" color="inherit" align="right" noWrap className={classes.textField}>
          {notification.timestamp}
        </Typography>
        {notification.text.startsWith('Welcome') ? <IconButton onClick={(event) => { event.preventDefault(); window.location = '/tenant/contact'; }}><OpenInNewIcon /></IconButton> : null}
        {notification.artifact_type === 'connection_from_manager' ? <IconButton onClick={(event) => { event.preventDefault(); openNotification(notification.notification_id, notification.artifact_type, notification.artifact_id); }}><OpenInNewIcon /></IconButton> : null}
        {notification.artifact_type === 'notice_eviction' ? <IconButton onClick={(event) => { event.preventDefault(); openNotification(notification.notification_id, notification.artifact_type, notification.artifact_id); }}><OpenInNewIcon /></IconButton> : null}
        {notification.artifact_type === 'notice' ? <IconButton onClick={(event) => { event.preventDefault(); openNotification(notification.notification_id, notification.artifact_type, notification.artifact_id); }}><OpenInNewIcon /></IconButton> : null}
        {notification.artifact_type === 'report_due' ? <IconButton onClick={(event) => { event.preventDefault(); FulfillReport(notification.artifact_id); }}><OpenInNewIcon /></IconButton> : null}
        </Paper>
    </Grid>
  );
}

// Make api request of saving updated notification read status
async function updateReadStatus (notificationsId) {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  }
  // Get data using fetch
  console.log(options);
  const res = await fetch(url + '/admin/notifications/' + notificationsId, options);
  const data = await res.json();
  // console.log(data);

  if (res.status === 200) {
    console.log('Update read status success');
    sessionStorage.setItem('token', data.token);
    window.location = '/tenant/notification';
  } else if (res.status === 400 || res.status === 403) {
    console.log('Update read status fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
    // window.location = '/';
  } else {
    console.log('Update read status fail');
    alert('Update read status fail');
  }
  sessionStorage.setItem('token', data.token);
}

NotificationDetail.propTypes = {
  notification: PropTypes.object.isRequired,
}

async function openNotification (notificationsId, artifactType, artifactId) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/artifacts/' + artifactId, options);
  const data = await res.json();
  console.log(data);

  if (artifactType === 'connection_from_manager' && data.artifact_resp.status === 'pending') {
    sessionStorage.setItem('token', data.token);
    window.location = '/tenant/connection_approval/' + notificationsId;
  } else if (artifactType === 'notice_eviction' && data.artifact_resp.status === 'pending') {
    sessionStorage.setItem('token', data.token);
    window.location = '/tenant/eviction_detail/' + notificationsId;
  } else if (artifactType === 'notice' && data.artifact_resp.status === 'pending') {
    sessionStorage.setItem('token', data.token);
    window.location = '/tenant/notice_detail/' + notificationsId;
  } else if (artifactType === null) {
    sessionStorage.setItem('token', data.token);
    window.location = '/tenant/notification';
  }
  sessionStorage.setItem('token', data.token);
}

async function FulfillReport (artifactId) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  }
  const res = await fetch(url + '/admin/reports/due/' + artifactId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 401) {
    console.log('unauthorized: redirecting to login');
    console.log(data.error)
    alert(res.status + ': ' + data.message);
    window.location = '/Login';
  } else {
    if (res.status === 200) {
      console.log('sign up success');
      console.log(data);
      const components = data.artifact_resp.artifact_json.components;
      sessionStorage.setItem('selectedComponents', JSON.stringify({ components: components }));
      sessionStorage.setItem('reportArtifactID', data.artifact_resp.artifact_id);
      window.location = '/tenant/fulfill';
    } else if (res.status === 500) {
      console.log(data.error);
      alert(res.status + ': Internal Error');
    } else {
      console.log(data.error);
      alert(res.status + ': ' + data.error);
    }
    sessionStorage.setItem('token', data.token);
  }
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
// Make api request of logout
async function logoutProcess () {
  const userToken = sessionStorage.getItem('token')
  const options = {
    method: 'POST',
    headers: {
      accept: 'Application/json',
      'Content-Type': 'Application/json',
      Authorization: 'Bearer ' + userToken,
    },
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/logout', options);
  const data = await res.json();
  console.log(userToken);

  if (res.status === 200) {
    console.log('logout success');
    sessionStorage.removeItem('token');
    window.location = '/Login';
  } else if (res.status === 401) {
    console.log('unauthorized: redirecting to login');
    console.log(data.error)
    sessionStorage.removeItem('token');
    alert(res.status + ': ' + data.message);
    window.location = '/Login';
  } else if (res.status === 500) {
    console.log(data.error);
    alert(res.status + ': Internal Error');
  } else {
    console.log('logout fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  }
}
