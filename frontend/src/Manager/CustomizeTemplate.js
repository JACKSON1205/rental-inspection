import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
// import { FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
// import TextField from '@material-ui/core/TextField';
import { mainListItems, mainListItemsUnreadNotification } from '../Manager/Mgr_ListItems';
import DualListBox from 'react-dual-listbox';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
// Backend url
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;
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
  listboxContainer: {
    float: 'center',
    height: '30em',
    width: '100%',
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
    marginTop: '2%',
  },
  fixedHeight: {
    height: 240,
  },
  updateButton: {
    left: '10%',
  },
  deleteButton: {
    left: '50%',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
}));

export default function CustomizeTemplate (props) {
  const account = () => { window.location = '/manager/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  console.log('customize templates');
  const templateID = props.templateID;
  const parentID = props.parentID;
  const templateComponents = props.templateJSON.components;
  const requiredComponents = [];
  for (const comp of templateComponents) {
    if ((comp.label.includes('Tenant Name')) || (comp.label.includes('Tenant Email')) || (comp.label.includes('Description'))) {
      requiredComponents.push(comp);
    }
  }
  console.log(requiredComponents);
  const classes = useStyles();
  const [Open, setOpen] = React.useState(true);
  const [selected, setSelected] = React.useState([]);
  const [stringify, setStringify] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  function onChange (selected) {
    setStringify(false);
    console.log(selected);
    setSelected(selected);
  }

  function submitToPreview (selected) {
    console.log('Saving ');
    console.log(selected);
    for (const required of requiredComponents) {
      console.log(required);
      if (!(selected.includes(required.value))) {
        console.log(selected);
        console.log(requiredComponents);
        alert(`${required.label} is required to be selected.`);
        return
      }
    }
    const selectedComponents = [];
    for (const comp of templateComponents) {
      if (selected.includes(comp.value)) {
        selectedComponents.push(comp);
      }
    }
    sessionStorage.setItem('selectedComponents', JSON.stringify(selectedComponents));
    sessionStorage.setItem('parentTemplate', typeof parentID !== 'undefined' ? parentID : templateID);
    sessionStorage.setItem('readOnly', false);
    window.location = '/manager/reports/preview';
  }

  if (stringify) {
    for (const comp of props.templateJSON.components) {
      if (typeof comp.value !== 'string') {
        console.log(comp.value);
        comp.value = JSON.stringify(comp.value);
      }
    }
  }

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
            Reports
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
        <CheckAllRead notifications={[]} />
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Typography variant="h6" style={{ marginBottom: '2em' }}>
            Select which fields you require in this report.
          </Typography>
          <Grid container direction={'row'} spacing={3}>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              <link rel="stylesheet" href="//use.fontawesome.com/releases/v5.6.3/css/all.css"/>
              <DualListBox
                options={templateComponents}
                selected={selected}
                onChange={onChange}
                showOrderButtons
                preserveSelectOrder
                className={classes.listboxContainer}
                lang={{ availableHeader: 'Available Fields for Report', selectedHeader: 'Selected Fields for Report' }}
                showHeaderLabels
              />
            </Grid>
            <Grid item xs={3}></Grid>
          </Grid>
          <Grid container direction={'row'} spacing={3}>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              <link rel="stylesheet" href="//use.fontawesome.com/releases/v5.6.3/css/all.css"/>
              <Button
                type="preview"
                fullWidth
                variant="contained"
                color="primary"
                id="previewButton"
                className={classes.submit}
                onClick={(event) => { event.preventDefault(); submitToPreview(selected); }}
              >
                Preview Form
              </Button>
            </Grid>
            <Grid item xs={3}></Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}

CustomizeTemplate.propTypes = {
  templateID: PropTypes.number.isRequired,
  templateType: PropTypes.string.isRequired,
  templateJSON: PropTypes.object.isRequired,
  parentID: PropTypes.number,
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
