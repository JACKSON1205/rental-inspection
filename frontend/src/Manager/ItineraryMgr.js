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
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import { mainListItems, mainListItemsUnreadNotification } from './Mgr_ListItems';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Card from '@mui/material/Card';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
    padding: theme.spacing(4),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  textContent: {
    flexDirection: 'row',
  },
  fixedHeight: {
    height: 250,
  },
  fixedwidth: {
    minWidth: 900,
  },
  schdSingleInspectionButton: {
    float: 'right',
  },
  addRemoveButton: {
    left: '60%',
    marginLeft: 'auto',
  },
  UpdateButton: {
    left: '50%',
    margin: '5px',
  },
  RemoveButton: {
    left: '62%',
    margin: '5px',
  },
  mgrid: {
    marginLeft: '50px',
  },
  itid: {
    marginTop: '10px',
    marginLeft: '50px',
  },
  date: {
    marginLeft: '50px',
  },
  mgricon: {
    margin: '-5px',
  },
  dateicon: {
    margin: '-5px',
  },
  planicon: {
    margin: '-5px',
  },
  AddressContext: {
    margin: '0px',
  },
}));

const toUpdateSingInspectionPage = (inspectionId) => {
  window.location = '/manager/inspections/update_single/' + inspectionId;
}

// fetch to particular multi inspection page
const toUpdateMultiInspectionPage = async (itineraryId) => {
  async function getPropertiesForManager (itineraryId) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    }
    // Get data using fetch
    const PORT = require('../config.json').BACKEND_PORT;
    const url = 'http://localhost:' + PORT;
    const res = await fetch(url + `/admin/itineraries/${itineraryId}`, options);
    const data = await res.json();
    console.log(data);
    if (res.status === 401) {
      console.log('unauthorized; redirecting');
      alert(res.status + ': ' + data.error);
      window.location = '/Login';
    } else {
      if (res.status === 200) {
        console.log('successfully pulled properties');
        console.log('token: ' + data.token);
      } else {
        console.log('fail');
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
      sessionStorage.setItem('token', data.token);
    }

    const propertyData = []
    for (const p of data.property_list) {
      propertyData.push({
        value: p.property_id,
        coords: [p.map_long, p.map_lat],
        name: p.tenant_first_name + ' ' + p.tenant_last_name,
        label: p.address,
      })
    }
    sessionStorage.setItem('propertyData', JSON.stringify((propertyData)));
    sessionStorage.setItem('start_time', data.start_time);
    sessionStorage.setItem('end_time', data.end_time);
    sessionStorage.setItem('inspectionTime', data.inspection_time);
    return propertyData;
  }
  await getPropertiesForManager(itineraryId);
  sessionStorage.setItem('itineraryID', itineraryId);
  window.location = '/manager/inspections/update_multi/' + itineraryId;
}

export default function ItineraryPage () {
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
  const [schedules, setSchedules] = React.useState([]);
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
        getSchedules();
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
    async function getSchedules () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/itineraries', options);
      const data = await res.json();
      console.log(data);
      if (res.status === 200) {
        sessionStorage.setItem('token', data.token);
        setSchedules(data.itinerary_list);
        console.log(data.itinerary_list);
        console.log(schedules);
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
            Inspections
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
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            id="mgrScheduleSingleInspectionButton"
            className={classes.schdSingleInspectionButton}
            onClick={(event) => toScheduleMulti()}
          >
            Schedule Multiple Inspections
          </Button>
          <GetAllItinerariesInfo loading={loading} schedules={schedules} />
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

async function toScheduleMulti () {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      leased: true,
    }),
  }
  // Get data using fetch
  const PORT = require('../config.json').BACKEND_PORT;
  const url = 'http://localhost:' + PORT;
  const res = await fetch(url + '/admin/properties', options);
  const data = await res.json();
  console.log(data);
  if (res.status === 401) {
    console.log('unauthorized; redirecting');
    alert(res.status + ': ' + data.error);
    window.location = '/Login';
  } else {
    if (res.status === 200) {
      console.log('successfully pulled properties');
      console.log('token: ' + data.token);
    } else {
      console.log('fail');
      console.log(data.error);
      alert(res.status + ': ' + data.error);
    }
    sessionStorage.setItem('token', data.token);
  }

  const propertyData = []
  for (const p of data.property_list) {
    propertyData.push({
      value: p.property_id,
      coords: [p.map_long, p.map_lat],
      name: p.tenant_first_name + ' ' + p.tenant_last_name,
      label: p.address,
    })
  }
  console.log(propertyData);
  sessionStorage.setItem('propertyData', JSON.stringify((propertyData)));
  window.location = '/manager/itineraries/schd_multi';
}

