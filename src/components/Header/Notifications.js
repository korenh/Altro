import React, { Component } from "react";
import firebase from "../Functions/Firebase";
import Check from "@material-ui/icons/CheckCircle";
import ClearIcon from "@material-ui/icons/Clear";
import CancelIcon from "@material-ui/icons/Cancel";
import StarsIcon from "@material-ui/icons/Stars";
import ErrorIcon from "@material-ui/icons/Error";
import HelpIcon from "@material-ui/icons/Help";
import ReviewEmployee from "../Main/components/ReviewEmployee";
import UserContext from "../Functions/UserContext";

export default class Notifications extends Component {
  static contextType = UserContext;

  state = {
    notifications: [],
    reviewPop: false,
    jobdata: {},
  };

  componentDidMount() {
    this.getData();
  }

  deleteAllNotification = () => {
    alert("deleteAll");
  };

  deleteNotification = (notification) => {
    firebase.firestore().collection("notifications").doc(notification.id).delete();
    let notifications = this.state.notifications.filter((obj)=> {return obj.id !== notification.id});
    this.setState({notifications})
  };

  getData = (async) => {
    const allData = [];
    firebase
      .firestore().collection("notifications").where("toUser", "==", sessionStorage.getItem("uid")).orderBy("date", "desc").limit(10).get()
      .then((snapshot) => {snapshot.docs.forEach((doc) => {
          const data = {
            id: doc.id,
            date:doc.data().date.toDate().toDateString() +" " +doc.data().date.toDate().toLocaleTimeString("en-US"),
            fromUser: doc.data().fromUser,
            fromUsername: doc.data().fromUsername,
            jobId: doc.data().jobId,
            notificationType: doc.data().notificationType,
            toUser: doc.data().toUser,
          };
          allData.push(data);
        });
        this.setState({ notifications: allData });
      });
  };

  jobFinished = (notification) => {
    this.setState({ reviewPop: !this.state.reviewPop, jobdata: notification });
  };

  render() {
    const { lang } = this.context;
    return (
      <div className="notifications">
        <button className="notifications-clear-all" onClick={() => this.deleteAllNotification()}>{lang ? "ניקוי כל ההתרראות" : "Clear All notification"}</button>
        {this.state.reviewPop ? (<ReviewEmployee jobFinished={this.jobFinished} job={this.state.jobdata} />) : ("")}
        {this.state.notifications.map((notification) => 
              notification.notificationType === "jobFinished" ? (
            <div className="card-notification" key={notification.id} onClick={() => this.jobFinished(notification)}>
              <Check style={{color: "rgb(49, 145, 70)",fontSize: 40,margin: "auto 5px"}}/>
              <div style={{ marginLeft: "5px" }}className="notifications-div-info">
                <p className="notifications-status">{notification.fromUsername} has marked a job you attended as finished.</p>
                <p className="notifications-time">{notification.date}</p>
                <ClearIcon style={{ fontSize: 17 }} onClick={() => this.deleteNotification(notification)} className="notifications-delete"/>
              </div>
            </div> 
          ) : notification.notificationType === "acceptedToJob" ? (
            <div className="card-notification" key={notification.id}>
              <Check style={{color: "rgb(45, 123, 212)",fontSize: 40,margin: "auto 5px"}}/>
              <div style={{ marginLeft: "5px" }}className="notifications-div-info">
                <p className="notifications-status">{notification.fromUsername} has accepted you to his job</p>
                <p className="notifications-time">{notification.date}</p>
                <ClearIcon style={{ fontSize: 17 }} onClick={() => this.deleteNotification(notification)} className="notifications-delete"/>
              </div>
            </div> 
          ) : notification.notificationType === "jobCancelled" ? (
            <div className="card-notification" key={notification.id}>
              <CancelIcon style={{ color: "red",fontSize: 40,margin: "auto 5px",}}/>
              <div style={{ marginLeft: "5px" }}className="notifications-div-info">
                <p className="notifications-status">{notification.fromUsername} has deleted a job you were attending. The job is no longer available.</p>
                <p className="notifications-time">{notification.date}</p>
                <ClearIcon style={{ fontSize: 17 }} onClick={() => this.deleteNotification(notification)} className="notifications-delete"/>
              </div>
            </div>
          ) : 
          notification.notificationType === "newRequest" ? (
            <div className="card-notification" key={notification.id}>
              <HelpIcon style={{color: "rgb(194, 172, 48)",fontSize: 40,margin: "auto 5px",}}/>
              <div style={{ marginLeft: "5px" }} className="notifications-div-info">
                <p className="notifications-status">{notification.fromUsername} has requested your job</p>
                <p className="notifications-time">{notification.date}</p>
                <ClearIcon style={{ fontSize: 17 }}onClick={() => this.deleteNotification(notification)} className="notifications-delete"/>
              </div>
            </div>
          ) : 
          notification.notificationType === "userConfirmed" ? (
            <div className="card-notification" key={notification.id}>
              <StarsIcon style={{color: "rgb(45, 123, 212)",fontSize: 40,margin: "auto 5px"}}/>
              <div style={{ marginLeft: "5px" }}className="notifications-div-info">
                <p className="notifications-status">{notification.fromUsername} has confirmed his participation in your job</p>
                <p className="notifications-time">{notification.date}</p>
                <ClearIcon style={{ fontSize: 17 }}onClick={() => this.deleteNotification(notification)}className="notifications-delete"/>
              </div>
            </div>
          ) : 
          notification.notificationType === "userLeft" ? (
            <div className="card-notification" key={notification.id}>
              <ErrorIcon style={{color: "red",fontSize: 40,margin: "auto 5px"}}/>
              <div style={{ marginLeft: "5px" }}className="notifications-div-info">
                <p className="notifications-status">{notification.fromUsername} has left your job</p>
                <p className="notifications-time">{notification.date}</p>
                <ClearIcon style={{ fontSize: 17 }}onClick={() => this.deleteNotification(notification)}className="notifications-delete"/>
              </div>
            </div>
          ) : 
          notification.notificationType === "removedFromJob" ? (
            <div className="card-notification" key={notification.id}>
              <ErrorIcon style={{color: "red",fontSize: 40,margin: "auto 5px"}}/>
              <div style={{ marginLeft: "5px" }}className="notifications-div-info">
                <p className="notifications-status">{notification.fromUsername} has removed you from his job.</p>
                <p className="notifications-time">{notification.date}</p>
                <ClearIcon style={{ fontSize: 17 }} onClick={() => this.deleteNotification(notification)}className="notifications-delete"/>
              </div>
            </div>
          ) : (""))}
      </div>
    );
  }
}
