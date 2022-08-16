import React from 'react';
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
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import { mainListItems } from './Mgr_ListItems';
import DualListBox from 'react-dual-listbox';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import 'react-day-picker/lib/style.css';

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
  addContactButton: {
    left: '90%',
  },
  addRemoveButton: {
    left: '60%',
  },
  addEditButton: {
    left: '50%',
  },
  addSchdInspctButton: {
    left: '5%',
  },
  mapContainer: {
    float: 'left',
    top: 0,
    bottom: '10%',
    width: '90%',
    height: '150%',
  },
  listboxContainer: {
    float: 'right',
    height: '70%',
    width: '110%',
  },
  routeButton: {
    top: '3%',
    width: '80%',
  },
  scheduleButton: {
    marginLeft: '10%',
    top: '4%',
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    float: 'left',
    marginLeft: '-10%',
    width: '100%',
    marginTop: theme.spacing(1),
  },
  scheduleForm: {
    float: 'left',
    marginLeft: '-8%',
    marginTop: '12%',
  },
  textField: {
    width: '100%',
    marginTop: '3%',
  },
  dateField: {
    width: '100%',
    marginTop: '1%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  textHeader: {
    marginLeft: '-10%',
    marginTop: '22%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '90%',
  },
  simpleText: {
    marginLeft: '-10%',
    marginTop: '0%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '90%',
  },
}));

mapboxgl.accessToken = 'pk.eyJ1IjoiZHdvb2xub3VnaCIsImEiOiJja3YzZjhnaGcwa3ZnMm9wNm5oaXh3MTYxIn0.2AEDoHcYKsk_ta0AxPXeBA';

UpdateMultiInspection.propTypes = {
  itineraryId: PropTypes.number.isRequired,
}