function GetAllItinerariesInfo (props) {
  const loading = props.loading;
  const schedules = props.schedules;
  if (loading) {
    return (
      <div>
        No Schedules Yet
      </div>
    )
  } else {
    return (
      <Grid container spacing={3}>
        {
          // looping to generate and display each itinerary according to inspection_id
          schedules.map(schedule => (
            <ScheduleDetail schedule={schedule} key={schedule.inspection_id} />
          ))
        }
      </Grid>
    )
  }
}

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));
function ScheduleDetail (props) {
  const [expanded, setExpanded] = React.useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const schedule = props.schedule;
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight, classes.fixedwidth);
  console.log(schedule);
  if (schedule.itinerary_ty === 1) {
    return (
      <Grid item xs={9}>
        <Paper className={fixedHeightPaper}>
          <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
          Address: {schedule.address}
          </Typography>
          <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
          Inspection Date: {schedule.date}
          </Typography>
          <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
          From Time: {schedule.from_time}
          </Typography>
          <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
          To Time: {schedule.to_time}
          </Typography>
          <Typography component="body2" variant="h6" color="inherit" align="left" noWrap className={classes.smallContext}>
          Status: {schedule.status.split('.')[1]}
          </Typography>
          <CardActions disableSpacing>
            <Button
              variant="contained"
              color="primary"
              id="mgrUpdateInspectionButton"
              className={classes.UpdateButton}
              onClick={(event) => { event.preventDefault(); toUpdateSingInspectionPage(schedule.inspection_id); }}
            >
              Update Inspection.
            </Button>
            <Button
              variant="contained"
              color="secondary"
              id="mgrRemoveContactInfoButton"
              className={classes.RemoveButton}
              onClick={(event) => { event.preventDefault(); deleteSingleInspection(schedule.inspection_id); }}
              href='/manager/single_inspection'
            >
              Remove
            </Button>
          </CardActions>
        </Paper>
      </Grid>
    );
  } else {
    return (
      <Grid item xs={9}>
        <Card sx={{ maxWidth: 1200, minWidth: 900 }}>
          <Typography paragraph variant="h6" className={classes.itid}>
            <AltRouteIcon className={classes.planicon} /> Itinerary {schedule.itinerary_id}
          </Typography>
          <Typography variant="h6" paragraph className={classes.date}>
            <AccessTimeFilledIcon className={classes.dateicon} /> Date: {schedule.date}
          </Typography>
          <CardActions disableSpacing>
          <Button
            variant="contained"
            color="primary"
            id="UpdateButton"
            className={classes.UpdateButton}
            onClick={(event) => { event.preventDefault(); toUpdateMultiInspectionPage(schedule.itinerary_id); }}
          >
            Update Itinerary
          </Button>
          <Button
            variant="contained"
            color="secondary"
            id="mgrRemoveContactInfoButton"
            className={classes.RemoveButton}
            onClick={(event) => { event.preventDefault(); deleteMultipleInspections(schedule.itinerary_id); }}
            href='/manager/single_inspection'
          >
            Remove
          </Button>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
            <ListMultiInspection inspections={schedule.inspections}/>
            </CardContent>
          </Collapse>
        </Card>
      </Grid>
    );
  }
}

ListMultiInspection.propTypes = {
  inspections: PropTypes.object.isRequired,
}
function ListMultiInspection (props) {
  const inspections = props.inspections;

  console.log(inspections);

  return (
    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell align="center"><b>Address</b></TableCell>
          <TableCell align="center"><b>Inspection Date</b></TableCell>
          <TableCell align="center"><b>From Time</b></TableCell>
          <TableCell align="center"><b>To Time</b></TableCell>
          <TableCell align="center"><b>Status</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {inspections.map((insp) => (
          <TableRow
            key={insp.address}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell align="center">{insp.address}</TableCell>
            <TableCell align="center">{insp.inspection_date}</TableCell>
            <TableCell align="center">{insp.from_time}</TableCell>
            <TableCell align="center">{insp.to_time}</TableCell>
            <TableCell align="center">{insp.status.split('.')[1]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Make api request of deleting contact info
async function deleteSingleInspection (inspectionId) {
  const options = {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/inspections/' + inspectionId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('Delete inspection success');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/itineraries';
  } else if (res.status === 400 || res.status === 403) {
    console.log('Delete inspection fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  } else {
    console.log(data.error);
    alert('Delete inspection fail');
  }
  sessionStorage.setItem('token', data.token);
}

// Make api request of deleting contact info
async function deleteMultipleInspections (itineraryId) {
  const options = {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/itineraries/' + itineraryId, options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('Delete inspection success');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/itineraries';
  } else if (res.status === 400 || res.status === 403) {
    console.log('Delete inspection fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  } else {
    console.log(data.error);
    alert('Delete inspection fail');
  }
  sessionStorage.setItem('token', data.token);
}

ScheduleDetail.propTypes = {
  schedule: PropTypes.object.isRequired,
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
