import "./Sign.css";
import Altro from "./altro.png";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import React, { Component } from "react";
import firebase from "../functions/Firebase";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "../functions/UserContext";

export default class Signin extends Component {
  
  static contextType = UserContext;

  componentDidMount() {
    const { setUser } = this.context;
    if (localStorage.getItem("altro_jwt") === null) return
    firebase.firestore().collection("users").where("uid", "==", localStorage.getItem("altro_jwt")).get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          sessionStorage.setItem("uid", doc.data().uid);
          sessionStorage.setItem("name", doc.data().name);
          sessionStorage.setItem("url", doc.data().profileImageURL);
          sessionStorage.setItem("description", doc.data().description);
          setUser(doc.data().uid,doc.data().name,doc.data().profileImageURL,doc.data().description);
        });
      });
      this.props.history.push("/main/jobs");
      setTimeout(() => {this.props.history.push("/main/jobs")}, 2000);
  }

  handleLogin = (e) => {
    e.preventDefault();
    const { setUser } = this.context;
    firebase.auth().signInWithEmailAndPassword(e.target.elements.email.value, e.target.elements.password.value)
      .then((response) => {firebase.firestore().collection("users").where("uid", "==", response.user.uid).get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              sessionStorage.setItem("uid", doc.data().uid);
              sessionStorage.setItem("name", doc.data().name);
              sessionStorage.setItem("url", doc.data().profileImageURL);
              sessionStorage.setItem("description", doc.data().description);
              localStorage.setItem("altro_jwt", doc.data().uid);
              setUser(doc.data().uid,doc.data().name,doc.data().profileImageURL,doc.data().description);
            });
          });
        this.props.history.push("/main/jobs");
        setTimeout(() => {this.props.history.push("/main/jobs")}, 1000);
      })
      .catch((error) => {
        toast.configure();
        toast.error(error.message, {autoClose: 2000});
      });
  };

  render() {
    return (
      <div style={{textAlign:'center'}}>
        <div className="signin-header">
          <img src={Altro} alt="img" style={{ height: "40px" }} />
          <p>Single jobs for everyone , <br /> by everyone</p>
        </div>
        <div className="signin-body"></div>
        <form className="sign-form" onSubmit={this.handleLogin}>
          <input type="mail" placeholder="Email" className="sign-inp" name="email" />
          <input type="password" placeholder="Password" className="sign-inp" name="password" />
          <button className="sign-btn">Sign in</button>
          <div className="signin-footer">
            <div className="signin-footer-top">
              <span>Dont have an acoount? </span>
              <Link to="/signup" className="sign-link">Sign up</Link>
              <br /><span>or </span>
              <a href="!#" className="sign-link">Continue as a guest</a>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
