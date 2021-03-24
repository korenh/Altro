import "./Signup.css";
import Altro from "./icons/altro.png";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import React, { Component } from "react";
import DatePicker from "react-datepicker";
import firebase from "../protected/Firebase";
import "react-toastify/dist/ReactToastify.css";
import { storage } from "../protected/Firebase";
import "react-datepicker/dist/react-datepicker.css";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

export default class Signup extends Component {

  state = {
    asa: ["Individual", "Business"],
    asastate: "Business",
    userDate: new Date(),
    name: "",
    isBusiness: true,
    isVerified: false,
    description: [],
    selectedfile: null,
  };

  handleRegister = (e) => {
    e.preventDefault();
    let email = e.target.elements.email.value;
    let password = e.target.elements.password.value;
    let confirm = e.target.elements.confirm.value;
    let name = e.target.elements.name.value;
    let description = e.target.elements.description.value;
    let phone = e.target.elements.phone.value;

    if (password.length < 6) {toast.configure();toast.error("Password length must be bigger then 6", {autoClose: 2000}); return;}
    if (password !== confirm) { toast.configure();toast.error("Passwords do not match", {autoClose: 2000}); return; }
    if (name === "" || description === "") {toast.configure();toast.error("Fill all fields", {autoClose: 2000,}); return;}
    if (phone.length <= 8) { toast.configure(); toast.error("Phone number length must be bigger then 8",{autoClose: 2000,}); return;}
    if (!email.includes("@")) { toast.configure();toast.error("Email is invalid", {autoClose: 2000,}); return;}
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((response) => {
        this.setState({ popUp2: false });
        firebase.firestore().collection("users").doc(response.user.uid).set({
            uid: response.user.uid,
            name,
            profileImageURL: sessionStorage.getItem("imgurl") ? sessionStorage.getItem("imgurl") : "https://firebasestorage.googleapis.com/v0/b/altro-db7f0.appspot.com/o/users%2F1593953149041.jpg?alt=media&token=62bd1a4f-78f6-4a94-b0b6-3b9ecbf27c8a",
            phone,
            isBusiness: this.state.isBusiness,
            isVerified: false,
            employeeRating: { numberOfRatings: 0, sumOfRatings: 0 },
            employerRating: { numberOfRatings: 0, sumOfRatings: 0 },
            description,
            birthDate: this.state.userDate,
            fcmToken: "",
          })
          .then((ref) => {
            toast.configure();
            toast.success("Signed up", {autoClose: 2000,});
            return;
          });
          this.props.history.push("/");
      })
      .catch(function (error) {
        toast.configure();
        toast.error("Somthing went wrong", {autoClose: 2000,});
        return;
      });
  };

  
  fileselecthandler = (e) => {
    const uploadTask = storage.ref(`/users/${e.target.files[0].name}`).put(e.target.files[0]);
    toast.configure();
    toast.warning("Upload...", {autoClose: 5000});
    uploadTask.on("state_changed",
      (snapshot) => {let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100},
      (error) => {},
      () => {uploadTask.snapshot.ref.getDownloadURL().then((url) => { sessionStorage.setItem("imgurl", url)});
      }
    );
  };


  render() {
    return (
      <div className="signup">
        <div className="signup-header">
          <img src={Altro} alt="img" style={{ height: "40px" }} />
        </div>
        <form className="signup-form" onSubmit={this.handleRegister}>
          <br />
          <p> I will be primarily using Altro as a</p>
          <div className="signup-type-list">
          {this.state.asa.map((tag) => tag === this.state.asastate ? (
              <span key={tag} className="signup-hours-list-item2" onClick={() =>this.setState({ isBusiness: true, asastate: tag })}>{tag}</span>
              ) : (
              <span key={tag} className="signup-hours-list-item" onClick={() =>this.setState({ isBusiness: false, asastate: tag })}>{tag}</span>
              )
          )}
          </div>
          <br />
          <label htmlFor="file-input" style={{ cursor: "pointer" }}><AccountCircleIcon style={{ fontSize: 100, color: "rgb(45, 123, 212)" }}/></label>
          <input style={{ display: "none" }} id="file-input" type="file" onChange={this.fileselecthandler}
          />
          <br />
          <p>Add profile picture(optional)</p>
          <br />
          <input className="signup-inp" placeholder="   Email" name="email"/>
          <br />
          <input className="signup-inp"placeholder="   Password" name="password"/>
          <br />
          <input className="signup-inp" placeholder="   Confirm Password" name="confirm"/>
          <br />
          <input className="signup-inp" placeholder="   Phone Number" name="phone"/>
          <br />
          <input className="signup-inp" placeholder="   Name/Business Name" type="text" name="name"/>
          <br />
          <p className="signup-inp" style={{ padding: "0" }}> <DatePicker selected={this.state.userDate} onChange={date => this.setState({userDate: date})} className="signup-inp2"/></p>
          <textarea placeholder="   Write about your self/business" className="signup-inp" type="text" name="description"/>
          <br />
          <br /> <span>Already have an acoount?</span>
          <Link to="/" className="signup-link">Sign in</Link>
          <br />
          <br />
          <span>I agree to Altro's</span>
          <Link to="/" className="signup-link">Terms of service</Link>
          <br />
          <span>and</span>
          <Link to="/" className="signup-link">Privacy Policy</Link>
          <br /> <button className="signup-btn">Sign up</button>
        </form>
      </div>
    );
  }
}
