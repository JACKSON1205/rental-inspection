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
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

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
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [securityQuestion, setSecurityQuestion] = React.useState('');
  const [securityAnswer, setSecurityAnswer] = React.useState('');
  const [rolesSelection, setRolesSelection] = React.useState([false, false, false]);

  const updateRolesSelection = (index, value) => {
    const newRolesSelection = [...rolesSelection];
    newRolesSelection[index] = value;
    setRolesSelection(newRolesSelection);
  };
  console.log(rolesSelection);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <AssignmentIndOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
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
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            autoFocus
            value={firstName}
            onChange={event => setFirstName(event.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoFocus
            value={lastName}
            onChange={event => setLastName(event.target.value)}
          />
          <br />
          <br />
          {<FormControl component="fieldset" className={classes.rolesSelection}>
            <FormLabel component="legend">Please Tick The Roles You Will Be</FormLabel>
            <br />
            {/* event.target.value */}
            <FormGroup row>
              <FormControlLabel
                value={'1'}
                control={<Checkbox color="primary" />}
                label="Tenant"
                labelPlacement="top"
                onClick={event => { event.target.checked ? updateRolesSelection(0, true) : updateRolesSelection(0, false) }}
              />
              <FormControlLabel
                value={'1'}
                control={<Checkbox color="primary" />}
                label="Owner"
                labelPlacement="top"
                onClick={event => { event.target.checked ? updateRolesSelection(1, true) : updateRolesSelection(1, false) }}
              />
              <FormControlLabel
                value={'1'}
                control={<Checkbox color="primary" />}
                label="Manager"
                labelPlacement="top"
                onClick={event => { event.target.checked ? updateRolesSelection(2, true) : updateRolesSelection(2, false) }}
              />
            </FormGroup>
          </FormControl>}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="securityQuestion"
            label="Security Question"
            name="securityQuestion"
            autoFocus
            value={securityQuestion}
            onChange={event => setSecurityQuestion(event.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="securityAnswer"
            label="Security Answer"
            name="securityAnswer"
            autoFocus
            value={securityAnswer}
            onChange={event => setSecurityAnswer(event.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            id="signUpButton"
            // onClick={(event) => { event.preventDefault(); authRegister(email, password, name); }}
            onClick={(event) => { event.preventDefault(); authRegister(email, password, firstName, lastName, rolesSelection[0], rolesSelection[1], rolesSelection[2], securityQuestion, securityAnswer); }}
          >
            Sign Up
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            className={classes.submit}
            id="signUpButton"
            href='/'
          >
            Cancel
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

async function authRegister (email, password, firstName, lastName, tenant, owner, manager, securityQuestion, securityAnswer) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
      tenant: tenant,
      manager: manager,
      owner: owner,
      securityQuestion: securityQuestion,
      securityAnswer: securityAnswer,
    }),
  };
  // Get data using fetch
  const res = await fetch(url + '/admin/auth/register', options);
  const data = await res.json();

  console.log(data);
  if (res.status === 200) {
    console.log('sign up success');
    sessionStorage.setItem('token', data.token);
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
    console.log('sign up fail');
    console.log(data.error);
    alert(res.status + ': ' + data.error);
  }
}
