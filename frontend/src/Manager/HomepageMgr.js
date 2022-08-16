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
import { mainListItems, mainListItemsUnreadNotification } from '../Manager/Mgr_ListItems';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Grid } from '@material-ui/core';
import { svg, VictoryPie, VictoryLabel, VictoryChart, VictoryGroup, VictoryBar } from 'victory';
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
}));

export default function Home () {
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

  const [numberOfClients, setnumberOfClients] = React.useState(0);
  const [numberOfOwnerClients, setnumberOfOwnerClients] = React.useState(0);
  const [numberOfTenantClients, setnumberOfTenantClients] = React.useState(0);
  const [numLeasedProperties, setnumLeasedProperties] = React.useState(0);
  const [numUnleasedProperties, setnumUnleasedProperties] = React.useState(0);
  const [postCodeStats, setpostCodeStats] = React.useState({});
  const [numUpcomingLeaseExpirations, setnumUpcomingLeaseExpirations] = React.useState(0);
  const [numUpcomingInspections, setnumUpcomingInspections] = React.useState(0);
  const [numPendingReportsDue, setnumPendingReportsDue] = React.useState(0);
  const [numProperties, setNumProperties] = React.useState(0);

  console.log(postCodeStats);

  React.useEffect(() => {
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
      authHomePage();
    }
    async function authHomePage () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      };

      const res = await fetch(url + '/admin/manager/home', options);
      const data = await res.json();
      console.log(data);
      if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else {
        if (res.status === 200) {
          console.log('success');
          console.log(data.post_code_stats);
          sessionStorage.setItem('token', data.token);
          setnumberOfClients(data.number_of_clients);
          setnumberOfOwnerClients(data.number_of_owner_clients);
          setnumberOfTenantClients(data.number_of_tenant_clients);
          setnumLeasedProperties(data.num_leased_properties);
          setnumUnleasedProperties(data.num_unleased_properties);
          setpostCodeStats(data.post_code_stats);
          setnumUpcomingLeaseExpirations(data.num_upcoming_lease_expirations);
          setnumUpcomingInspections(data.num_upcoming_inspections);
          setnumPendingReportsDue(data.num_pending_reports_due);
          setNumProperties(data.num_leased_properties + data.num_unleased_properties);
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
    getNotifications();
  }, []);

  // const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState([]);
  // const [allRead, setAllRead] = React.useState(true);
  console.log(Object.entries(postCodeStats).map((code) => codeDict(code)));

  function codeDict (code) {
    return { x: String(code[0]), y: code[1] };
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, Open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, Open && classes.menuButtonHidden)}
          >
            {/* <MenuIcon /> */}
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Manager Homepage
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
          <Box pt={4}>
            <Grid container spacing={2} align="center">
              <Grid item xs={4}>
                <Typography component="p1" body="p1">
                  Clients Breakdown
                </Typography>
                {
                  numberOfClients !== 0
                    ? <VictoryChart>
                        <VictoryGroup offset={20}
                          colorScale={'qualitative'}
                        >
                          <VictoryBar
                            data={[{ x: 'Total Clients', y: numberOfClients }]}
                          />
                          <VictoryBar
                            data={[{ x: 'Tenant Clients', y: numberOfTenantClients }]}
                          />
                          <VictoryBar
                            data={[{ x: 'Owner Clients', y: numberOfOwnerClients }]}
                          />
                        </VictoryGroup>
                      </VictoryChart>
                    : <Typography components="body" variant="body">
                        <br/>
                        <br/>
                        You currently have no clients.
                      </Typography>
                }
              </Grid>
              <Grid item xs={4}>
                <Typography component="p1" body="p1">
                  Proportion of Leased Properties
                </Typography>
                <svg viewBox="0 0 400 400" width="80%" height="80%">
                  <VictoryPie
                    standalone={false}
                    startAngle={
                      numProperties !== 0
                        ? -1 * (numLeasedProperties / numProperties) * 180
                        : 0
                    }
                    endAngle={
                      numProperties !== 0
                        ? 360 - (numLeasedProperties / numProperties) * 180
                        : 360
                    }
                    width={400} height={400}
                    data={[
                      { x: 1, y: numLeasedProperties },
                      { x: 2, y: numUnleasedProperties },
                    ]}
                    innerRadius={120}
                    cornerRadius={25}
                    style={{
                      data: {
                        fill: ({ datum }) => {
                          const proportion = numProperties ? 100 * numLeasedProperties / numProperties : 0;
                          console.log(datum);
                          console.log(datum.x === 1);
                          if (datum.x === 1) {
                            return proportion > 70 ? 'green' : (proportion > 40 ? 'orange' : 'red');
                          }
                          return 'transparent';
                        }
                      },
                      labels: { fill: 'white' }
                    }}
                  />
                  <VictoryLabel
                    textAnchor="middle" verticalAnchor="middle"
                    x={200} y={200}
                    text={`${numProperties !== 0 ? (100 * numLeasedProperties / numProperties).toFixed(0) : 0}%`}
                    style={{ fontSize: 45 }}
                />
                </svg>
              </Grid>
              <Grid item xs={4}>
                <Typography component="p1" body="p1">
                  Distribution of Post-codes of Properties You Manage
                </Typography>
                {
                  numProperties !== 0
                    ? <svg viewBox="0 0 400 400" width="80%" height="80%">
                        <VictoryPie
                          standalone={false}
                          width={400} height={400}
                          data={Object.entries(postCodeStats).map((code, proportion) => codeDict(code, proportion))}
                          colorScale={['tomato', 'orange', 'navy', 'gold', 'cyan', 'green', 'gray']}
                          categories={{ x: Object.entries(postCodeStats).map((code) => { return code[0] }) }}
                          style={{ labels: { fontSize: 20, fill: 'white' } }}
                          labelRadius={100}
                        />
                      </svg>
                    : <Typography components="body" variant="body">
                        <br/>
                        <br/>
                        You currently do not manage any properties.
                      </Typography>
                }
              </Grid>
              <Grid item xs={4}>
                <Typography components="h1" variant="h1">
                  {numUpcomingLeaseExpirations}
                </Typography>
                <Typography components="body" variant="body">
                  lease expirations within the next month
                </Typography>
              </Grid>
              <Grid item xs={4}>
              <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"/>
                <Typography components="h1" variant="h1">
                  {numPendingReportsDue}
                </Typography>
                <Typography components="body" variant="body">
                  pending due reports from clients
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"/>
                <Typography components="h1" variant="h1">
                  {numUpcomingInspections}
                </Typography>
                <Typography components="body" variant="body">
                  upcoming inspections within the next week
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </main>
    </div>
  );
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
