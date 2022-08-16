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
  // SecurityQuestion and Answer is initialized as empty string
  // const [SecurityQuestion, setSecurityQuestion] = React.useState('');
  const [Answer, setAnswer] = React.useState('');

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Answer The Security Question
        </Typography>
        <form className={classes.form} noValidate>
          <Typography component="h1" variant="subtitle1" color="inherit" noWrap className={classes.title}>
            {sessionStorage.getItem('secret_question')}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="Answer"
            label="Answer"
            type="Answer"
            id="Answer"
            autoComplete="current-Answer"
            value={Answer}
            onChange={event => { console.log('Answer: ' + Answer); setAnswer(event.target.value); }}
          />
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
            onClick={(event) => { event.preventDefault(); submitanswer(Answer); }}
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
// Make api request of submit answer
async function submitanswer (Answer) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'Application/json',
      'Content-Type': 'Application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify({
      secret_answer: Answer,
      user_id: sessionStorage.getItem('user_id'),
    }),
  }
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/reset/sec', options);
  const data = await res.json();
  console.log(data);

  if (res.status === 401) {
    console.log('unauthorized: redirecting to login');
    console.log(data.error)
    alert(res.status + ': ' + data.message);
    window.location = '/Login';
  } else {
    if (res.status === 200) {
      console.log('submit success');
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user_id', data.user_id);
      window.location = '/reset/set';
    } else if (res.status === 500) {
      console.log(data.error);
      alert(res.status + ': Internal Error');
    } else {
      console.log('submit fail');
      console.log(data.error);
      alert(res.status + ': ' + data.error);
    }
    sessionStorage.setItem('token', data.token);
  }
}
