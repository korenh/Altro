import "./Sign.css";
import Altro from "./altro.png";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import React, { Component } from "react";
import DatePicker from "react-datepicker";
import firebase from "../functions/Firebase";
import "react-toastify/dist/ReactToastify.css";
import { storage } from "../functions/Firebase";
import "react-datepicker/dist/react-datepicker.css";
import config from '../../config.json';
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default class Signup extends Component {

  state = {
    file:undefined,
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
    
    this.fileselecthandler()
    setTimeout(() => {      
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((response) => {
        this.setState({ popUp2: false });
        firebase.firestore().collection("users").doc(response.user.uid).set({
            uid: response.user.uid,
            name,
            profileImageURL: sessionStorage.getItem("imgurl") ? sessionStorage.getItem("imgurl") : config.FIREBASE_DEAFULT_IMG,
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
    }, 7000);
  };

  
  fileselecthandler = () => {
    const uploadTask = storage.ref(`/users/${this.state.file.file.name}`).put(this.state.file.file);
    toast.configure();
    toast.warning("Upload...", {autoClose: 7000});
    uploadTask.on("state_changed",
      (snapshot) => {console.log((snapshot.bytesTransferred / snapshot.totalBytes) * 100)},
      (error) => {},
      () => {uploadTask.snapshot.ref.getDownloadURL().then((url) => { sessionStorage.setItem("imgurl", url)});
      }
    );
  };


  render() {
    return (
      <div style={{textAlign:'center'}}>
        <div className="signup-header">
          <img src={Altro} alt="img" style={{ height: "40px" }} />
        </div>
        <form className="sign-form" onSubmit={this.handleRegister}><br/>
          <p> I will be primarily using Altro as a</p>
          <div className="sign-type-list">
          {this.state.asa.map((tag) => tag === this.state.asastate ? (
              <span key={tag} className="sign-list-item2" onClick={() =>this.setState({ isBusiness: true, asastate: tag })}>{tag}</span>
              ) : (
              <span key={tag} className="sign-list-item" onClick={() =>this.setState({ isBusiness: false, asastate: tag })}>{tag}</span>
              )
          )}
          </div><br/><br/>
          <p>Profile picture(optional)</p>
          <FilePond allowMultiple={false} allowReplace={false} onaddfile={(err, file) => this.setState({file})} onremovefile={(err, file) => {}}/>
          <input className="sign-inp" placeholder="Email" name="email"/>
          <input className="sign-inp"placeholder="Password" name="password"/>
          <input className="sign-inp" placeholder="Confirm Password" name="confirm"/>
          <input className="sign-inp" placeholder="Phone Number" name="phone"/>
          <input className="sign-inp" placeholder="Name/Business Name" type="text" name="name"/>
          <DatePicker style={{ width: '300px' }} selected={this.state.userDate} onChange={date => this.setState({userDate: date})} className="sign-inp"/>
          <textarea placeholder="   Write about your self/business" className="sign-inp" type="text" name="description"/><br/><br/>
          <span>Already have an acoount?</span>
          <Link to="/" className="sign-link">Sign in</Link><br/><br/>
          <span>I agree to Altro's</span>
          <Link to="/" className="sign-link">Terms of service</Link><br />
          <span>and</span>
          <Link to="/" className="sign-link">Privacy Policy</Link><br/>
          <button className="sign-btn">Sign up</button>
        </form>
      </div>
    );
  }
}
