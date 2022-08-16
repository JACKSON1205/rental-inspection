import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
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
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
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
  requestEvictionButton: {
    left: '40%',
    width: '60%',
  },
  requestListingButton: {
    left: '40%',
    width: '60%',
  },
  updateImageButton: {
    left: '40%',
    width: '60%',
  },
  requestUnlistingButton: {
    left: '40%',
    width: '60%',
  },
}));

export default function propertyDetailPage (props) {
  const account = () => { window.location = '/manager/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const propertyId = props.propertyId;
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [Open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [notifications, setNotifications] = React.useState([]);
  const [propertyDetail, setpropertyDetail] = React.useState([]);
  const [imageUpload, setImageUpload] = React.useState(null);
  console.log(imageUpload);
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
        getProperty();
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
    async function getProperty () {
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
            Property
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
          <Grid item xs={10}>
            <Paper className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
                    Address: {propertyDetail.address}
                  </Typography>
                  <br />
                  <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
                    Postcode: {propertyDetail.post_code}
                  </Typography>
                  <br />
                  <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
                    Leased Status: {propertyDetail.leased ? 'Leased' : 'Unleased'}
                  </Typography>
                  <br />
                  <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
                    Expiration Date: {propertyDetail.lease_expiration_date}
                  </Typography>
                  <br />
                  <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
                    Owner: {propertyDetail.owner_first_name} {propertyDetail.owner_last_name}
                  </Typography>
                  <br />
                  {propertyDetail.manager_thumbnail !== '' ? <img src={propertyDetail.manager_thumbnail} width="150" /> : null}
                </Grid>
                <Grid item xs={6}>
                  {propertyDetail.leased
                    ? <Button
                      variant="contained"
                      color="secondary"
                      id="requestEvictionButton"
                      className={classes.requestEvictionButton}
                      // href={'/owner/request_eviction/' + propertyId}
                      onClick={(event) => { event.preventDefault(); unleasingProperty(propertyId); }}
                    >
                      Unlease
                    </Button>
                    : <Button
                      variant="contained"
                      color="secondary"
                      id="requestListingButton"
                      className={classes.requestListingButton}
                      href={'/manager/property_lease/' + propertyId}
                    // onClick={(event) => { event.preventDefault(); requestListingProperty(propertyId); }}
                    >
                      Lease
                    </Button>}
                  <br />
                  <br />
                  {propertyDetail.leased
                    ? <Button
                      variant="contained"
                      color="secondary"
                      id="requestListingButton"
                      className={classes.requestListingButton}
                      href={'/manager/manager/lease_extend/' + propertyId}
                    // onClick={(event) => { event.preventDefault(); requestListingProperty(propertyId); }}
                    >
                      Lease Extension
                    </Button>
                    : null}
                  <br />
                  <br />
                  {propertyDetail.leased
                    ? <Button
                      variant="contained"
                      color="secondary"
                      id="requestListingButton"
                      className={classes.requestListingButton}
                      href={'/manager/inspections/schd_single/' + propertyId}
                    // onClick={(event) => { event.preventDefault(); requestListingProperty(propertyId); }}
                    >
                      Schedule Inspection
                    </Button>
                    : null}
                  <br />
                  <br />
                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    id="updateImageButton"
                    className={classes.updateImageButton}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files[0];
                        setImageUpload(file);
                        alert('Image successfully uploaded !! Please click "Save" to complete the feature.');
                      }}
                    />
                  </Button>
                  <br />
                  <br />
                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    id="updateImageButton2"
                    className={classes.updateImageButton}
                    onClick={(event) => { event.preventDefault(); updateManagerImage(imageUpload, propertyId); }}
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <br />
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <Paper className={fixedHeightPaper}>
                <Typography component="body2" variant="inherit" color="inherit" align="left" noWrap className={classes.smallContext}>
                  Owner: {propertyDetail.owner_first_name} {propertyDetail.owner_last_name}
                </Typography>
                <br />
                <Typography component="body2" variant="inherit" color="inherit" align="left" noWrap className={classes.smallContext}>
                  Owner Email: {propertyDetail.owner_email}
                </Typography>
                <br />
                {/* {propertyDetail.owner_thumbnail !== '' ? <img src={propertyDetail.owner_thumbnail} width="150" /> : null} */}
              </Paper>
            </Grid>
            {/* <br /> */}
            <Grid item xs={5}>
              <Paper className={fixedHeightPaper}>
                <Typography component="body2" variant="inherit" color="inherit" align="left" noWrap className={classes.smallContext}>
                  Tenant: {propertyDetail.tenant_first_name} {propertyDetail.tenant_last_name}
                </Typography>
                <br />
                <Typography component="body2" variant="inherit" color="inherit" align="left" noWrap className={classes.smallContext}>
                  Tenant Email: {propertyDetail.tenant_email}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}
// Backend url
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

// Make api request of updating owner property image
async function updateManagerImage (imageUpload, propertyId) {
  const formData = new FormData();
  formData.append('image', imageUpload);
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      // 'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: formData,
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/properties/' + propertyId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('Updated image success');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/property_detail/' + propertyId;
  } else if (res.status === 400 || res.status === 403) {
    console.log('Update image fail');
    console.log(data.error);
    alert(data.error);
  } else {
    console.log('Update image fail');
    alert('Update image fail');
  }
  sessionStorage.setItem('token', data.token);
}

// Make api unleasing owner property
async function unleasingProperty (propertyId) {
  const formData = new FormData();
  formData.append('leased', false);
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      // 'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: formData,
  }
  // Get data using fetch
  console.log(options);
  const res = await fetch(url + '/admin/properties/' + propertyId, options);
  const data = await res.json();
  // console.log(data);

  if (res.status === 200 || res.status === 201) {
    console.log('Unleasing property success');
    sessionStorage.setItem('token', data.token);
    alert('Unleasing property success');
    window.location = '/manager/property_detail/' + propertyId;
  } else if (res.status === 400 || res.status === 403) {
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  } else {
    console.log('Unleasing property fail');
    alert('Unleasing property fail');
  }
  sessionStorage.setItem('token', data.token);
}

propertyDetailPage.propTypes = {
  propertyId: PropTypes.number,
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
