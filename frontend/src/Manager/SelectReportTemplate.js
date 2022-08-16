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
}));

const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

export default function MgrSelectReport () {
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
  const fixedHeightPaper = clsx(classes.paper);//, classes.fixedHeight);
  const [Open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [notifications, setNotifications] = React.useState([]);
  const [defaultTemplates, setDefaultTemplates] = React.useState([]);
  const [customTemplates, setCustomTemplates] = React.useState([]);

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

      if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else {
        if (res.status === 200) {
          setNotifications(data.notifications);
        } else if (res.status === 500) {
          console.log(data.error);
          alert(res.status + ': Internal Error');
        } else {
          console.log(data.error);
          alert(res.status + ': ' + data.error);
        }
        sessionStorage.setItem('token', data.token);
      }
      getTemplates();
    }
    async function getTemplates () {
      console.log('Getting Templates');
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }
      const res = await fetch(url + '/admin/templates', options);
      const data = await res.json();
      console.log(data);
      setDefaultTemplates(data.data.default ? data.data.default : []);
      setCustomTemplates(data.data.custom ? data.data.custom : []);
      sessionStorage.setItem('token', data.token);
    }
    let i = 0;
    for (const def of defaultTemplates) {
      def.key = i;
      i++;
    }
    for (const cust of customTemplates) {
      cust.key = i;
      i++;
    }
    getNotifications();
  }, []);

  class DefaultReport extends React.PureComponent {
    constructor (props) {
      super(props);
      this.templateID = props.templateID
      this.title = props.title;
      this.description = props.description;
    }

    render () {
      return (
        <Paper className={fixedHeightPaper}>
          <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
            {this.title}
          </Typography>
          <Typography component="body2" variant="body" color="inherit" align="left" noWrap className={classes.smallContext}>
              {this.description}
          </Typography>
          <Container maxWidth="lg" className={classes.container}>
          <Button
              variant="contained"
              color="success"
              id="mgrSchdInspctButton"
              className={classes.addSchdInspctButton}
              onClick={() => { selectDefaultReport(this.templateID); }}
          >
              Select
          </Button>
          </Container>
        </Paper>
      );
    }
  }

  class CustomReport extends React.PureComponent {
    constructor (props) {
      super(props);
      this.templateID = props.templateID;
      this.title = props.title;
      this.date = props.date;
      this.parentTemplate = props.parentTemplate;
    }

    render () {
      return (
        <Paper className={fixedHeightPaper}>
          <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
            Custom Report: {this.title}
          </Typography>
          <Typography component="body2" variant="body" color="inherit" align="left" noWrap className={classes.smallContext}>
            Created: {this.date}
          </Typography>
          <Typography component="body2" variant="body" color="inherit" align="left" noWrap className={classes.smallContext}>
            Derived from: {this.parentTemplate}
          </Typography>
          <Container maxWidth="lg" className={classes.container}>
          <Button
              variant="contained"
              color="success"
              id="mgrSchdInspctButton"
              className={classes.addSchdInspctButton}
              onClick={() => { selectCustomReport(this.templateID); }}
          >
              Select
          </Button>
          </Container>
        </Paper>
      );
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
            aria-expanded={Open ? 'true' : undefined}
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
            <Typography component="h6" variant="h6">
                Select a report template.
            </Typography>
            <Grid item xs={9}>
              {
                defaultTemplates.map(def => {
                  return <DefaultReport
                  title={def.title}
                  description={def.description}
                  templateID={def.template_id}
                  key={def.key}/>
                })
              }
            </Grid>
            <Grid item xs={9}>
              {
                customTemplates
                  ? customTemplates.map(cust => {
                      return <CustomReport
                      title={cust.title}
                      templateID={cust.template_id}
                      date={cust.date}
                      parentTemplate={cust.parent_template}
                      key={cust.key}/>
                    })
                  : null
              }
            </Grid>
        </Container>
      </main>
    </div>
  );
}

async function selectDefaultReport (templateID) {
  window.location = `/manager/templates/default/${templateID}`;
}

async function selectCustomReport (templateID) {
  window.location = `/manager/templates/custom/${templateID}`;
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
    window.location = '/';
  } else if (res.status === 401) {
    console.log('unauthorized: redirecting to login');
    console.log(data.error)
    sessionStorage.removeItem('token');
    alert(res.status + ': ' + data.message);
    window.location = '/';
  } else if (res.status === 500) {
    console.log(data.error);
    alert(res.status + ': Internal Error');
  } else {
    console.log('logout fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  }
}
