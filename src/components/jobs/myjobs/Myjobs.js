import React, { Component } from "react";
import "../Jobs.css";
import { addNotification, GeoName } from "../../functions/helper";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import DirectionsCarIcon from "@material-ui/icons/DirectionsCar";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import AccessibilityNewIcon from "@material-ui/icons/AccessibilityNew";
import PhoneIphoneIcon from "@material-ui/icons/PhoneIphone";
import ChatIcon from "@material-ui/icons/Chat";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import BackspaceIcon from "@material-ui/icons/Backspace";
import StarIcon from "@material-ui/icons/Star";
import NearMeIcon from "@material-ui/icons/NearMe";
import firebase from "../../protected/Firebase";
import Chat from "../publishmanage/components/chat/Chat";
import ReactMapGL, { Marker } from "react-map-gl";
import StarsIcon from "@material-ui/icons/Stars";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Contact from "../publishmanage/components/contact/Contact";
import StarRatingComponent from "react-star-rating-component";
import UserContext from "../../protected/UserContext";
import Loading from "../../functions/Loading";

export default class Myjobs extends Component {
  static contextType = UserContext;

  state = {
    hours: [
      { id: 1, name: "< 3hrs" },
      { id: 2, name: "< 6hrs" },
      { id: 3, name: "< 12hrs" },
      { id: 4, name: "< 1d" },
      { id: 5, name: "1d +" },
    ],
    jobs: [],
    jobsConfirmed: [],
    job: {},
    saved: true,
    going: false,
    lat: undefined,
    lng: undefined,
    ContactPopup: false,
    allUsers: [],
    allLocations: [],
    confirmedUsers: [],
    acceptedUsers: [],
    online: true,
  };

