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
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { mainListItems, mainListItemsUnreadNotification } from '../Manager/Mgr_ListItems';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ChatIcon from '@material-ui/icons/Chat';
import ScheduleIcon from '@material-ui/icons/Schedule';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Join from '../Join'
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
    align: 'left',
  },
  buttonClass: {
    marginLeft: theme.spacing(5),
    align: 'left',
  },
  container2: {
    display: 'flex',
  },
  gridClass: {
    width: '20%',
  },
  textField: {
    paddingBottom: theme.spacing(0),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    backgroundColor: '#dcdcfa'
  },
  fixedHeight: {
    height: 210,
  },
  addContactButton: {
    left: '90%',
    marginTop: theme.spacing(5),
    backgroundColor: '#71c232',
  },
  addRemoveButton: {
    left: '20%',
  },
  addEditButton: {
    left: '15%',
  },
  addSchdInspctButton: {
    left: '5%',
  },
  chatButton: {
    left: '10%'
  }
}));

// fetch to particular contact edition page, base on contact id
const toEditContactPage = (contactId) => {
  window.location = '/manager/contact_edit/' + contactId;
}

export default function ContactsPage () {
  const account = () => { window.location = '/manager/account'; }
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
  const [contacts, setContacts] = React.useState([]);
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

      if (res.status === 200) {
        setNotifications(data.notifications);
        sessionStorage.setItem('token', data.token);
        getContacts();
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
    async function getContacts () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/contacts', options);
      const data = await res.json();
      console.log(data);

      if (res.status === 200) {
        sessionStorage.setItem('token', data.token);
        setContacts(data.contacts_list);
        setLoading(false);
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
          <IconButton type="submit" id="mgrAddContactInfoButton" className={classes.addContactButton} href='/manager/contact_addNew'><AddIcon /></IconButton>
          <GetAllContactInfo loading={loading} contacts={contacts} />
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

function GetAllContactInfo (props) {
  const loading = props.loading;
  const contacts = props.contacts;

  if (loading) {
    return (
      <div>
        Loading
      </div>
    )
  } else {
    return (
      <Grid container spacing={3}>
        {
          // looping to generate and display each contact detail according to contact_id
          contacts.map(contact => (
            <ContactDetail contact={contact} key={contact.contact_id} />
          ))
        }
      </Grid>
    )
  }
}

function ContactDetail (props) {
  const [joinResult, setJoinResult] = React.useState(null);
  const contact = props.contact;
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  // console.log(contact);
  const [show, setShow] = React.useState(true);

  return (
    // <Grid container spacing={5}>
    <Grid container direction="row" spacing={5}>
      <Grid item xs={5}>
        <Paper className={fixedHeightPaper} elevation={5}>
          <Grid container direction="column">
            <Grid item>
              <Typography variant="h6" color="inherit" align="left" noWrap className={classes.textField}>
                {contact.preferred_name}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" color="inherit" align="left" noWrap className={classes.textField}>
                <IconButton><PhoneIcon /></IconButton> {contact.phone_number}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" color="inherit" align="left" noWrap className={classes.textField}>
                <IconButton><EmailIcon /></IconButton> {contact.email}
              </Typography>
            </Grid>
            <Container maxWidth="lg" className={classes.container2}>
              <IconButton className={classes.buttonClass}><ScheduleIcon /></IconButton>
              <IconButton className={classes.buttonClass} onClick={ async (event) => { event.preventDefault(); setShow(!show); show ? setJoinResult(await Join(contact.user_id, contact.tenant ? 'tenant' : 'owner')) : setJoinResult(null); } }><ChatIcon /></IconButton>
              <IconButton className={classes.buttonClass} onClick={(event) => { event.preventDefault(); toEditContactPage(contact.contact_id); } }><EditIcon /></IconButton>
              <IconButton className={classes.buttonClass} onClick={(event) => { event.preventDefault(); deleteContact(contact.contact_id); } }><DeleteForeverIcon /></IconButton>
            </Container>
          </Grid>
        </Paper>
        <br /><br /><br />
      </Grid>
      <Grid item xs={4}>
        {joinResult}
      </Grid>
    </Grid>
  );
}

// Make api request of deleting contact info
async function deleteContact (contactId) {
  const options = {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/contacts/' + contactId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('Delete contact success');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/contact';
  } else if (res.status === 400 || res.status === 403) {
    console.log('Delete contact fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  } else {
    console.log('Delete contact fail');
    alert('Delete contact fail');
  }
  sessionStorage.setItem('token', data.token);
}

ContactDetail.propTypes = {
  contact: PropTypes.object.isRequired,
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
// Make api request of login
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
