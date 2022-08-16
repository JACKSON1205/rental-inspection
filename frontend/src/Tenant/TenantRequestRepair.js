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
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { mainListItems, mainListItemsUnreadNotification } from '../Tenant/Tenant_ListItems';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
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
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  Cancelbutton: {
    left: '50%',
    width: '20%',
    // margin: '50px',
  },
  RepairButton: {
    // margin: '50px auto',
    left: '15%',
    width: '20%',
  },
  choose: {
    margin: '20px auto',
  },
  UploadButton: {
    margin: '20px auto',
  },
}));

export default function TenantRequestRepair (props) {
  const account = () => { window.location = '/tenant/account'; }
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
  const [Open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const PORT = require('../config.json').BACKEND_PORT;
  const url = 'http://localhost:' + PORT;

  const [notifications, setNotifications] = React.useState([]);
  const [repairDescription, setRepairDescription] = React.useState('');
  // const [imageUpload, setImageUpload] = React.useState(null);
  const [imageUpload, setimageUpload] = React.useState('');

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
            {/* <MenuIcon /> */}
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Requested maintenance
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

          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="repairDescription"
            label="A brief description of what needs to be maintained"
            name="requestRepair"
            autoFocus
            value={repairDescription}
            onChange={event => setRepairDescription(event.target.value)}
          />
          <br />
          <br />
          <Typography component="h1" variant="h5" className={classes.choose}>
            You can upload photo that need to be maintained
          </Typography>
          <Button
            variant="contained"
            component="label"
            fullWidth
            margin="normal"
            startIcon={<CloudUploadIcon />}
          >
            Upload Image
            <input
              type="file"
              hidden
              // onChange={(event) => {
              //   const file = event.target.files[0];
              //   setImageUpload(file);
              //   alert('Upload Image Success !!!');
              // }}
              onChange={(event) => {
                const file = event.target.files[0];
                fileToDataUrl(file).then((imgURL) => {
                  setimageUpload(imgURL);
                }).catch(e => {
                  console.log(e);
                })
                setimageUpload(event.target.value);
              }}
            />
          </Button>
          <br />
          <br />
          <Button
            type="button"
            variant="contained"
            color="secondary"
            id="requestButton"
            className={classes.RepairButton}
            onClick={(event) => { event.preventDefault(); requestRepairProperty(imageUpload, repairDescription, propertyId); }}
          >
            Request Repair
          </Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            id="cancelButton"
            className={classes.Cancelbutton}
            href='/tenant/request'
          >
            Cancel
          </Button>

          <Box pt={4}>
          </Box>
        </Container>
      </main>
    </div>
  );
}

const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

// Make api request of repair from tenant
async function requestRepairProperty (imageUpload, repairDescription, propertyId) {
  const artifactJSON = {
    image: imageUpload,
    description: repairDescription,
    property_id: propertyId,
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
    }),
  }
  // Get data using fetch
  console.log(options);
  const res = await fetch(url + '/admin/requests', options);
  const data = await res.json();

  if (res.status === 200 || res.status === 201) {
    console.log('Request repair property success');
    sessionStorage.setItem('token', data.token);
    window.location = '/tenant/request';
    alert('Request repair property success');
  } else if (res.status === 400 || res.status === 403) {
    console.log('Request repair property fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  } else {
    console.log('Request repair property fail');
    alert('Request repair property fail');
  }
  sessionStorage.setItem('token', data.token);
}

TenantRequestRepair.propTypes = {
  propertyId: PropTypes.number,
}

// Transform image file to url
// Reference from helper.js of assignment 2
function fileToDataUrl (file) {
  console.log(file);
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
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
