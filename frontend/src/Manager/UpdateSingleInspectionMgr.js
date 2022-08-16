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
import { TimePicker, StaticDatePicker } from '@mui/lab';
import Stack from '@mui/material/Stack';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Button from '@material-ui/core/Button';
import { mainListItems, mainListItemsUnreadNotification } from './Mgr_ListItems';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Menu from '@mui/material/Menu';
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
  Submitbutton: {
    margin: '100px',
    left: '50%',
  },
  Cancelbutton: {
    margin: '100px',
    marginRight: 10,
  },
  choose: {
    margin: '50px auto',
  },
  time: {
    margin: '50px',
    left: '1%',
  },
  AddressName: {
    margin: '50px',
    left: '1%',
  },
  TenantName: {
    margin: '50px',
    left: '1%',
  },
}));

UpdateSingleInspect.propTypes = {
  inspectionId: PropTypes.number.isRequired,
}

export default function UpdateSingleInspect (props) {
  const account = () => { window.location = '/manager/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const inspectionId = props.inspectionId;
  const classes = useStyles();
  const [Open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [inspectDate, setInspectDate] = React.useState(new Date());
  let today = inspectDate.toISOString().split('T')[0]
  const [fromTime, setFromTime] = React.useState(new Date(today + 'T' + '09:00:00'));
  const [toTime, setToTime] = React.useState(new Date(today + 'T' + '18:00:00'))
  const [address, setAddress] = React.useState('')
  const [status, setStatus] = React.useState('')
  const handleStatusOnchange = (event) => {
    setStatus(event.target.value);
  };
  React.useEffect(() => {
    async function getSchedules () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      };
      const res = await fetch(url + '/admin/inspections/' + inspectionId, options);
      const data = await res.json();
      if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else {
        if (res.status === 200) {
          console.log('success');
          console.log(data.inspection);
          setAddress(data.inspection.address);
          setInspectDate(new Date(data.inspection.inspection_date));
          setStatus(data.inspection.status);
          today = inspectDate.toISOString().split('T')[0]
          setFromTime(new Date(today + 'T' + data.inspection.from_time));
          setToTime(new Date(today + 'T' + data.inspection.to_time));
          sessionStorage.setItem('token', data.token);
          getNotifications();
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
      // setLoading(false);
    }
    getSchedules();
  }, []);

  // const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState([]);
  // const [allRead, setAllRead] = React.useState(true);

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
            Schedule Inspection
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
        <div className={'AddressName'} >
            <div className="Address">
                <span className="Address">Address:</span>
                <span className="AddressName">{address}</span>
            </div>
        <Typography component="h1" variant="h5" className={classes.choose}>
         Choose the date you want to schedule
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} className={classes.time}>
          <Stack spacing={3}>
            <StaticDatePicker
              value={inspectDate}
              onChange={setInspectDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </LocalizationProvider>
        <Typography component="h1" variant="h5" className={classes.choose}>
         Choose the time you want to start
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} className={classes.time}>
          <Stack spacing={3}>
            <TimePicker
              value={fromTime}
              onChange={setFromTime}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </LocalizationProvider>
        <Typography component="h1" variant="h5" className={classes.choose}>
         Choose the time you want to end
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} className={classes.time}>
          <Stack spacing={3}>
            <TimePicker
              value={toTime}
              onChange={setToTime}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </LocalizationProvider>
        <FormControl sx={{ m: 1, minWidth: 80, align: 'right' }}>
          <InputLabel id="select-status">Status</InputLabel>
          <Select
            labelId="select-status"
            id="demo-simple-select-autowidth"
            value={status}
            onChange={handleStatusOnchange}
            autoWidth
            label="Status"
          >
            <MenuItem value={status}>
            </MenuItem>
            <MenuItem value={'scheduled'}>Scheduled</MenuItem>
            <MenuItem value={'rescheduled'}>Rescheduled</MenuItem>
            <MenuItem value={'canceled'}>Canceled</MenuItem>
            <MenuItem value={'complete'}>Complete</MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          id="submitButton"
          className={classes.Submitbutton}
          // href='/manager/home'
          onClick={(event) => { event.preventDefault(); updateSingleInspection(inspectDate, fromTime, toTime, status, inspectionId); }}
        >
          Submit
        </Button>
        <Button
          type="button"
          variant="contained"
          color="primary"
          id="cancelButton"
          className={classes.Cancelbutton}
          href='/manager/home'
        >
          Cancel
        </Button>
        </div>
          <Box pt={4}>
          </Box>
        </Container>
      </main>
    </div>
  );
}

// Make api request of saving new contact info
async function updateSingleInspection (inspectionDate, fromTime, toTime, status, inspectionId) {
  inspectionDate = inspectionDate.toISOString().split('T')[0];
  fromTime = ('0' + fromTime.getHours()).slice(-2) + ':' + ('0' + fromTime.getMinutes()).slice(-2);
  toTime = ('0' + toTime.getHours()).slice(-2) + ':' + ('0' + toTime.getMinutes()).slice(-2);
  console.log(inspectionDate);
  console.log(fromTime);
  console.log(toTime);
  console.log(status);
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      inspection_date: inspectionDate,
      from_time: fromTime,
      to_time: toTime,
      status: status,
    }),
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/inspections/' + inspectionId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200 || res.status === 201) {
    console.log('Single inspection is updated');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/itineraries';
  } else if (res.status === 400 || res.status === 403) {
    console.log('Fail to update single inspection');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
    // window.location = '/Login';
  } else {
    console.log('Fail to update single inspection');
    alert(data.error);
  }
  sessionStorage.setItem('token', data.token);
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
