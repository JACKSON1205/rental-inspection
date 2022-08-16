import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
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
import { mainListItems, mainListItemsUnreadNotification } from '../Manager/Mgr_ListItems';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
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
  cancelButton: {
    left: '70%',
  },
  saveButton: {
    left: '75%',
  },
  rolesSelection: {
    alignItems: 'center',
  },
}));

export default function EditContact (props) {
  const account = () => { window.location = '/manager/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const contactId = props.contactId;
  const classes = useStyles();
  const [Open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const [preferName, setPreferName] = React.useState('');
  const [phoneNumber, setphoneNumber] = React.useState('');
  const [roleTenant, setRoleTenant] = React.useState(false);
  const [roleOwner, setRoleOwner] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    async function getContactDetail (contactId) {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      };

      const res = await fetch(url + '/admin/contacts/' + contactId, options);
      const data = await res.json();
      console.log(data);
      if (res.status === 200) {
        console.log('success');
        console.log(data.contact);
        setRoleTenant(data.contact.tenant);
        setRoleOwner(data.contact.owner);
        setPreferName(data.contact.preferred_name);
        setphoneNumber(data.contact.phone_number);
        sessionStorage.setItem('token', data.token);
        getNotifications();
      } else {
        console.log('access denied');
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
    }
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
    }
    getContactDetail(contactId);
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
            Contact
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
          <Typography component="h1" variant="h5">
            Edit Contact Info
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="preferName"
            label="Prefer Name"
            name="preferName"
            autoFocus
            value={preferName}
            onChange={event => setPreferName(event.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="phoneNumber"
            label="Phone Number"
            name="phoneNumber"
            autoFocus
            value={phoneNumber}
            onChange={event => setphoneNumber(event.target.value)}
          />
          <br />
          <br />
          {<FormControl component="fieldset" className={classes.rolesSelection}>
            <FormLabel component="legend">Please Tick The Role(s) He/She is</FormLabel>
            <br />
            <FormGroup row>
              <FormControlLabel
                value={roleTenant}
                control={<Checkbox color="primary" />}
                label="Tenant"
                labelPlacement="top"
                checked={roleTenant}
                onClick={event => { event.target.checked ? setRoleTenant(true) : setRoleTenant(false) }}
              />
              <FormControlLabel
                value={roleOwner}
                control={<Checkbox color="primary" />}
                label="Owner"
                labelPlacement="top"
                checked={roleOwner}
                onClick={event => { event.target.checked ? setRoleOwner(true) : setRoleOwner(false) }}
              />
            </FormGroup>
          </FormControl>}
          <br />
          <br />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            id="mgrAddContactInfoButton"
            className={classes.cancelButton}
            href='/manager/contact'
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            id="mgrAddContactInfoButton"
            className={classes.saveButton}
            // href='/manager/contact'
            onClick={(event) => { event.preventDefault(); saveUpdatedContact(preferName, phoneNumber, roleTenant, roleOwner, contactId); }}
          >
            Save
          </Button>
          {/* <GetAllContactInfo /> */}
          <Box pt={4}>
          </Box>
        </Container>
      </main >
    </div >
  );
}
// Backend url
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

// Make api request of saving updated contact info
async function saveUpdatedContact (preferName, phoneNumber, tenant, owner, contactId) {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      preferred_name: preferName,
      phone_number: phoneNumber,
      tenant: tenant,
      owner: owner,
    }),
  }
  // Get data using fetch
  console.log(options);
  const res = await fetch(url + '/admin/contacts/' + contactId, options);
  const data = await res.json();
  // console.log(data);

  if (res.status === 200) {
    console.log('Update contact success');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/contact';
  } else if (res.status === 400 || res.status === 403) {
    console.log('Update contact fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
    // window.location = '/Login';
  } else {
    console.log('Update contact fail');
    alert('Update contact fail');
  }
}

EditContact.propTypes = {
  contactId: PropTypes.number.isRequired,
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