export default function UpdateMultiInspection (props) {
  const itineraryId = props.itineraryId;
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // TODO: GET properties and office locationtry {

  // assign to property data as below.
  const propertyData = JSON.parse(sessionStorage.getItem('propertyData'));
  for (const property of propertyData) {
    property.coords[0] = parseFloat(property.coords[0]);
    property.coords[1] = parseFloat(property.coords[1]);
    property.value = 'p' + property.value;
  }
  console.log(propertyData);
  const officeCoords = { coords: [151.2093, -33.8688], name: 'Office', label: 'Office', value: 'p0', };

  class MapProperties extends React.PureComponent {
    constructor (props) {
      super(props);
      this.state = {
        selected: [],
        tripSummary: `Trip takes ${this.totalTripDurationHours} hours and ${this.totalTripDurationMinutes} minutes.`,
        tripDetails: [],
        showScheduleButton: false,
        selectedDay: null,
      };
      // for map component
      this.state = {
        lng: 151.2103,
        lat: -33.8888,
        zoom: 11.5,
      };
      this.mapContainer = React.createRef();
      // for list box component
      this.onChange = this.onChange.bind(this);
      // for markers
      this.markers = {};
      this.map = 'undefined';
      // for route
      this.startTime = sessionStorage.getItem('start_time');
      this.endTime = sessionStorage.getItem('end_time');
      this.inspectionTime = sessionStorage.getItem('inspectionTime');
      this.routeStops = [];
      this.geojson = {};
      this.routeSegmentDurations = [];
      this.totalTripDurationHours = 0;
      this.totalTripDurationMinutes = 0;
      this.handleDayClick = this.handleDayClick.bind(this);
    }

    componentDidMount () {
      // await this.setState({ propertyData: await this.getPropertiesForManager() })
      const { lng, lat, zoom } = this.state;
      this.map = new mapboxgl.Map({
        container: this.mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false,
      });
      this.map.addControl(new mapboxgl.AttributionControl(), 'top-left');
      this.map.addControl(new mapboxgl.NavigationControl());
      // TODO: update based on real property ID
      this.markers.p0 = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat(new mapboxgl.LngLat(officeCoords.coords[0], officeCoords.coords[1]))
        .addTo(this.map)
        .setPopup(new mapboxgl.Popup().setText(officeCoords.name).addTo(this.map));
    }

    onChange = (selected) => {
      console.log(selected);
      this.setState({ selected: selected });
      this.routeStops = [officeCoords];
      for (const propertyID of selected) {
        if (!(propertyID in this.markers)) {
          this.markers[propertyID] = new mapboxgl.Marker({ color: '#00B9FF' });
        }
        for (const property of propertyData) {
          if (property.value === propertyID) {
            console.log(property);
            this.routeStops.push(property);
            this.markers[propertyID]
              .setLngLat(new mapboxgl.LngLat(property.coords[0], property.coords[1]))
              .addTo(this.map)
              .setPopup(new mapboxgl.Popup().setText(property.name).addTo(this.map));
          }
        }
      }
      for (const [propertyID, marker] of Object.entries(this.markers)) {
        if (!(selected.includes(propertyID)) && (propertyID !== 'p0')) {
          marker.remove();
        }
      }
    }

    assembleQueryURL () {
      let queryURL = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/';
      let flag = 0;
      for (const routeStop of this.routeStops) {
        const coords = routeStop.coords;
        if (flag === 0) {
          queryURL += `${coords[0]},${coords[1]}`;
          flag = 1;
        } else {
          queryURL += `;${coords[0]},${coords[1]}`;
        }
      }
      return `${queryURL}?source=first&destination=last&roundtrip=true&overview=full&steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
    }

    timeMatrix () {
      let matrixURL = 'https://api.mapbox.com/directions-matrix/v1/mapbox/driving/';
      let flag = 0;
      for (const routeStop of this.routeStops) {
        const coords = routeStop.coords;
        if (flag === 0) {
          matrixURL += `${coords[0]},${coords[1]}`;
          flag = 1;
        } else {
          matrixURL += `;${coords[0]},${coords[1]}`;
        }
      }
      return `${matrixURL}?access_token=${mapboxgl.accessToken}`;
    }

    timePlusSeconds (time, seconds) {
      // return the new time produced from adding seconds to time
      // Input: time: str in format HH:MM:SS
      //     seconds: int
      const now = new Date();
      const nowDate = now.toISOString().split('T')[0];
      const nowTime = new Date(nowDate + ' ' + time);

      const newTimeMS = nowTime.getTime() + seconds * 1000; // new time in ms
      const newTime = new Date(newTimeMS);

      const newHour = newTime.getHours();
      let newMinutes = newTime.getMinutes().toString();
      if (newMinutes.length < 2) {
        newMinutes = '0' + newMinutes; // zero padding
      }
      let newSeconds = newTime.getSeconds().toString();
      if (newSeconds.length < 2) {
        newSeconds = '0' + newSeconds; // zero padding
      }

      return newHour + ':' + newMinutes + ':' + newSeconds;
    }

    roundToQuarter (time) {
      // round up to the nearest quarter time
      // Input: time: str in format HH:MM:SS
      const oldHour = time.split(':')[0];
      const oldMinutes = time.split(':')[1];
      console.log(oldHour, oldMinutes);
      let newMinutes = (Math.floor(oldMinutes / 15) + 1) * 15;
      if (newMinutes === 60) {
        newMinutes = '00';
      }
      console.log(newMinutes);
      const newHour = newMinutes === '00' ? (parseInt(oldHour) + 1).toString() : oldHour;
      console.log(newHour);
      return newHour + ':' + newMinutes + ':00';
    }

    timeDifferenceMinutes (start, end) {
      // return difference between start and end times
      // inputs are isoformat time strings (HH:MM:SS)
      const now = new Date();
      const nowDate = now.toISOString().split('T')[0];

      const startDate = new Date(nowDate + ' ' + start);
      const endDate = new Date(nowDate + ' ' + end);

      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1); // account for over day difference, probs unnecessary
      }

      return Math.floor((endDate - startDate) / (1000 * 60));
    }

    async drawRoute () {
      // Main function: Draw route, calculate route + inspection times

      // remove any old route sources/layers
      if (this.map.getLayer('routearrows')) {
        this.map.removeLayer('routearrows');
      }
      if (this.map.getLayer('routeline-active')) {
        this.map.removeLayer('routeline-active');
      }
      if (this.map.getSource('route')) {
        this.map.removeSource('route');
      }

      // Make a request to the Optimization API
      const query = await fetch(this.assembleQueryURL(), { method: 'GET' });
      const response = await query.json();

      // Create an alert for any requests that return an error
      if (response.code !== 'Ok') {
        const handleMessage =
          response.code === 'InvalidInput'
            ? 'Refresh to start a new route. For more information: https://docs.mapbox.com/api/navigation/optimization/#optimization-api-errors'
            : 'Try a different point.';
        alert(`${response.code} - ${response.message}\n\n${handleMessage}`);
        return;
      }

      // check and report travel time information
      const matrixURL = this.timeMatrix();
      const matrixQuery = await fetch(matrixURL, { method: 'GET' });
      const matrixResponse = await matrixQuery.json();
      if (matrixResponse.code !== 'Ok') {
        const handleMessage =
          response.code === 'InvalidInput'
            ? 'Refresh to start a new route. For more information: https://docs.mapbox.com/api/navigation/optimization/#optimization-api-errors'
            : 'Try a different point.';
        alert(`${response.code} - ${response.message}\n\n${handleMessage}`);
        return;
      }
      this.routeSegmentDurations = [];
      for (let i = 0; i < matrixResponse.durations.length; i++) {
        for (let j = 0; j < matrixResponse.durations[0].length; j++) {
          if ((j === i + 1) || ((i === matrixResponse.durations.length - 1) && (j === 0))) {
            this.routeSegmentDurations.push(matrixResponse.durations[i][j]);
          }
        }
      }
      // To allow for traffic and for convenience, inspections can only be scheduled every quarter hour
      // we round forward all inspection times to the nearest quarter hour
      let currTime = this.startTime;
      let returnTime = currTime;
      this.routeInspectionTimes = [];
      for (let i = 0; i < this.routeSegmentDurations.length; i++) {
        currTime = this.timePlusSeconds(currTime, this.routeSegmentDurations[i]);
        if (i < this.routeSegmentDurations.length - 1) {
          currTime = this.roundToQuarter(currTime);
        }
        this.routeInspectionTimes.push(currTime);
        if (i < this.routeSegmentDurations.length - 1) {
          currTime = this.timePlusSeconds(currTime, this.inspectionTime * 60);
        }
        returnTime = currTime;
      }
      // check whether there is enough time available to complete this route under constraints.
      const totalTripDuration = this.timeDifferenceMinutes(this.startTime, returnTime);
      const availableTime = this.timeDifferenceMinutes(this.startTime, this.endTime);
      if (totalTripDuration > availableTime) {
        alert(
          `Desired trip takes ${totalTripDuration} minutes, but only ${availableTime} minutes are available. ` +
          'Either remove some properties from the trip, or increase available hours.'
        );
        return;
      }

      // update state and trip summary/details for display to user
      this.totalTripDurationHours = Math.floor(totalTripDuration / 60);
      this.totalTripDurationMinutes = (totalTripDuration % 60);

      this.setState({
        tripSummary: `Trip takes ${this.totalTripDurationHours} hours and ${this.totalTripDurationMinutes} minutes.`
      });
      const tripDetails = [];
      const numStops = this.routeStops.length
      for (let i = 0; i < numStops; i++) {
        const duration = this.routeSegmentDurations[i];
        const source = this.routeStops[i];
        const dest = this.routeStops[(i + 1) % numStops];
        tripDetails.push(`From ${source.label} to ${dest.label} takes ${Math.floor(duration / 60)} minutes.`)
        if (i < numStops - 1) {
          tripDetails.push(
            `Inspection at ${dest.label} scheduled for ${this.routeInspectionTimes[i]}` +
            `-${this.timePlusSeconds(this.routeInspectionTimes[i], this.inspectionTime * 60)}.`
          )
        } else {
          tripDetails.push(`Return to office at ${this.routeInspectionTimes[i]}.`)
        }
      }
      this.setState({
        tripDetails: tripDetails,
      })

      // Update map with route: Create a GeoJSON feature collection
      this.geojson = turf.featureCollection([
        turf.feature(response.trips[0].geometry)
      ]);

      // Create the `route` source by getting the route source
      // and setting the data equal to routeGeoJSON
      this.map.addSource('route', {
        type: 'geojson',
        data: this.geojson,
      });
      this.map.addLayer(
        {
          id: 'routeline-active',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 22, 12]
          }
        },
        'waterway-label'
      );
      this.map.addLayer(
        {
          id: 'routearrows',
          type: 'symbol',
          source: 'route',
          layout: {
            'symbol-placement': 'line',
            'text-field': '▶',
            'text-size': ['interpolate', ['linear'], ['zoom'], 12, 24, 22, 60],
            'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 12, 30, 22, 160],
            'text-keep-upright': false
          },
          paint: {
            'text-color': '#3887be',
            'text-halo-color': 'hsl(55, 11%, 96%)',
            'text-halo-width': 3
          }
        },
        'waterway-label'
      );

      // Update state to show schedule button.
      this.setState({ showScheduleButton: true });
    }

    defaultStartTime (event) {
      this.startTime = event.target.value;
    }

    defaultEndTime (event) {
      this.endTime = event.target.value;
    }

    defaultInspectionTime (event) {
      this.inspectionTime = event.target.value;
    }

    handleDayClick (day) {
      this.setState({
        selectedDay: day,
      });
    }

    async updateItinerary () {
      // Request to backend to schedule an inspection in db
      const propertyIDToInspectionTimes = [];
      for (let i = 0; i < this.routeStops.length - 1; i++) {
        // first routeStop is office; ignore
        propertyIDToInspectionTimes.push({
          propertyID: this.routeStops[i + 1].value, inspectionTime: this.routeInspectionTimes[i]
        });
      }
      const options = {
        method: 'PATCH',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
        body: JSON.stringify({
          itineraryID: this.itineraryID,
          inspectionDate: this.state.selectedDay,
          propertyInspectionTimes: propertyIDToInspectionTimes,
          inspectionLength: this.inspectionTime,
          routeJSON: this.geojson,
        }),
      }
      // Get data using fetch
      const PORT = require('../config.json').BACKEND_PORT;
      const url = 'http://localhost:' + PORT;
      const res = await fetch(url + '/admin/itineraries/' + itineraryId, options);
      const data = await res.json();
      console.log(data);
      if (res.status === 401) {
        console.log('fail');
        console.log(data.error);
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else {
        if (res.status === 200) {
          console.log('success');
          console.log('token: ' + data.token);
          window.location = '/manager/home';
        } else {
          console.log('fail');
          console.log(data.error);
          alert(res.status + ': ' + data.error);
        }
        sessionStorage.setItem('token', data.token);
      }
    }

    render () {
      const { selected, tripSummary, tripDetails } = this.state;
      return (
        <Grid container spacing={2}>
          <Grid item xs={7}>
            <div ref={this.mapContainer} className={classes.mapContainer}/>
          </Grid>
          <Grid item xs={5}>
            <link rel="stylesheet" href="//use.fontawesome.com/releases/v5.6.3/css/all.css"/>
            <DualListBox
              options={propertyData}
              selected={selected}
              onChange={this.onChange}
              showOrderButtons
              preserveSelectOrder
              className={classes.listboxContainer}
              lang={{ availableHeader: 'Available Properties', selectedHeader: 'Inspection Itinerary' }}
              showHeaderLabels
            />
            <form noValidate className={classes.form}>
              <TextField
                className={classes.textField}
                variant="outlined"
                label="Start Time"
                fullWidth
                defaultValue={this.startTime}
                onChange={ (event) => { this.defaultStartTime(event); } }
              />
              <TextField
                className={classes.textField}
                variant="outlined"
                label="End Time"
                fullWidth
                defaultValue={this.endTime}
                onChange={ (event) => { this.defaultEndTime(event); } }
              />
              <TextField
                className={classes.textField}
                variant="outlined"
                label="Time to Inspect Property (mins)"
                fullWidth
                defaultValue={this.inspectionTime}
                onChange={ (event) => { this.defaultInspectionTime(event); } }
              />
            </form>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              id="loginButton"
              className={classes.routeButton}
              onClick={(event) => { event.preventDefault(); this.drawRoute(); }}
            >
              Calculate Route
            </Button>
          </Grid>
          <Grid container spacing={2} justify={'center'}>
            <Grid item xs={7}>
              <Container>
                <Typography variant="h6" component="h6" className={classes.textHeader}>
                  {tripSummary}
                </Typography>
                <Typography variant="body1" component="body1" className={classes.simpleText}>
                  <ol>
                    {this.state.tripDetails
                      ? tripDetails.map((x) => (
                        <li key={x}>{x}</li>
                        ))
                      : null}
                  </ol>
                </Typography>
              </Container>
            </Grid>
            <Grid item xs={5} className={classes.scheduleForm}>
              { this.state.showScheduleButton
                ? <Button
                type="submit"
                variant="contained"
                color="primary"
                id="loginButton"
                className={classes.scheduleButton}
                onClick={(event) => { event.preventDefault(); this.updateItinerary(); }}
                >
                  Update Itinerary
                </Button>
                : null }
            </Grid>
          </Grid>
        </Grid>
      );
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Update Itinerary
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>{mainListItems}</List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Box pt={4}>
          <MapProperties/>
          </Box>
        </Container>
      </main>
    </div>
  )
}