  getCoord = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({ lat: position.coords.latitude });
      this.setState({ lng: position.coords.longitude });
    });
  };

  removeA(arr) {
    var what,
      a = arguments,
      L = a.length,
      ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax = arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  }

  removeOBJuid2(arr, id) {
    for (var i = 0; i < arr.length; i++)
      if (arr[i].acceptingUserId === id) {
        arr.splice(i, 1);
        return arr;
      }
  }

  removeOBJuid3(arr, id) {
    for (var i = 0; i < arr.length; i++)
      if (arr[i].confirmingUserId === id) {
        arr.splice(i, 1);
        return arr;
      }
  }

  setSaved = (async) => {
    setTimeout(() => {
      this.setState({ saved: true, going: false });
      this.getData();
    }, 1);
  };

  setGoing = (async) => {
    setTimeout(() => {
      this.setState({ saved: false, going: true });
      this.getData();
    }, 1);
  };

  applyJob = (job) => {
    firebase
      .firestore()
      .collection("jobs")
      .doc(job.id)
      .get()
      .then((doc) => {
        let requests = doc.data().requests;
        requests.push({
          requestingUserId: sessionStorage.getItem("uid"),
          dateRequested: firebase.firestore.Timestamp.fromDate(new Date()),
        });
        firebase
          .firestore()
          .collection("jobs")
          .doc(job.id)
          .update({ requests });
      });
    addNotification({
      date: firebase.firestore.Timestamp.fromDate(new Date()),
      fromUser: sessionStorage.getItem("uid"),
      fromUsername: sessionStorage.getItem("name"),
      jobId: job.id,
      notificationType: "newRequest",
      toUser: job.creatingUserId,
    });
    toast.configure();
    toast.info("Job apllied", { autoClose: 2000 });
  };

  componentDidMount() {
    this.getData();
    this.getData2();
  }
  getData = (async) => {
    this.getCoord();
    const field = ["savedIds", "acceptedIds"];
    const allData = [];
    const allUsers = [];
    const allLocations = [];
    firebase
      .firestore()
      .collection("jobs")
      .where(
        this.state.saved ? field[0] : field[1],
        "array-contains",
        sessionStorage.getItem("uid")
      )
      .orderBy("dateCreated", "desc")
      .limit(20)
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = {
            id: doc.id,
            title: doc.data().title,
            geo: doc.data().location,
            description: doc.data().description,
            dateCreated: doc.data().dateCreated,
            payment: doc.data().payment,
            startDate: doc.data().startDate,
            location: doc.data().location,
            categories: doc.data().stringCategories,
            isPaymentPerHour: doc.data().isPaymentPerHour,
            duration: doc.data().duration,
            requiredEmployees: doc.data().requiredEmployees,
            isPayingForTransportation: doc.data().isPayingForTransportation,
            creatingUserId: doc.data().creatingUserId,
            numberOfSaves: doc.data().numberOfSaves,
            numberOfViews: doc.data().numberOfViews,
            km: this.calcCrow(doc.data().location.Ba, doc.data().location.Oa),
            Geoname: GeoName(doc.data().location.Ba, doc.data().location.Oa),

            viewport: {
              latitude: 32.12257459473794,
              longitude: 34.8154874641065,
              width: "100%",
              height: "40vh",
              zoom: 10,
            },
          };
          fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode?latitude=${
              doc.data().location.Oa
            }&longitude=${
              doc.data().location.Ba
            }&localityLanguage=en&key=5305f546fbc84e378acc3138bdd5a82f`
          )
            .then((response) => response.json())
            .then((data) => {
              const Geo = { Geo: data.locality, id: doc.id };
              allLocations.push(Geo);
              this.setState({ allLocations, online: true });
            });
          firebase
            .firestore()
            .collection("users")
            .doc(doc.data().creatingUserId)
            .get()
            .then((doc) => {
              const data = {
                name: doc.data().name,
                profileImageURL: doc.data().profileImageURL,
                id: doc.data().uid,
                employerRating: doc.data().employerRating.sumOfRatings,
              };
              allUsers.push(data);
              this.setState({ allUsers });
            });
          allData.push(data);
        });
        this.setState({ jobs: allData });
      });
  };

  getData2 = (async) => {
    this.getCoord();
    const allData = [];
    const allUsers = [];
    const allLocations = [];
    firebase
      .firestore()
      .collection("jobs")
      .where("confirmedIds", "array-contains", sessionStorage.getItem("uid"))
      .orderBy("dateCreated", "desc")
      .limit(20)
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = {
            id: doc.id,
            title: doc.data().title,
            geo: doc.data().location,
            description: doc.data().description,
            dateCreated: doc.data().dateCreated,
            payment: doc.data().payment,
            startDate: doc.data().startDate,
            location: doc.data().location,
            categories: doc.data().stringCategories,
            isPaymentPerHour: doc.data().isPaymentPerHour,
            duration: doc.data().duration,
            requiredEmployees: doc.data().requiredEmployees,
            isPayingForTransportation: doc.data().isPayingForTransportation,
            creatingUserId: doc.data().creatingUserId,
            numberOfSaves: doc.data().numberOfSaves,
            numberOfViews: doc.data().numberOfViews,
            km: this.calcCrow(doc.data().location.Ba, doc.data().location.Oa),
            Geoname: GeoName(doc.data().location.Ba, doc.data().location.Oa),
            viewport: {
              latitude: 32.12257459473794,
              longitude: 34.8154874641065,
              width: "100%",
              height: "40vh",
              zoom: 10,
            },
          };
          fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode?latitude=${
              doc.data().location.Oa
            }&longitude=${
              doc.data().location.Ba
            }&localityLanguage=en&key=5305f546fbc84e378acc3138bdd5a82f`
          )
            .then((response) => response.json())
            .then((data) => {
              const Geo = { Geo: data.locality, id: doc.id };
              allLocations.push(Geo);
              this.setState({ allLocations });
            });
          firebase
            .firestore()
            .collection("users")
            .doc(doc.data().creatingUserId)
            .get()
            .then((doc) => {
              const data = {
                name: doc.data().name,
                profileImageURL: doc.data().profileImageURL,
                id: doc.data().uid,
                employerRating: doc.data().employerRating.sumOfRatings,
              };
              allUsers.push(data);
              this.setState({ allUsers });
            });
          allData.push(data);
        });
        this.setState({ jobsConfirmed: allData });
      });
  };

  jobPopUp = (job) => {
    this.setState({ job });
    this.setState({
      viewport: {
        latitude: 32.12257459473794,
        longitude: 34.8154874641065,
        width: "100%",
        height: "40vh",
        zoom: 10,
      },
    });
  };

  ContactPopup = (job) => {
    this.setState({ ContactPopup: !this.state.ContactPopup, jobdash: job });
  };

  Chat = (job) => {
    this.setState({ jobChat: !this.state.jobChat, jobdash: job });
  };

  unsaveJob = (job) => {
    firebase
      .firestore()
      .collection("jobs")
      .doc(job.id)
      .get()
      .then((doc) => {
        let savedIds = doc.data().savedIds;
        this.removeA(savedIds, sessionStorage.getItem("uid"));
        firebase.firestore().collection("jobs").doc(job.id).update({
          savedIds,
        });
      });
    this.getData();
  };

  calcCrow(lon2, lat2, unit) {
    var radlat1 = (Math.PI * this.state.lat) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = this.state.lng - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
  }

  toconfirmedUsers = (job) => {
    firebase
      .firestore()
      .collection("jobs")
      .doc(job.id)
      .get()
      .then((doc) => {
        let acceptedUsers = doc.data().acceptedUsers;
        let confirmedUsers = doc.data().confirmedUsers;
        let acceptedIds = doc.data().acceptedIds;
        let confirmedIds = doc.data().confirmedIds;
        this.removeA(acceptedIds, sessionStorage.getItem("uid"));
        this.removeOBJuid2(acceptedUsers, sessionStorage.getItem("uid"));
        confirmedIds.push(sessionStorage.getItem("uid"));
        confirmedUsers.push({
          confirmingUserId: sessionStorage.getItem("uid"),
          dateConfirmed: firebase.firestore.Timestamp.fromDate(new Date()),
        });
        firebase.firestore().collection("jobs").doc(job.id).update({
          acceptedIds,
          confirmedIds,
          confirmedUsers,
          acceptedUsers,
        });
        setTimeout(() => {
          this.getData();
          this.getData2();
        }, 1);
        addNotification({
          date: firebase.firestore.Timestamp.fromDate(new Date()),
          fromUser: sessionStorage.getItem("uid"),
          fromUsername: sessionStorage.getItem("name"),
          jobId: job.id,
          notificationType: "userConfirmed",
          toUser: job.creatingUserId,
        });
      });
  };

  removeConfirmed = (job) => {
    firebase
      .firestore()
      .collection("jobs")
      .doc(job.id)
      .get()
      .then((doc) => {
        let confirmedUsers = doc.data().confirmedUsers;
        let confirmedIds = doc.data().confirmedIds;
        this.removeA(confirmedIds, sessionStorage.getItem("uid"));
        this.removeOBJuid3(confirmedUsers, sessionStorage.getItem("uid"));
        firebase.firestore().collection("jobs").doc(job.id).update({
          confirmedIds,
          confirmedUsers,
        });
        setTimeout(() => {
          this.getData();
          this.getData2();
        }, 1);
        addNotification({
          date: firebase.firestore.Timestamp.fromDate(new Date()),
          fromUser: sessionStorage.getItem("uid"),
          fromUsername: sessionStorage.getItem("name"),
          jobId: job.id,
          notificationType: "userLeft",
          toUser: job.creatingUserId,
        });
      });
  };

  getUserName = (id) => {
    const arr = this.state.allUsers;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        return arr[i].name;
      }
    }
  };

  getUserPic = (id) => {
    const arr = this.state.allUsers;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        return arr[i].profileImageURL;
      }
    }
  };

  getUserRate = (id) => {
    const arr = this.state.allUsers;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        return arr[i].employerRating;
      }
    }
  };

  getUserGeoName = (id) => {
    const arr = this.state.allLocations;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        if (arr[i].Geo === "") {
          return "";
        } else {
          return ", " + arr[i].Geo;
        }
      }
    }
  };

  render() {
    const { lang } = this.context;

    return (
      <div>
        {this.state.online ? "" : <Loading />}
        <div className="myjobs-main-head-flex">
          <p
            onClick={() => this.setSaved()}
            style={{
              background: this.state.saved ? "rgb(45, 123, 212)" : "none",
              color: this.state.saved ? "white" : "gray",
            }}
          >
            <StarIcon style={{ color: "white", fontSize: 15 }} />

            {lang ? "שמור" : "Saved"}
          </p>
          <p
            onClick={() => this.setGoing()}
            style={{
              background: this.state.going ? "rgb(45, 123, 212)" : "none",
              color: this.state.going ? "white" : "gray",
            }}
          >
            <NearMeIcon style={{ color: "white", fontSize: 15 }} />

            {lang ? "מאושר" : "Going"}
          </p>
        </div>
        {this.state.ContactPopup ? (
          <Contact job={this.state.jobdash} ContactPopup={this.ContactPopup} />
        ) : (
          ""
        )}
        {this.state.saved ? (
          <div>
            <div className="myjobs">
              {this.state.jobChat ? (
                <div className="dashboard-card">
                  <Chat job={this.state.jobdash} Chat={this.Chat} />
                </div>
              ) : (
                ""
                //--------------------------------------------------------------------------------//
                //--------------------------------------------------------------------------------//
                //--------------------------------------------------------------------------------//
              )}

              {this.state.jobs.map((job) =>
                this.state.job.id !== job.id ? (
                  <div
                    className="jobs-card"
                    key={job.id}
                    onClick={() => this.jobPopUp(job)}
                  >
                    <div className="jobs-card-title">
                      <p className="jobs-card-description">{job.title}</p>
                      <h3>₪{job.payment}</h3>
                    </div>
                    <div className="jobs-card-info">
                      <p>
                        <span>
                          <CalendarTodayIcon
                            style={{ fontSize: 20, margin: "0", color: "gray" }}
                          />
                        </span>
                        {job.dateCreated.toDate().toDateString()}
                      </p>
                      <p>
                        <span>
                          <LocationOnIcon
                            style={{ fontSize: 20, margin: "0", color: "gray" }}
                          />
                        </span>
                        {Math.round(job.km)} km {this.getUserGeoName(job.id)}
                      </p>
                    </div>
                    <div className="jobs-card-tags">
                      {job.categories.map((tag) => (
                        <p className="jobs-card-tags-item" key={tag}>
                          {tag}
                        </p>
                      ))}
                    </div>
                    <StarsIcon
                      style={{
                        color: "rgb(45, 123, 212)",
                        fontSize: 30,
                        float: "right",
                        margin: "5px",
                      }}
                    />
                  </div>
                ) : (
                  <div className="jobs-selected-card" key={job.description}>
                    <ReactMapGL
                      {...job.viewport}
                      mapboxApiAccessToken="pk.eyJ1Ijoia29yZW5oYW1yYSIsImEiOiJjazRscXBqeDExaWw2M2VudDU5OHFsN2tjIn0.Fl-5gMOM35kqUiLLjKNmgg"
                      mapStyle="mapbox://styles/korenhamra/ck4lsl9kd2euf1cnruee3zfbo"
                      pitch="60"
                      bearing="-60"
                    >
                      <Marker
                        offsetTop={-48}
                        offsetLeft={-24}
                        latitude={32.12257459473794}
                        longitude={34.8154874641065}
                      >
                        <img
                          src=" https://img.icons8.com/color/48/000000/marker.png"
                          alt="img"
                        />
                      </Marker>
                    </ReactMapGL>
                    <div className="jobs-selected-card-body">
                      <div className="jobs-selected-card-body-left">
                        <div className="jobs-card-title">
                          <p>{job.title}</p>
                          <h3>₪{job.payment}</h3>
                        </div>
                        <div className="jobs-card-info">
                          <p>
                            <span>
                              <CalendarTodayIcon
                                style={{
                                  fontSize: 20,
                                  margin: "0",
                                  color: "white",
                                }}
                              />
                            </span>
                            {job.dateCreated.toDate().toDateString()}
                          </p>
                          <p>
                            <span>
                              <LocationOnIcon
                                style={{
                                  fontSize: 20,
                                  margin: "0",
                                  color: "white",
                                }}
                              />
                            </span>
                            {Math.round(job.km)} km
                            {this.getUserGeoName(job.id)}
                          </p>
                        </div>
                        <div className="jobs-card-tags">
                          {job.categories.map((tag) => (
                            <p
                              className="jobs-selected-card-tag-item"
                              key={tag}
                            >
                              {tag}
                            </p>
                          ))}
                        </div>
                        <p className="jobs-selected-desc">{job.description}</p>
                        <div className="jobs-selected-flex">
                          <div>
                            <QueryBuilderIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>
                              {
                                this.state.hours.find(
                                  (o) => o.id === job.duration
                                ).name
                              }
                            </p>
                          </div>
                          <div>
                            <AccessibilityNewIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>{job.requiredEmployees}</p>
                          </div>
                          <div>
                            <DirectionsCarIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>{job.isPayingForTransportation ? "✓" : "x"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="jobs-selected-card-body-right">
                        <div className="jobs-selected-bottom-line">
                          <br />
                          <button
                            className="jobs-selected-save-button"
                            onClick={() => this.ContactPopup(job)}
                          >
                            <PhoneIphoneIcon
                              style={{
                                fontSize: 15,
                                color: "rgb(45, 123, 212)",
                              }}
                            />
                            Contact
                          </button>
                          <br />
                          <button
                            className="jobs-selected-finish-button"
                            onClick={() => this.applyJob(job)}
                          >
                            <CheckCircleIcon
                              style={{
                                fontSize: 15,
                                color: "white",
                              }}
                            />
                            Apply Job
                          </button>
                          <br />
                          <button
                            className="jobs-selected-delete-button"
                            onClick={() => this.unsaveJob(job)}
                          >
                            <BackspaceIcon
                              style={{
                                fontSize: 15,
                                color: "white",
                              }}
                            />
                            Unsave
                          </button>
                        </div>
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/altro-db7f0.appspot.com/o/users%2F1593953149041.jpg?alt=media&token=62bd1a4f-78f6-4a94-b0b6-3b9ecbf27c8a"
                          alt="img"
                          className="jobs-selected-profile"
                        />
                        <p>{sessionStorage.getItem("name")}</p>
                        <StarRatingComponent starCount={5} value={4} />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          //--------------------------------------------------------------------------------//
          //--------------------------------------------------------------------------------//
          //--------------------------------------------------------------------------------//
          <div>
            <div className="myjobs">
              {this.state.jobChat ? (
                <div className="dashboard-card">
                  <Chat job={this.state.job} Chat={this.Chat} />
                </div>
              ) : (
                ""
              )}
              {this.state.jobs.map((job) =>
                this.state.job.id !== job.id ? (
                  <div
                    className="jobs-card"
                    key={job.id}
                    onClick={() => this.jobPopUp(job)}
                  >
                    <div className="jobs-card-title">
                      <p className="jobs-card-description">{job.title}</p>
                      <h3>₪{job.payment}</h3>
                    </div>
                    <div className="jobs-card-info">
                      <p>
                        <span>
                          <CalendarTodayIcon
                            style={{ fontSize: 20, margin: "0", color: "gray" }}
                          />
                        </span>
                        {job.dateCreated.toDate().toDateString()}
                      </p>
                      <p>
                        <span>
                          <LocationOnIcon
                            style={{ fontSize: 20, margin: "0", color: "gray" }}
                          />
                        </span>
                        {Math.round(job.km)} km {this.getUserGeoName(job.id)}
                      </p>
                    </div>
                    <div className="jobs-card-tags">
                      {job.categories.map((tag) => (
                        <p className="jobs-card-tags-item" key={tag}>
                          {tag}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="jobs-selected-card" key={job.description}>
                    <ReactMapGL
                      {...job.viewport}
                      mapboxApiAccessToken="pk.eyJ1Ijoia29yZW5oYW1yYSIsImEiOiJjazRscXBqeDExaWw2M2VudDU5OHFsN2tjIn0.Fl-5gMOM35kqUiLLjKNmgg"
                      mapStyle="mapbox://styles/korenhamra/ck4lsl9kd2euf1cnruee3zfbo"
                      pitch="60"
                      bearing="-60"
                    >
                      <Marker
                        offsetTop={-48}
                        offsetLeft={-24}
                        latitude={32.12257459473794}
                        longitude={34.8154874641065}
                      >
                        <img
                          src=" https://img.icons8.com/color/48/000000/marker.png"
                          alt="img"
                        />
                      </Marker>
                    </ReactMapGL>
                    <div className="jobs-selected-card-body">
                      <div className="jobs-selected-card-body-left">
                        <div className="jobs-card-title">
                          <p>{job.title}</p>
                          <h3>₪{job.payment}</h3>
                        </div>
                        <div className="jobs-card-info">
                          <p>
                            <span>
                              <CalendarTodayIcon
                                style={{
                                  fontSize: 20,
                                  margin: "0",
                                  color: "white",
                                }}
                              />
                            </span>
                            {job.dateCreated.toDate().toDateString()}
                          </p>
                          <p>
                            <span>
                              <LocationOnIcon
                                style={{
                                  fontSize: 20,
                                  margin: "0",
                                  color: "white",
                                }}
                              />
                            </span>
                            {Math.round(job.km)} km
                            {this.getUserGeoName(job.id)}
                          </p>
                        </div>
                        <div className="jobs-card-tags">
                          {job.categories.map((tag) => (
                            <p
                              className="jobs-selected-card-tag-item"
                              key={tag}
                            >
                              {tag}
                            </p>
                          ))}
                        </div>
                        <p className="jobs-selected-desc">{job.description}</p>
                        <div className="jobs-selected-flex">
                          <div>
                            <QueryBuilderIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>
                              {
                                this.state.hours.find(
                                  (o) => o.id === job.duration
                                ).name
                              }
                            </p>
                          </div>
                          <div>
                            <AccessibilityNewIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>{job.requiredEmployees}</p>
                          </div>
                          <div>
                            <DirectionsCarIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>{job.isPayingForTransportation ? "✓" : "x"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="jobs-selected-card-body-right">
                        <div className="jobs-selected-bottom-line">
                          <br />
                          <button
                            className="jobs-selected-save-button"
                            onClick={() => this.ContactPopup(job)}
                          >
                            <PhoneIphoneIcon
                              style={{
                                fontSize: 15,
                                color: "rgb(45, 123, 212)",
                              }}
                            />
                            Contact
                          </button>
                          <br />
                          <button
                            className="jobs-selected-save-button"
                            onClick={() => this.Chat()}
                          >
                            <ChatIcon
                              style={{
                                fontSize: 15,
                                color: "rgb(45, 123, 212)",
                              }}
                            />
                            Chat
                          </button>
                          <br />
                          <button
                            className="jobs-selected-finish-button"
                            onClick={() => this.toconfirmedUsers(job)}
                          >
                            <CheckCircleIcon
                              style={{
                                fontSize: 15,
                                color: "white",
                              }}
                            />
                            Confirm
                          </button>
                          <br />
                          <button className="jobs-selected-delete-button">
                            <BackspaceIcon
                              style={{
                                fontSize: 15,
                                color: "white",
                              }}
                            />
                            Abort
                          </button>
                        </div>
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/altro-db7f0.appspot.com/o/users%2F1593953149041.jpg?alt=media&token=62bd1a4f-78f6-4a94-b0b6-3b9ecbf27c8a"
                          alt="img"
                          className="jobs-selected-profile"
                        />
                        <p>{sessionStorage.getItem("name")}</p>
                        <StarRatingComponent starCount={5} value={4} />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            {this.state.jobChat ? (
              <div className="dashboard-card">
                <Chat job={this.state.job} Chat={this.Chat} />
              </div>
            ) : (
              ""
            )}
            {
              //--------------------------------------------------------------------------------//
              //--------------------------------------------------------------------------------//
              //--------------------------------------------------------------------------------//
              this.state.jobsConfirmed.map((job) =>
                this.state.job.id !== job.id ? (
                  <div
                    className="jobs-card2"
                    key={job.id}
                    onClick={() => this.jobPopUp(job)}
                  >
                    <div className="jobs-card-title">
                      <p className="jobs-card-description">{job.title}</p>
                      <h3>₪{job.payment}</h3>
                    </div>
                    <div className="jobs-card-info">
                      <p>
                        <span>
                          <CalendarTodayIcon
                            style={{
                              fontSize: 20,
                              margin: "0",
                              color: "white",
                            }}
                          />
                        </span>
                        {job.dateCreated.toDate().toDateString()}
                      </p>
                      <p>
                        <span>
                          <LocationOnIcon
                            style={{
                              fontSize: 20,
                              margin: "0",
                              color: "white",
                            }}
                          />
                        </span>
                        {Math.round(job.km)} km {this.getUserGeoName(job.id)}
                      </p>
                    </div>
                    <div className="jobs-card-tags">
                      {job.categories.map((tag) => (
                        <p className="jobs-selected-card-tag-item" key={tag}>
                          {tag}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="jobs-selected-card" key={job.description}>
                    <ReactMapGL
                      {...job.viewport}
                      mapboxApiAccessToken="pk.eyJ1Ijoia29yZW5oYW1yYSIsImEiOiJjazRscXBqeDExaWw2M2VudDU5OHFsN2tjIn0.Fl-5gMOM35kqUiLLjKNmgg"
                      mapStyle="mapbox://styles/korenhamra/ck4lsl9kd2euf1cnruee3zfbo"
                      pitch="60"
                      bearing="-60"
                    >
                      <Marker
                        offsetTop={-48}
                        offsetLeft={-24}
                        latitude={32.12257459473794}
                        longitude={34.8154874641065}
                      >
                        <img
                          src=" https://img.icons8.com/color/48/000000/marker.png"
                          alt="img"
                        />
                      </Marker>
                    </ReactMapGL>
                    <div className="jobs-selected-card-body">
                      <div className="jobs-selected-card-body-left">
                        <div className="jobs-card-title">
                          <p>{job.title}</p>
                          <h3>₪{job.payment}</h3>
                        </div>
                        <div className="jobs-card-info">
                          <p>
                            <span>
                              <CalendarTodayIcon
                                style={{
                                  fontSize: 20,
                                  margin: "0",
                                  color: "white",
                                }}
                              />
                            </span>
                            {job.dateCreated.toDate().toDateString()}
                          </p>
                          <p>
                            <span>
                              <LocationOnIcon
                                style={{
                                  fontSize: 20,
                                  margin: "0",
                                  color: "white",
                                }}
                              />
                            </span>
                            {Math.round(job.km)} km
                            {this.getUserGeoName(job.id)}
                          </p>
                        </div>
                        <div className="jobs-card-tags">
                          {job.categories.map((tag) => (
                            <p
                              className="jobs-selected-card-tag-item"
                              key={tag}
                            >
                              {tag}
                            </p>
                          ))}
                        </div>
                        <p className="jobs-selected-desc">{job.description}</p>
                        <div className="jobs-selected-flex">
                          <div>
                            <QueryBuilderIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>
                              {
                                this.state.hours.find(
                                  (o) => o.id === job.duration
                                ).name
                              }
                            </p>
                          </div>
                          <div>
                            <AccessibilityNewIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>{job.requiredEmployees}</p>
                          </div>
                          <div>
                            <DirectionsCarIcon
                              className="jobs-selected-flex-img"
                              style={{ fontSize: 40, color: "white" }}
                            />
                            <p>{job.isPayingForTransportation ? "✓" : "x"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="jobs-selected-card-body-right">
                        <div className="jobs-selected-bottom-line">
                          <br />
                          <button
                            className="jobs-selected-save-button"
                            onClick={() => this.ContactPopup(job)}
                          >
                            <PhoneIphoneIcon
                              style={{
                                fontSize: 15,
                                color: "rgb(45, 123, 212)",
                              }}
                            />
                            Contact
                          </button>
                          <br />
                          <button
                            className="jobs-selected-save-button"
                            onClick={() => this.Chat()}
                          >
                            <ChatIcon
                              style={{
                                fontSize: 15,
                                color: "rgb(45, 123, 212)",
                              }}
                            />
                            Chat
                          </button>
                          <br />

                          <button
                            className="jobs-selected-delete-button"
                            onClick={() => this.removeConfirmed(job)}
                          >
                            <BackspaceIcon
                              style={{
                                fontSize: 15,
                                color: "white",
                              }}
                            />
                            Remove
                          </button>
                        </div>
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/altro-db7f0.appspot.com/o/users%2F1593953149041.jpg?alt=media&token=62bd1a4f-78f6-4a94-b0b6-3b9ecbf27c8a"
                          alt="img"
                          className="jobs-selected-profile"
                        />
                        <p>{sessionStorage.getItem("name")}</p>
                        <StarRatingComponent starCount={5} value={4} />
                      </div>
                    </div>
                  </div>
                )
              )
            }
          </div>
        )}
      </div>
    );
  }
}
