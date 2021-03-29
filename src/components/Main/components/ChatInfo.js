import React, { Component } from "react";
import firebase from "../../Functions/Firebase";

export default class ChatInfo extends Component {
  state = {
    owner: {},
  };

  componentDidMount() {
    firebase
      .firestore()
      .collection("users")
      .doc(this.props.id)
      .get()
      .then((doc) => {
        this.setState({ owner: doc.data() });
      });
    return "done";
  }

  render() {
    return (
      <div className="chat-main2" onClick={() => this.props.jobInfo()}>
        <h3>Job Details</h3>
        <br />
        <div className="owner-info-chat">
          <img alt="img" src={this.state.owner.profileImageURL} />
          <p>{this.state.owner.name}</p>
          <p className="owner-info-green">Employer</p>
        </div>
        {this.props.allUsers.map((v) => (
          <div key={v.uid} className="owner-info-chat">
            <img alt="img" src={v.profileImageURL} />
            <p>{v.name}</p>
            <p className="owner-info-blue">Employee</p>
          </div>
        ))}
      </div>
    );
  }
}
