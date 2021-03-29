import React, { Component } from "react";
import "./Dashboard.css";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Manageusers from "../manageusers/Manageusers";
import UserContext from "../../../functions/UserContext";

export default class Dashboard extends Component {
  static contextType = UserContext;

  state = {
    manageEmplyees: false,
    job: {},
  };

  render() {
    const { lang } = this.context;

    return (
      <div className="dashboard">
        {this.state.manageEmplyees ? (
          <Manageusers Dashboard={this.props.Dashboard} job={this.props.job} />
        ) : (
          ""
        )}
        <ChevronLeftIcon
          onClick={() => this.props.Dashboard()}
          className="newjob-back-btn"
          alt="img"
          style={{ color: "white", fontsize: 40 }}
        />

        <h1>Job Dashboard</h1>
        <div className="dashboard-info">
          <p>Statistics & info</p>
          <p>Views , saves </p>
          <p>Attending , requests</p>
          <p>confirmed participating</p>
          <p>Published on Date </p>
        </div>
        <div className="dashboard-quick">
          <p>Quick Actions</p>
          <button className="jobs-selected-boost-button">
            {lang ? "שיפור" : "Boost"}
          </button>
          <button className="jobs-selected-save-button">
            {lang ? "ניהול" : "Manage"}
          </button>
          <button className="jobs-selected-save-button">
            {lang ? "עריכה" : "Edit"}
          </button>
          <button className="jobs-selected-save-button">
            {lang ? "הודעות" : "Chat"}
          </button>
          <br />
          <button className="jobs-selected-finish-button">
            {lang ? "סיום" : "Finish Job"}
          </button>
          <button
            className="jobs-selected-delete-button"
            onClick={() => this.props.deleteJob(this.props.job)}
          >
            {lang ? "מחיקה" : "Delete Job"}
          </button>
        </div>
        <div className="dashboard-manage">
          <p>Manage Employees</p>

          <button
            onClick={() =>
              this.setState({ manageEmplyees: !this.state.manageEmplyees })
            }
            className="jobs-selected-finish-button"
          >
            View All
          </button>
        </div>
      </div>
    );
  }
}
