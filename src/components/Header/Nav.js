import React, { Component } from "react";
import SearchIcon from "@material-ui/icons/Search";
import PublishIcon from "@material-ui/icons/Publish";
import StarIcon from "@material-ui/icons/Star";
import { NavLink } from "react-router-dom";
import UserContext from "../Functions/UserContext";

export default class Nav extends Component {
  static contextType = UserContext;

  render() {
    const { lang } = this.context;
    return (
      <div className="nav">
        <NavLink className="nav-item" activeClassName="nav-item-active" to="/main/jobs"><SearchIcon style={{ fontSize: 30 }} />
          <p style={{ lineHeight: "0" }}>{lang ? "חיפוש" : "Search"}</p>
        </NavLink>
        <NavLink className="nav-item" to="/main/myjobs" activeClassName="nav-item-active"><StarIcon style={{ fontSize: 30 }} />
          <p style={{ lineHeight: "0" }}>{lang ? "עבודות" : "My Jobs"}</p>
        </NavLink>
        <NavLink className="nav-item" to="/main/publishmanage" activeClassName="nav-item-active"><PublishIcon style={{ fontSize: 30 }} />
          <p style={{ lineHeight: "0" }}>{lang ? "פרסום" : "Publish"}</p>
        </NavLink>
      </div>
    );
  }
}
