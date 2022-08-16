import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function LoginForm () {
  const classes = useStyles();
  // Store data by useState
  // email and password is initialized as empty string
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={event => { console.log('email: ' + email); setEmail(event.target.value); }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={event => { console.log('password: ' + password); setPassword(event.target.value); }}
          />
          <Grid container>
            <Grid item xs>
            </Grid>
            <Grid item>
              <Link to="/reset" variant="body2">
                {'Forgot Password'}
              </Link>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            id="tenantLoginButton"
            className={classes.submit}
            onClick={(event) => { event.preventDefault(); authLoginAsTenant(email, password); }}
          >
            Login As Tenant
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            id="ownerLoginButton"
            className={classes.submit}
            onClick={(event) => { event.preventDefault(); authLoginAsOwner(email, password); }}
          >
            Login As Owner
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            id="managerLoginButton"
            className={classes.submit}
            onClick={(event) => { event.preventDefault(); authLoginAsManager(email, password); }}
          >
            Login As Manager
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            id="managerLoginButton"
            className={classes.submit}
            href='/'
          >
            Cancel
          </Button>
          <Grid container>
            <Grid item>
              <Link to="/auth/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
      </Box>
    </Container>
  );
}

// Backend url
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;
// Make api request of login as tenant
async function authLoginAsTenant (email, password) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      role: 'tenant',
    }),
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/login', options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('login success');
    console.log('token: ' + data.token);
    sessionStorage.setItem('token', data.token);
    window.location = '/tenant/home';
  } else {
    console.log('login fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
    window.location = '/Login';
  }
}

// Make api request of login as owner
async function authLoginAsOwner (email, password) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'Application/json',
      'Content-Type': 'Application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      role: 'owner',
    }),
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/login', options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('login success');
    console.log('token: ' + data.token);
    sessionStorage.setItem('token', data.token);
    window.location = '/owner/home';
  } else {
    console.log('login fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
    window.location = '/Login';
  }
}

// Make api request of login as manager
async function authLoginAsManager (email, password) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      role: 'manager',
    }),
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/login', options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('login success');
    sessionStorage.setItem('token', data.token);
    window.location = '/manager/home';
  } else if (res.status === 401) {
    console.log('unauthorized');
    console.log(data.error)
    sessionStorage.removeItem('token');
    alert(res.status + ': ' + data.message);
    window.location = '/Login';
  } else if (res.status === 500) {
    console.log(data.error);
    alert(res.status + ': Internal Error');
  } else {
    console.log('log in fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  }
}
