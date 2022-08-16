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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

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

export default function NotificationDetail (props) {
  const account = () => { window.location = '/manager/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const notificationIndex = props.notificationIndex;
  const artifactId = props.artifactId;
  const clientId = props.clientId;
  const classes = useStyles();
  const [Open, setOpen] = React.useState(true);
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
  const [repairImage, setRepairImage] = React.useState('');
  const [repairText, setRepairText] = React.useState('');
  const [ownerEmail, setOwnerEmail] = React.useState('');

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
      const res = await fetch(url + '/admin/tenant/' + clientId[notificationIndex] + '/artifacts/' + artifactId[notificationIndex], options);
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
        setOwnerEmail(data.property.owner_email);
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
    async function getArtifact (tenantId, artifactId) {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/tenant/' + tenantId + '/artifacts/' + artifactId, options);
      const data = await res.json();
      console.log(data);

      if (res.status === 200) {
        sessionStorage.setItem('token', data.token);
        setRepairImage(data.artifact.artifact_json.image);
        setRepairText(data.artifact.artifact_json.description);
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
            Request Repairing Property Approval
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
          <br />
          <br />
          <Typography component="h1" variant="h4" align="center">
            Do you approve the property maintenance request from {propertyDetail.tenant_first_name} {propertyDetail.tenant_last_name}?
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
            Description: {repairText}
          </Typography>
          <br />
          <div className={classes.imageContainer}>
            {repairImage !== '' ? <img src={repairImage} width="150" /> : null}
          </div>
          <br />
          <div className={classes.buttonsContainer}>
            <Button
              type="submit"
              variant="contained"
              color="inherit"
              id="forwardRequestButton"
              className={classes.forwardButton}
              onClick={(event) => { event.preventDefault(); forwardRepairDetailToOwner(ownerEmail, repairImage, repairText, propertyDetail.property_id, clientId[notificationIndex], artifactId[notificationIndex]); }}
            >
              Forward to Owner
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

// Make api send eviction notice to tenant
async function forwardRepairDetailToOwner (ownerEmail, repairImage, repairText, propertyId, tenantId, artifactId) {
  const artifactJSON = {
    property_id: propertyId,
    repairing_image: repairImage,
    description: repairText,
    tenant_id: tenantId,
    artifact_id_from_tenant: artifactId,
  };
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      artifact_json: artifactJSON,
      artifact_type: 'request_repair',
      email: ownerEmail,
    }),
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/owner/artifacts', options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200 || res.status === 201) {
    console.log('Forward repairing detail to owner success');
    sessionStorage.setItem('token', data.token);
    alert('Forward repairing detail to owner success !!!');
    // window.location = '/manager/notification';
  } else if (res.status === 400 || res.status === 403) {
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  } else {
    console.log('Fail to forward repairing detail to owner');
    alert('Fail to forward repairing detail to owner');
  }
  sessionStorage.setItem('token', data.token);
}

NotificationDetail.propTypes = {
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
