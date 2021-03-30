import React, { Component } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import Mapselect from "./components/Mapselect"
import ArchiveIcon from "@material-ui/icons/Archive";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { addNotification } from "../Functions/helper";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ChatIcon from "@material-ui/icons/Chat";
import DeleteIcon from "@material-ui/icons/Delete";
import GroupIcon from "@material-ui/icons/Group";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import EditIcon from "@material-ui/icons/Edit";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import Review from "./components/Review";
import Editjob from "./components/Editjob";
import firebase from "../Functions/Firebase";
import { Link } from "react-router-dom";
import ReactMapGL, { Marker } from "react-map-gl";
import DatePicker from "react-datepicker";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import DirectionsCarIcon from "@material-ui/icons/DirectionsCar";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import AccessibilityNewIcon from "@material-ui/icons/AccessibilityNew";
import SendIcon from "@material-ui/icons/Send";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import StarRatingComponent from "react-star-rating-component";
import UserContext from "../Functions/UserContext";
import config from '../../config.json'

export default class Jobs extends Component {
  static contextType = UserContext;

  state = {
    docState: {},
    job: {},
    jobdash: {},
    hours: [
      { id: 1, name: "< 3hrs" },
      { id: 2, name: "< 6hrs" },
      { id: 3, name: "< 12hrs" },
      { id: 4, name: "< 1d" },
      { id: 5, name: "1d +" },
    ],
    title: "",
    hour: { id: 1, name: "< 3hrs" },
    description: "",
    numberRequired: 0,
    payment: 0,
    endDate: new Date(),
    startDate: new Date(),
    jobs: [],
    time: "null",
    hourly: false,
    transportation: false,
    agree: false,
    popUp: false,
    popUp2: false,
    jobDashboard: false,
    jobChat: false,
    editJob: false,
    reviewJob: false,
    lat: undefined,
    lng: undefined,
    location: [],
    listCategories: [],
    stringCategories: [],
    indexCategories: [],
    allLocations: [],
    uploadType: true,
  };

  handleEnd = (date) => {
    this.setState({
      endDate: date,
    });
  };

  handleStart = (date) => {
    this.setState({
      startDate: date,
    });
  };

