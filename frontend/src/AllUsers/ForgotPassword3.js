import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
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
  // Newpassword and confirmpassword is initialized as empty string
  const [Newpassword, setNewpassword] = React.useState('');
  const [confirmpassword, setconfirmpassword] = React.useState('');

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
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
            id="Newpassword"
            label="New password"
            name="Newpassword"
            autoComplete="Newpassword"
            autoFocus
            value={Newpassword}
            onChange={event => { console.log('Newpassword: ' + Newpassword); setNewpassword(event.target.value); }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmpassword"
            label="Confirm password"
            type="confirmpassword"
            id="confirmpassword"
            autoComplete="current-confirmpassword"
            value={confirmpassword}
            onChange={event => { console.log('confirmpassword: ' + confirmpassword); setconfirmpassword(event.target.value); }}
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Grid container>
            <Grid item xs>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            id="loginButton"
            className={classes.submit}
            onClick={(event) => { event.preventDefault(); submitconfirmpassword(Newpassword, confirmpassword); }}
          >
            Submit
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
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;
// Make api request of submit confirmpassword
async function submitconfirmpassword (Newpassword, confirmpassword) {
  const options = {
    method: 'PATCH',
    headers: {
      accept: 'Application/json',
      'Content-Type': 'Application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token')
    },
    body: JSON.stringify({
      user_id: sessionStorage.getItem('user_id'),
      new_password: Newpassword,
      confirm_password: confirmpassword,
    }),
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/reset', options);
  const data = await res.json();
  console.log(data);

  if (res.status === 200) {
    console.log('submit success');
    window.location = '/Login';
    return alert('Reset password successfully')
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
