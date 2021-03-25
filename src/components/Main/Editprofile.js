import React, { Component } from "react";
import UserContext from "../protected/UserContext";
import firebase from "../protected/Firebase";
import { toast } from "react-toastify";

export default class Editprofile extends Component {

  static contextType = UserContext;

  state = {
    name: this.props.user.name,
    phone: this.props.user.phone,
    description: this.props.user.description,
    profileImageURL: this.props.user.profileImageURL,
  };

  updateData = () => {
    sessionStorage.setItem("name", this.state.name);
    sessionStorage.setItem("description", this.state.description);
    firebase.firestore().collection("users").doc(this.props.user.uid).update({
      name: this.state.name,
      phone: this.state.phone,
      description: this.state.description
    });
    toast.configure();
    toast.success("Successfully updated", { autoClose: 2000 });
    this.props.editProfile();
  };

  render() {
    const { lang } = this.context;
    return (
      <div className="edit-profile" style={lang ? { direction: "rtl"} : {}}><div style={{width:'300px' , margin:'auto'}}>
        <img src={this.state.profileImageURL}alt="img"className="profile-pic"/>
        <input className="sign-inp"type="text"placeholder="Name"value={this.state.name}onChange={(e) => this.setState({ name: e.target.value })}/>
        <input className="sign-inp" type="text" placeholder="Phone" value={this.state.phone} onChange={(e) => this.setState({ phone: e.target.value })}/>
        <textarea className="sign-inp" type="text" placeholder="Description" value={this.state.description} onChange={(e) => this.setState({ description: e.target.value })}/>
        <button className="sign-btn" onClick={() => this.updateData()}>{lang ? "עדכון" : "Update"}</button>
        <button className="sign-btn" style={{ background: "red" }} onClick={() => this.props.editProfile()} >{lang ? "ביטול" : "Cancel"}</button>
      </div></div>
    );
  }
}
