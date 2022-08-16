import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
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

export default function RegisterScreen () {
  const classes = useStyles();
  const [email, setEmail] = React.useState('');
  // const [roles, setRoles] = React.useState(['0', '0', '0']);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <AssignmentIndOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset password
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
            autoFocus
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            id="submitButton"
            onClick={(event) => { event.preventDefault(); toGetUserId(email); }}
          >
            NEXT
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            className={classes.submit}
            id="cancelButton"
            href='/'
          // onClick={(event) => { event.preventDefault(); authRegister(email); }}
          >
            CANCEL
          </Button>

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

async function toGetUserId (email) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
    }),
  };
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/reset', options);
  const data = await res.json();

  console.log(data);
  if (res.status === 200) {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('secret_question', data.secret_question)
    sessionStorage.setItem('user_id', data.user_id);
    window.location.pathname = '/reset/sec';
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
    console.log('sign up fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  }
}
