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
import { FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { mainListItems, mainListItemsUnreadNotification } from '../Manager/Mgr_ListItems';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ReactToPdf from 'react-to-pdf';
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
  generate: {
    margin: theme.spacing(3, 0, 2),
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
}));

export default function RenderTemplate (props) {
  const account = () => { window.location = '/manager/account'; }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const comps = JSON.parse(sessionStorage.getItem('selectedComponents')) || [];
  const readOnly = JSON.parse(sessionStorage.getItem('readOnly'));
  console.log(readOnly);
  let i = 0;
  let defaultEmail = 'Tenant Email';
  let defaultTenantName = 'Tenant Name';
  let defaultDescription = 'Description';
  for (const comp of comps) {
    try {
      comp.value = JSON.parse(comp.value);
    } catch (err) {

    } finally {
      comp.value.props.key = i;
      i++;
      if (comp.value.type === 'SubTitle') {
        defaultEmail = comp.value.props.subtitle;
      } else if (comp.value.type === 'Title') {
        defaultTenantName = comp.value.props.title;
      } else if (comp.value.type === 'Paragraph') {
        defaultDescription = comp.value.props.text;
      }
    }
  }

  const [tenantName, setTenantName] = React.useState();
  const [email, setEmail] = React.useState();
  const [description, setDescription] = React.useState();
  const [components, setComponents] = React.useState(comps);

  const pdfRef = React.createRef();

  console.log(components);

  const [focus, setFocus] = React.useState(0);

  class Title extends React.PureComponent {
    constructor (props) {
      super(props);
      this.focus = props.focus;
      this.my_index = props.index;
      this.title = props.title;
      this.onNameChange = this.onNameChange.bind(this);
    }

    onNameChange = (name) => {
      setTenantName(name);
      const dummyComponents = components;
      dummyComponents[this.my_index].value.props.title = name;
      setComponents(dummyComponents);
      console.log(components);
      setFocus(this.my_index);
    }

    render () {
      if (readOnly) {
        console.log('Here ');
        console.log(typeof readOnly);
        return (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography component="body2" fullWidth variant="h6" color="inherit" align="center" noWrap className={classes.smallContext}>
              {this.title}
            </Typography>
          </Grid>
        )
      }
      return (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <TextField
          variant="outlined"
          margin="normal"
          required
          id="tenant name"
          label="Tenant Name"
          name="title"
          autoFocus={this.my_index === this.focus}
          value={typeof tenantName === 'undefined' ? this.title : tenantName }
          className={classes.smallContext}
          onChange={event => { this.onNameChange(event.target.value); }}
        />
        </Grid>
      );
    }
  }

  class SubTitle extends React.PureComponent {
    constructor (props) {
      super(props);
      this.focus = props.focus;
      this.my_index = props.index;
      this.subtitle = props.subtitle;
      this.onEmailChange = this.onEmailChange.bind(this);
    }

    onEmailChange = (email) => {
      setEmail(email);
      const dummyComponents = components;
      dummyComponents[this.my_index].value.props.subtitle = email;
      setComponents(dummyComponents);
      console.log(components);
      setFocus(this.my_index);
    }

    render () {
      if (readOnly) {
        return (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography component="body2" fullWidth variant="h6" color="inherit" align="center" noWrap className={classes.smallContext}>
              {this.subtitle}
            </Typography>
          </Grid>
        );
      }
      return (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <TextField
          variant="outlined"
          margin="normal"
          required
          id="tenant email"
          label="Tenant Email"
          name="email"
          autoFocus={this.my_index === this.focus}
          value={typeof email === 'undefined' ? this.subtitle : email }
          className={classes.smallContext}
          onChange={event => { this.onEmailChange(event.target.value); }}
        />
        </Grid>
      );
    }
  }

  class Paragraph extends React.PureComponent {
    constructor (props) {
      super(props);
      this.focus = props.focus;
      this.my_index = props.index;
      this.description = props.text;
      this.onDescriptionChange = this.onDescriptionChange.bind(this);
    }

    onDescriptionChange = (descr) => {
      setDescription(descr);
      const dummyComponents = components;
      dummyComponents[this.my_index].value.props.text = descr;
      setComponents(dummyComponents);
      console.log(components);
      setFocus(this.my_index);
    }

    render () {
      if (readOnly) {
        return (
          <div>
            <Grid container direction={'column'} spacing={5}>
              <Grid item xs={12}/>
              <Grid item xs={12}>
                <Typography component="body2" fullWidth variant="body2" color="inherit" align="center" noWrap className={classes.smallContext}>
                  {this.description}
                </Typography>
              </Grid>
              <Grid item xs={12}/>
            </Grid>
          </div>
        );
      }
      return (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="description"
          label="Description"
          name="description"
          autoFocus={this.my_index === this.focus}
          value={typeof description === 'undefined' ? this.description : description }
          className={classes.smallContext}
          onChange={event => { this.onDescriptionChange(event.target.value); }}
        />
        </Grid>
      );
    }
  }

  class Submission extends React.PureComponent {
    constructor (props) {
      super(props);
      this.my_index = props.index;
    }

    onPress () {
      console.log(components);
      mgrSubmit(components);
    }

    render () {
      if (readOnly) {
        return null;
      }
      return (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          id="submitButton"
          onClick={(event) => { this.onPress() }}
        >
          Submit
        </Button>
      );
    }
  }

  class GeneratePDF extends React.PureComponent {
    constructor (props) {
      super(props);
      this.my_index = props.index;
    }

    render () {
      let filename;
      if (readOnly) {
        filename = 'self_inspection_report_filled.pdf';
      } else {
        filename = 'self_inspection_report_draft.pdf';
      }
      const scale = components.length <= 8 ? 0.8 : 0.8 - (components.length - 8) / 70;
      return (
        <ReactToPdf
          targetRef={pdfRef}
          filename={filename}
          options={{
            orientation: 'portrait',
            paperSize: 'A4',
            unit: 'mm',
          }}
          x={scale / 2}
          y={scale / 2}
          scale={scale}
        >
          {({ toPdf }) => (
            <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={toPdf}
            className={classes.generate}
            fullWidth
            >
              Generate pdf
            </Button>
          )}
        </ReactToPdf>
      );
    }
  }

  class RoomEvaluation extends React.PureComponent {
    constructor (props) {
      super(props);
      this.my_index = props.index;
      this.room = props.room;
      this.selection = props.selection;
      this.comment = props.comment;
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
              <FormControl component="fieldset" disabled>
                <FormLabel component="legend" disabled>
                </FormLabel>
                <RadioGroup
                  aria-label="gender"
                  name="radio-buttons-group"
                  row
                  defaultValue={this.selection}
                  disabled
                >
                  <FormControlLabel
                    value="excellent"
                    control={<Radio/>}
                    label={
                      <Typography variant="subtitle2">
                        Excellent
                      </Typography>
                    }
                    disabled
                  />
                  <FormControlLabel
                    value="good"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2">
                        Good
                      </Typography>
                    }
                    disabled
                  />
                  <FormControlLabel
                    value="poor"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2">
                        Poor
                      </Typography>
                    }
                    disabled
                  />
                  <FormControlLabel
                    value="bad"
                    control={<Radio />}
                    label={
                      <Typography variant="subtitle2">
                        Bad
                      </Typography>
                    }
                    disabled
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
                defaultValue={this.comment ? this.comment : ''}
                disabled
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
    focus: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
  }

  SubTitle.propTypes = {
    subtitle: PropTypes.string.isRequired,
    focus: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
  }

  Paragraph.propTypes = {
    text: PropTypes.string.isRequired,
    focus: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
  }

  Submission.propTypes = {
    index: PropTypes.number.isRequired,
  }

  GeneratePDF.propTypes = {
    index: PropTypes.number.isRequired,
  }

  RoomEvaluation.propTypes = {
    room: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    selection: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
  }

  async function mgrSubmit (components) {
    const PORT = require('../config.json').BACKEND_PORT; // 5005
    const url = 'http://localhost:' + PORT; // https://localhost:5005/
    console.log('Sending customised template to db');
    for (const comp of components) {
      console.log(comp.value.props);
    }
    console.log(tenantName);
    console.log(defaultEmail);
    console.log(email);
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      body: JSON.stringify({
        email: email === 'undefined' ? defaultEmail : email,
        template_json: JSON.stringify({ components: components }),
        title: typeof tenantName === 'undefined' ? defaultTenantName : tenantName,
        description: typeof description === 'undefined' ? defaultDescription : description,
        parent_template: sessionStorage.getItem('parentTemplate'),
      })
    }
    const res = await fetch(url + '/admin/templates', options);
    const data = await res.json();
    if (res.status === 401) {
      console.log('fail');
      console.log(data.error);
      alert(res.status + ': ' + data.error);
      window.location = '/Login';
    } else {
      if (!((res.status === 200) || (res.status === 201))) {
        console.log('fail');
        console.log(data.error);
        // alert(res.status + ': ' + data.error);
      }
    }
    const token = data.token;

    const options2 = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        artifact_type: 'report_due',
        email: typeof email === 'undefined' ? defaultEmail : email,
        artifact_json: JSON.stringify({ components: components }),
      }),
    }
    const res2 = await fetch(url + '/admin/tenant/artifacts', options2);
    const data2 = await res2.json();

    if (res2.status === 401) {
      console.log('fail');
      console.log(data2.error);
      alert(res2.status + ': ' + data2.error);
      window.location = '/Login';
    } else {
      if ((res2.status === 200) || (res2.status === 201)) {
        console.log('success');
        console.log('token: ' + data2.token);
        window.location = '/manager/home';
      } else {
        console.log('fail');
        console.log(data2.error);
        alert(res2.status + ': ' + data2.error);
      }
      sessionStorage.setItem('token', data2.token);
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
        <div className={classes.appBarSpacer}/>
        <Container maxWidth="lg" className={classes.container}>
          <Grid container direction={'column'} spacing={1} ref={pdfRef}>
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
            <Grid container spacing={2} direction="rows">
              <Grid item xs={6}>
                <Submission {...components[0].value.props}/>
              </Grid>
              <Grid item xs={6}>
                <GeneratePDF index={components.length + 1}/>
              </Grid>
            </Grid>
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