  getCoord = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({ lat: position.coords.latitude });
      this.setState({ lng: position.coords.longitude });
    });
  };

  Continue = () => {
    if (
      this.state.title === "" ||
      this.state.description === "" ||
      this.state.payment === 0 ||
      this.state.numberRequired === 0
    ) {
      toast.configure();
      toast.error("Fill all fields", {
        autoClose: 2000,
      });
      return;
    } else {
      if (this.state.title.length > 40) {
        toast.configure();
        toast.error("Title length cannot be bigger then 40 ", {
          autoClose: 2000,
        });
        return;
      }
      this.setState({ popUp: false, popUp2: true });
    }
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

  componentDidMount() {
    this.getData();
    this.getCoord();
    axios
      .get(
        "https://altro-db7f0.firebaseio.com/1aApDYbB7SthmUtMckqzGAbiRe2mvWiN4Tu5AIOfFCuA/categories.json"
      )
      .then((response) => {
        this.setState({ listCategories: response.data });
      });
    axios
      .get("https://altro-db7f0.firebaseio.com/config/manualApproval.json")
      .then((response) => {
        this.setState({ uploadType: response.data });
      });
  }

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

  getData = () => {
    const allData = [];
    const allLocations = [];
    firebase
      .firestore()
      .collection("jobs")
      .orderBy("dateCreated", "desc")
      .limit(20)
      .where("creatingUserId", "==", sessionStorage.getItem("uid"))
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = {
            id: doc.id,
            title: doc.data().title,
            geo: doc.data().location,
            description: doc.data().description,
            dateCreated: doc.data().dateCreated,
            acceptedUsers: doc.data().acceptedUsers,
            confirmedUsers: doc.data().confirmedUsers.confirmingUserId,
            creatingUserId: doc.data().creatingUserId,
            duration: doc.data().duration,
            requiredEmployees: doc.data().requiredEmployees,
            payment: doc.data().payment,
            startDate: doc.data().startDate,
            location: doc.data().location,
            categories: doc.data().stringCategories,
            km: this.calcCrow(doc.data().location.Ba, doc.data().location.Oa),
            requests: doc.data().requests,
            acceptedIds: doc.data().acceptedIds,
            confirmedIds: doc.data().confirmedIds,
            viewport: {
              latitude: doc.data().location.Oa,
              longitude: doc.data().location.Ba,
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
              this.setState({ allLocations});
            });
          allData.push(data);
        });
        this.setState({ jobs: allData });
      });
  };

  addJob = () => {
    if (this.state.agree === false) {
      alert("Please accept Terms of Services & Privacy Policy");
      return;
    }

    this.setState({ popUp2: false });
    firebase
      .firestore()
      .collection(this.state.uploadType ? "pendingJobs" : "jobs")
      .add({
        id: "fff",
        creatingUserId: sessionStorage.getItem("uid"),
        dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
        title: this.state.title,
        description: this.state.description,
        stringCategories: this.state.stringCategories,
        categories: this.state.indexCategories,
        payment: this.state.payment,
        isPaymentPerHour: this.state.hourly,
        isPayingForTransportation: this.state.transportation,
        requiredEmployees: this.state.numberRequired,
        duration: this.state.hour.id,
        numberOfSaves: 0,
        numberOfViews: 0,
        savedIds: [],
        location: new firebase.firestore.GeoPoint(
          this.state.lat,
          this.state.lng
        ),
        shouldUseCustomTime: true,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        acceptedIds: [],
        confirmedIds: [],
        acceptedUsers: [],
        confirmedUsers: [],
        requests: [],
      })
      .then((docRef) => {
        this.setState({ popUp2: false });
        firebase.firestore().collection("jobs").doc(docRef.id).update({
          id: docRef.id,
        });
        toast.configure();
        this.setState({ agree: false });
        toast.info("New job added!", { autoClose: 2000 });
        setTimeout(() => {
          this.getData();
        }, 1);
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

  Dashboard = (job) => {
    this.setState({ jobDashboard: !this.state.jobDashboard, jobdash: job });
  };

  Chat = (job) => {
    this.setState({ jobChat: !this.state.jobChat, jobdash: job });
  };

  Editjob = (job) => {
    this.setState({ editJob: !this.state.editJob, jobdash: job });
  };

  deleteJob = (job) => {
    let docRef = firebase.firestore().collection("jobs").doc(job.id);
    docRef.get().then((doc) => {
      doc.data().confirmedIds.forEach((id) => {
        addNotification({
          date: firebase.firestore.Timestamp.fromDate(new Date()),
          fromUser: sessionStorage.getItem("uid"),
          fromUsername: sessionStorage.getItem("name"),
          jobId: job.id,
          notificationType: "jobCancelled",
          toUser: id,
        });
      });
      this.setState({ jobDashboard: false });
      firebase.firestore().collection("jobs").doc(job.id).delete();
      axios
        .delete(`https://altro-db7f0.firebaseio.com/chats/${job.id}.json`)
        .then((res) => {
          console.log("Deleted");
          try {
            console.log("error");
          } catch {
            console.log("error");
          }
        });
      setTimeout(() => {
        this.getData();
      }, 1);
    });
  };

  FinishJob = (job) => {
    let docRef = firebase.firestore().collection("jobs").doc(job.id);
    docRef.get().then((doc) => {
      doc.data().confirmedIds.forEach((id) => {
        addNotification({
          date: firebase.firestore.Timestamp.fromDate(new Date()),
          fromUser: sessionStorage.getItem("uid"),
          fromUsername: sessionStorage.getItem("name"),
          jobId: job.id,
          notificationType: "jobFinished",
          toUser: id,
        });
      });
      this.setState({
        reviewJob: !this.state.reviewJob,
        jobdash: job,
        docState: doc.data(),
      });
      axios
        .delete(`https://altro-db7f0.firebaseio.com/chats/${job.id}.json`)
        .then((res) => {
          console.log("Deleted");
          try {
            console.log("error");
          } catch {
            console.log("error");
          }
        });
      setTimeout(() => {
        this.getData();
      }, 1);

      this.setState({ jobDashboard: false });
    });
  };

  ReviewJob = () => {
    this.setState({ reviewJob: !this.state.reviewJob });
    setTimeout(() => {
      this.getData();
    }, 1);
  };

  parentCallback = (e) => {
    this.setState({
      lat: e[1],
      lng: e[0],
    });
  };

  addStringcategories = (v) => {
    const indexCategories = this.state.indexCategories;
    const stringCategories = this.state.stringCategories;
    if (stringCategories.includes(v.en) || stringCategories.length === 5) {
      return;
    }
    stringCategories.push(v.en);
    indexCategories.push(v.index);
    this.setState({ stringCategories, indexCategories });
  };

  render() {
    const { lang } = this.context;

    return (
      <div>
        <div className="myjobs-main-head-flex">
          <p
            className="job-top-flex-p"
            onClick={() => this.setState({ popUp: true, popUp2: false })}
            style={{ color: "rgb(45, 123, 212)" }}
          >
            <AddCircleIcon
              style={{ color: "rgb(45, 123, 212)", fontSize: 15 }}
            />
            {lang ? "הוסף" : "New Job"}
          </p>
          <p className="job-top-flex-p" style={{ color: "rgb(45, 123, 212)" }}>
            <ArchiveIcon style={{ color: "rgb(45, 123, 212)", fontSize: 15 }} />
            {lang ? "ארכיון" : "Archive"}
          </p>
        </div>
        {this.state.reviewJob ? (
          <div className="dashboard-card">
            <Review
              job={this.state.jobdash}
              doc={this.state.docState}
              getData={this.getData}
              ReviewJob={this.ReviewJob}
            />
          </div>
        ) : (
          ""
        )}
        <div className="jobs">
          <br />
          <br />
          {this.state.editJob ? (
            <div className="dashboard-card">
              <Editjob
                job={this.state.jobdash}
                Editjob={this.Editjob}
                getData={this.getData}
              />
            </div>
          ) : (
            ""
          )}
          {this.state.jobDashboard ? (
            <div className="dashboard-card">
              <Dashboard
                job={this.state.jobdash}
                jobDashboard={this.state.jobDashboard}
                Dashboard={this.Dashboard}
                deleteJob={this.deleteJob}
              />
            </div>
          ) : (
            ""
          )}
          {this.state.jobChat ? (
            <div className="dashboard-card">
              <Chat job={this.state.jobdash} Chat={this.Chat} />
            </div>
          ) : (
            ""
          )}
          <br />
          {this.state.popUp ? (
            <div
              className="new-job"
              style={lang ? { textAlign: "right", direction: "rtl" } : {}}
            >
              <HighlightOffIcon
                onClick={() => this.setState({ popUp: false, popUp2: false })}
                className="newjob-close-btn"
                alt="img"
                style={{ fontSize: 40, color: "rgb(45, 123, 212)" }}
              />

              <h2>{lang ? "פרסם עבודה" : "New Job"}</h2>
              <input
                type="text"
                placeholder={lang ? "שם העבודה" : "Job Title"}
                className="new-job-input"
                defaultValue={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
              <br />
              <textarea
                type="text"
                placeholder={
                  lang
                    ? "מידע ודרישות לעבודה"
                    : "Job Description & Requirements"
                }
                className="new-job-textarea"
                defaultValue={this.state.description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
              <br />
              <p>
                {lang
                  ? "בחר 5 קטגוריות בהתאם לעבודה"
                  : "Pick up to 5 categories which your job applies."}
              </p>
              <div className="jobs-card-tags">
                {this.state.listCategories.map((v) => (
                  <span
                    className="newjob-tag-list-item"
                    key={v.index}
                    onClick={() => this.addStringcategories(v)}
                  >
                    {lang ? "#" + v.he : "#" + v.en}
                  </span>
                ))}
              </div>
              <div className="jobs-card-tags">
                {this.state.stringCategories.map((v) => (
                  <span className="jobs-new-card-tag-item" key={v}>
                    #{v}
                  </span>
                ))}
              </div>
              <p>
                {lang
                  ? "בחר כמות עובדים הנדרשת לעבודה"
                  : "How many employees requires for the job?"}
              </p>
              <div className="newjob-number-flex">
                <p
                  className="newjob-plus-button"
                  onClick={() =>
                    this.setState({
                      numberRequired: this.state.numberRequired + 1,
                    })
                  }
                >
                  +
                </p>
                <p className="newjob-required">{this.state.numberRequired}</p>
                <p
                  className="newjob-minus-button"
                  onClick={() =>
                    this.setState({
                      numberRequired: this.state.numberRequired - 1,
                    })
                  }
                >
                  -
                </p>
              </div>
              <p>
                {lang
                  ? "זמן צפוי למשך העבודה"
                  : "What is approximated job duration?"}
              </p>
              <div className="newjob-hours-list">
                {this.state.hours.map((tag) =>
                  this.state.hour.id === tag.id ? (
                    <span key={tag.id} className="newjob-hours-list-item2">
                      {tag.name}
                    </span>
                  ) : (
                    <span
                      key={tag.id}
                      className="newjob-hours-list-item"
                      onClick={() => this.setState({ hour: tag })}
                    >
                      {tag.name}
                    </span>
                  )
                )}
              </div>
              <h3>{lang ? "מידע לתשלום" : "Payment infornmation"}</h3>
              <p>
                {lang
                  ? "תשלום עבודה לכל עובד"
                  : "How much will you pay for the job (per emplyee)?"}
              </p>
              <div className="newjob-number-flex">
                <p
                  className="newjob-plus-button"
                  onClick={() =>
                    this.setState({
                      payment: this.state.payment + 5,
                    })
                  }
                >
                  +
                </p>
                <p className="newjob-required">{this.state.payment}₪</p>
                <p
                  className="newjob-minus-button"
                  onClick={() =>
                    this.setState({
                      payment: this.state.payment - 5,
                    })
                  }
                >
                  -
                </p>
              </div>
              <input
                type="checkbox"
                style={{ fontSize: "20px" }}
                onChange={(e) => this.setState({ hourly: !this.state.hourly })}
              />
              <span>{lang ? "תשלום שעתי" : "Payment is hourly"}</span>
              <br />
              <br />
              <input
                type="checkbox"
                style={{ fontSize: "20px" }}
                onChange={(e) =>
                  this.setState({ transportation: !this.state.transportation })
                }
              />
              <span>
                {lang
                  ? " משלם הוצאות תחבורה"
                  : " I shall be paying for emplyers transportation fees"}
              </span>
              <h3>{lang ? "איפה ומתי" : " When & Where"}</h3>
              <p>{lang ? "מתי העבודה" : "When is the job taking time"}</p>
              <DatePicker
                selected={this.state.endDate}
                onChange={this.handleEnd}
                className="jobs-datepicker"
              />
              <span> {lang ? "בחר תאריך סיום" : "Select End date "}</span>
              <br />
              <DatePicker
                selected={this.state.startDate}
                onChange={this.handleStart}
                className="jobs-datepicker"
              />
              <span>{lang ? "בחר תאריך התחלה" : " Select Start time "}</span>

              <p>{lang ? "היכן העבודה" : "Where is the job taking place"}</p>
              <p>
                {lang
                  ? "מיקום נוכחי הוא ברירת מחדל*"
                  : "*Current location is Default"}
              </p>
              <br />
              <br />
              <Mapselect
                lat={this.state.lat}
                lng={this.state.lng}
                parentCallback={this.parentCallback}
              />
              <br />
              <br />
              <button onClick={() => this.Continue()} className="sign-btn">
                {lang ? "המשך" : "Continue"}
              </button>
            </div>
          ) : (
            ""
          )}
          {this.state.popUp2 ? (
            <div
              className="new-job"
              style={lang ? { textAlign: "right", direction: "rtl" } : {}}
            >
              <ChevronLeftIcon
                onClick={() => this.setState({ popUp: true, popUp2: false })}
                className="newjob-back-btn"
                alt="img"
                style={{ color: "white", fontSize: 40 }}
              />
              <h2> {lang ? "אישור פרטים" : "Confirm detailes"}</h2>
              <p>
                {lang
                  ? "אנא וודא שכל הפרטים שהזנת נכונים . במידה ולא , תוכל לחזור אחורה לעריכת המידע"
                  : "Please review the details of your job before posting it. you may go back and edit details if necessary."}
              </p>
              <div className="new-job-details">
                <p>
                  Title: <span> {this.state.title} </span>
                </p>
                <p>
                  Description/Requirements:{" "}
                  <span> {this.state.description} </span>
                </p>
                <p>Categories: </p>
                <p>
                  Number of workers: <span> {this.state.numberRequired} </span>
                </p>
                <p>
                  Estimated duration: <span>{this.state.hour.name}</span>
                </p>
                <p>
                  Payment:
                  <span>
                    ₪{this.state.payment} {this.state.hourly ? "hourly" : ""}
                  </span>
                </p>
                <p>
                  Covering transportation fees:
                  <span> {this.state.transportation ? "yes" : "no"} </span>
                </p>
                <p>
                  Date: <span>{this.state.startDate.toString()}</span>
                </p>
                <p>
                  Time: <span>{this.state.time}</span>{" "}
                </p>
                <p>Location: </p>
              </div>
              <div>
                <input
                  type="checkbox"
                  style={{ fontSize: "20px" }}
                  onChange={(e) => this.setState({ agree: !this.state.agree })}
                />
                <span>{lang ? "אני מסכים לאלטרו" : "I agree to Altro's"} </span>
                <Link to="/" className="sign-link">
                  Terms of Services & Employment
                </Link>
                <br />
                <span>and</span>
                <Link to="/" className="sign-link ">
                  Privacy Policy
                </Link>
              </div>
              <br />
              <button onClick={() => this.addJob()} className="sign-btn">
                {lang ? "פרסום" : "Publish Job"}
              </button>
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
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    justifyContent: "space-evenly",
                    lineHeight: "0",
                    background: "rgb(240,240,240)",
                    borderRadius: "5px",
                  }}
                >
                  <p>
                    <SendIcon
                      style={{
                        textAlign: "center",
                        color: "rgb(45, 123, 212)",
                        fontSize: 25,
                      }}
                    />
                    {job.requests.length}
                  </p>

                  <p>
                    <CheckCircleIcon
                      style={{
                        textAlign: "center",
                        color: "rgb(45, 123, 212)",
                        fontSize: 25,
                      }}
                    />
                    {job.acceptedIds.length}
                  </p>

                  <p>
                    <VerifiedUserIcon
                      style={{
                        textAlign: "center",
                        color: "rgb(45, 123, 212)",
                        fontSize: 25,
                      }}
                    />
                    {job.confirmedIds.length}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="jobs-selected-card"
                key={job.description}
                onClick={() => this.jobPopUp(job)}
              >
                <ReactMapGL {...job.viewport} mapboxApiAccessToken={config.MAPBOX_TOKEN}mapStyle={config.MAPBOX_STYLE}
                  pitch="60"
                  bearing="-60"
                >
                  <Marker
                    offsetTop={-48}
                    offsetLeft={-24}
                    latitude={job.geo.Oa}
                    longitude={job.geo.Ba}
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
                    <p className="jobs-selected-desc">{job.description}</p>
                    <div className="jobs-selected-flex">
                      <div>
                        <QueryBuilderIcon
                          className="jobs-selected-flex-img"
                          style={{ fontSize: 40, color: "white" }}
                        />
                        <p>
                          {
                            this.state.hours.find((o) => o.id === job.duration)
                              .name
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
                      <p style={{ lineHeight: "0" }}>
                        {lang ? "ניהול העבודה" : "Manage your job"}
                      </p>
                      <br />
                      <button className="jobs-selected-boost-button">
                        <ArrowUpwardIcon
                          style={{ color: "rgb(45, 123, 212)", fontSize: 14 }}
                        />
                        {lang ? "שיפור" : "Boost"}
                      </button>
                      <br />
                      <button
                        className="jobs-selected-save-button"
                        onClick={() => this.Dashboard(job)}
                      >
                        <GroupIcon
                          style={{ color: "rgb(45, 123, 212)", fontSize: 14 }}
                        />
                        {lang ? "ניהול" : "Manage"}
                      </button>
                      <br />
                      <button
                        className="jobs-selected-save-button"
                        onClick={() => this.Editjob(job)}
                      >
                        <EditIcon
                          style={{ color: "rgb(45, 123, 212)", fontSize: 14 }}
                        />
                        {lang ? "עריכה" : "Edit"}
                      </button>
                      <br />
                      <button
                        className="jobs-selected-save-button"
                        onClick={() => this.Chat(job)}
                      >
                        <ChatIcon
                          style={{ color: "rgb(45, 123, 212)", fontSize: 14 }}
                        />
                        {lang ? "הודעות" : "Chat"}
                      </button>
                      <br />
                      <button
                        className="jobs-selected-finish-button"
                        onClick={() => this.FinishJob(job)}
                      >
                        <CheckCircleIcon
                          style={{ color: "white", fontSize: 14 }}
                        />
                        {lang ? "סיום" : "Finish Job"}
                      </button>
                      <br />
                      <button
                        className="jobs-selected-delete-button"
                        onClick={() => this.deleteJob(job)}
                      >
                        <DeleteIcon style={{ color: "white", fontSize: 14 }} />
                        {lang ? "מחיקה" : "Delete Job"}
                      </button>
                    </div>
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/altro-db7f0.appspot.com/o/users%2F1593953149041.jpg?alt=media&token=62bd1a4f-78f6-4a94-b0b6-3b9ecbf27c8a"
                      alt="img"
                      className="jobs-selected-profile"
                    />
                    <p style={{ lineHeight: "0" }}>
                      {sessionStorage.getItem("name")}
                    </p>
                    <StarRatingComponent starCount={5} value={4} />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
}
