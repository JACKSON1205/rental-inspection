import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import AssignmentIndOutlinedIcon from '@material-ui/icons/AssignmentIndOutlined';
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
  rolesSelection: {
    left: '18%'
  },
}));

export default function RegisterScreen2 () {
  const classes = useStyles();
  const [mgrEmail, setMgrEmail] = React.useState('');

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <AssignmentIndOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Connect to your Property Manager
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Manager Email Address"
            name="email"
            autoFocus
            value={mgrEmail}
            onChange={event => setMgrEmail(event.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            id="signUpButton"
            // onClick={(event) => { event.preventDefault(); authRegister(email, password, name); }}
            onClick={(event) => { event.preventDefault(); authRegister2(mgrEmail); }}
          >
            Sign Up
          </Button>
          <Grid container>
            <Grid item xs>
            </Grid>
            <Grid item>
              <Link to="/" variant="body2">
                {'Already have an account? Sign In'}
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
// Backend Port is 5005
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

async function authRegister2 (mgrEmail) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      mgrEmail: mgrEmail,
      token: sessionStorage.getItem('token'),
    }),
  };
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/register/mgr_select', options);
  const data = await res.json();

  console.log(data);
  if (res.status === 401) {
    console.log('unauthorized: redirecting to login');
    console.log(data.error)
    alert(res.status + ': ' + data.message);
    window.location = '/';
  } else {
    if (res.status === 200) {
      console.log('sign up success');
      window.location = '/';
    } else if (res.status === 500) {
      console.log(data.error);
      alert(res.status + ': Internal Error');
    } else {
      console.log('sign up fail');
      console.log(data.error);
      alert(res.status + ': ' + data.error);
    }
    sessionStorage.setItem('token', data.token);
  }
}
