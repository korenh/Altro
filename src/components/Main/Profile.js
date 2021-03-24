import React, { Component } from "react";
import firebase from "../protected/Firebase";
import EditIcon from "@material-ui/icons/Edit";
import StarRatingComponent from "react-star-rating-component";
import UserContext from "../protected/UserContext";
import Editprofile from "./Editprofile";

export default class Profile extends Component {

  static contextType = UserContext;

  state = { user: {}, EME: undefined, EMR: undefined, editMode: false };

  componentDidMount() {
    firebase.firestore().collection("users").doc(sessionStorage.getItem("uid")).get().then((doc) => {
        this.setState({user: doc.data(),EME: doc.data().employeeRating.sumOfRatings,EMR: doc.data().employerRating.sumOfRatings});
    });
  }


  render() {
    const { lang } = this.context;
    return (
      <div className="profile">
        <div className="profile-head">
          {this.state.editMode ? (<Editprofile user={this.state.user} editProfile={()=>this.setState({ editMode: !this.state.editMode })}/>) : ("")}
          <img src={sessionStorage.getItem("url")} alt="img" className="profile-pic"/>
          <p style={{ lineHeight: "0", fontSize: "17px" }}>{this.state.user.name}</p>
          <button className="profile-button" onClick={() => this.setState({ editMode: !this.state.editMode})}>
            <EditIcon style={{ color: "rgb(45, 123, 212)", fontSize: 14 }} />{lang ? "ערוך פרופיל" : "Edit Profile"}
          </button>
          <p style={{ lineHeight: "0", fontSize: "17px", textAlign: "left" }}>{lang ? "על עצמי" : "About me"}</p>
          <p style={{ fontSize: "14px", textAlign: "left" }}>{this.state.user.description}</p>
          <p style={{ lineHeight: "0", fontSize: "17px", textAlign: "left" }}>{lang ? "דירוג" : "Rating"}</p>
          <StarRatingComponent starCount={5} value={Math.round(((this.state.EME + this.state.EMR) / 2) * 10) / 10}/>
          <div className="profile-flex-info">
            <div>
              <p style={{fontSize: "15px",fontWeight: "bold",marginLeft: "10px"}}>{Math.round(this.state.EME * 10) / 10}</p>
              <p style={{ fontSize: "12px" }}>{lang ? "עובד" : "Employee"}</p>
            </div>
            <div>
              <p style={{fontSize: "15px",fontWeight: "bold",marginLeft: "10px",}}>{Math.round(this.state.EMR * 10) / 10}</p>
              <p style={{ fontSize: "12px" }}>{lang ? "מעסיק" : "Employer"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
