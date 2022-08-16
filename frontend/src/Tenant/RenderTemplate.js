import React, { useState } from 'react';
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
import { FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { mainListItems, mainListItemsUnreadNotification } from '../Tenant/Tenant_ListItems';
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

const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

export default function RenderTemplateTenant (props) {
  const account = () => { window.location = '/tenant/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const comps = JSON.parse(sessionStorage.getItem('selectedComponents')).components;
  const [components, setComponents] = useState(comps);

  class Title extends React.PureComponent {
    constructor (props) {
      super(props);
      this.title = props.title;
      this.my_index = props.index;
    }

    render () {
      return (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Typography component="body2" fullWidth variant="h6" color="inherit" align="center" noWrap className={classes.smallContext}>
            {this.title}
          </Typography>
        </Grid>
      );
    }
  }

  class SubTitle extends React.PureComponent {
    constructor (props) {
      super(props);
      this.subtitle = props.subtitle;
      this.my_index = props.index;
    }

    render () {
      return (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Typography component="body2" fullWidth variant="h6" color="inherit" align="center" noWrap className={classes.smallContext}>
            {this.subtitle}
          </Typography>
        </Grid>
      );
    }
  }

  class Paragraph extends React.PureComponent {
    constructor (props) {
      super(props);
      this.text = props.text;
      this.my_index = props.index;
    }

    render () {
      return (
        <div>
          <Grid container direction={'column'} spacing={5}>
            <Grid item xs={12}/>
            <Grid item xs={12}>
              <Typography component="body2" fullWidth variant="body2" color="inherit" align="center" noWrap className={classes.smallContext}>
                {this.text}
              </Typography>
            </Grid>
            <Grid item xs={12}/>
          </Grid>
        </div>
      );
    }
  }

  class Submission extends React.PureComponent {
    render () {
      return (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          id="submitButton"
          onClick={(event) => { tenantSubmit() }}
        >
          Submit
        </Button>
      );
    }
  }

  class RoomEvaluation extends React.PureComponent {
    constructor (props) {
      super(props);
      this.room = props.room;
      this.my_index = props.index;
    }

    onSelectionChange (value) {
      const dummyComponents = components;
      dummyComponents[this.my_index].value.props.selection = value;
      setComponents(dummyComponents);
    }

    onCommentChange (comment) {
      const dummyComponents = components;
      dummyComponents[this.my_index].value.props.comment = comment;
      setComponents(dummyComponents);
    }

    render () {
      return (
        <div>
          <Grid container style={{ textAlign: 'left' }}>
            <Grid item xs={1} align="right">
              <Typography variant="subtitle1">
                {this.room}
              </Typography>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                </FormLabel>
                <RadioGroup
                  aria-label="gender"
                  name="radio-buttons-group"
                  row
                  onChange={(event) => this.onSelectionChange(event.target.value)}
                >
                  <FormControlLabel
                    value="excellent"
                    control={<Radio/>}
                    label={
                      <Typography variant="subtitle2">
                        Excellent
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="good"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2">
                        Good
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="poor"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2">
                        Poor
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="bad"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2">
                        Bad
                      </Typography>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                className={classes.textField}
                variant="outlined"
                label="Comments"
                fullWidth
                defaultValue={''}
                onChange={(event) => this.onCommentChange(event.target.value)}
              />
            </Grid>
          </Grid>
          <Grid container direction={'column'} spacing={2}>
          </Grid>
        </div>
      );
    }
  }

  Title.propTypes = {
    title: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  }

  SubTitle.propTypes = {
    subtitle: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  }

  Paragraph.propTypes = {
    text: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  }

  RoomEvaluation.propTypes = {
    room: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  }

  async function tenantSubmit () {
    console.log(components);
    for (const comp of components) {
      if (comp.value.type === 'RoomEvaluation') {
        if (!(comp.value.props.selection)) {
          alert(`Please make a selection for each field. You stil need to fill out ${comp.label}`);
          return;
        }
      }
    }
    const options = {
      method: 'PATCH',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      body: JSON.stringify({
        artifact_type: 'report_due',
        artifact_json: JSON.stringify({ components: components }),
      }),
    }
    const res = await fetch(url + '/admin/reports/due/' + sessionStorage.getItem('reportArtifactID'), options);
    const data = await res.json();

    if (res.status === 401) {
      console.log('fail');
      console.log(data.error);
      alert(res.status + ': ' + data.error);
      window.location = '/Login';
    } else {
      if ((res.status === 200) || (res.status === 201)) {
        console.log('success');
        console.log('token: ' + data.token);
        window.location = '/tenant/home';
      } else {
        console.log('fail');
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
      sessionStorage.setItem('token', data.token);
    }
  }

  const classes = useStyles();
  // const fixedHeightPaper = clsx(classes.paper);//, classes.fixedHeight);
  const [Open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

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
          <Grid container direction={'column'} spacing={1}>
            {
              components.map((comp, index) => {
                switch (comp.value.type) {
                  case 'Title': // Tentant Fie
                    return <Title {...comp.value.props} focus={focus} index={index}/>;
                  case 'SubTitle':
                    return <SubTitle {...comp.value.props} focus={focus} index={index}/>;
                  case 'Paragraph': // Paragraph
                    return <Paragraph {...comp.value.props} focus={focus} index={index}/>;
                  case 'RoomEvaluation':
                    return <RoomEvaluation {...comp.value.props} index={index}/>;
                  default:
                    return <Typography>
                      Nothing!
                    </Typography>
                }
              })
            }
            <Submission {...components[0].value.props}/>
          </Grid>
        </Container>
      </main>
    </div>
  )
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
