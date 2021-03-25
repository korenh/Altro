import React, { Component } from "react";
import "./Main.css";
import Altro from "../sign/altro.png";
import Notifications from "./Notifications";
import Profile from "./Profile";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import MenuIcon from "@material-ui/icons/Menu";
import Switch from "@material-ui/core/Switch";
import UserContext from "../protected/UserContext";

export default class Header extends Component {
  static contextType = UserContext;

  state = {
    popup: false,
    notification: false,
    profile: false,
    menu: false,
    toggle: false,
  };

  logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("altro_jwt");
    this.props.history.push("/");
  };

  toggleSwitch = () => {
    const { lang, setLang } = this.context;
    this.setState({ toggle: !this.state.toggle });
    setLang(lang);
  };

  render() {
    const { lang } = this.context;
    return (
      <div className="header">
        <img src={Altro} alt="img" className="header-icon2" />
        <div className="header-flex">
          <div onClick={()=>this.setState({profile: !this.state.profile,notification: false,menu: false})}>
            <img src={sessionStorage.getItem("url")} alt="img"className="header-icon3"/>
            <p className="header-profile-name">{sessionStorage.getItem("name")}</p>
          </div>
          <NotificationsNoneIcon className="header-icon" onClick={()=>this.setState({notification: !this.state.notification,profile: false,menu: false})}
            style={this.state.notification? {fontSize: 35,color: "rgb(45, 123, 212)",transition: "0.5s",}: { fontSize: 35, transition: "0.5s" }}
          />
          <MenuIcon alt="img" className="header-icon" onClick={()=>this.setState({menu: !this.state.menu,profile: false,notification: false})}
            style={this.state.menu? {fontSize: 35,color: "rgb(45, 123, 212)",transition: "0.5s",}: { fontSize: 35, transition: "0.5s" }}
          />
          {this.state.notification ? (<div className="profile-slide"><Notifications /></div>) : ("")}
          {this.state.profile ? (<div className="profile-slide"><Profile /></div>) : ("")}
          {this.state.menu ? (
            <div className="notifications-slide">
              <div className="header-menu" style={lang ? { textAlign: "right" } : {}}>
                <button>{lang ? "על אלטרו" : "About Altro"}</button>
                <br />
                <button>{lang ? "צור קשר" : "Contact Us"}</button>
                <br />
                <button>{lang ? "חוקיות" : "Legal"}</button>
                <br />
                <button className="header-menu-share">{lang ? "שתף אותנו" : "Share the App"}</button>
                <br />
                <button className="header-menu-logout" onClick={() => this.logout()}>{lang ? "יציאה" : "Logout"}</button>
                <br />
                <p style={{fontSize: "11px",color: "black",float: "right"}}>
                  <Switch color="primary" style={{ color: "rgb(45, 123, 212)" }} checked={this.state.toggle} onChange={() => this.toggleSwitch()}/>
                  <br />English/עברית
                </p>
              </div>
            </div>
          ) : ("")}
        </div>
      </div>
    );
  }
}
