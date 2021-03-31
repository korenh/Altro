import React, { Component } from "react";
import firebase from "../../Functions/Firebase";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import StarRatingComponent from "react-star-rating-component";
import {getUserName} from '../../Functions/helper'

export default class Review extends Component {
  state = {
    textarea: "",
    ratepop: false,
    array: [],
    allUsers: [],
  };

  componentDidMount() {
    const allUsers = [];
    let docRef = firebase.firestore().collection("jobs").doc(this.props.job.id);
    docRef.get().then((doc) => {
      let array = [];
      let confirmedIds = doc.data().confirmedIds;
      for (let i = 0; i < confirmedIds.length; i++) {
        array.push({ rate: 5, id: confirmedIds[i] });
        firebase.firestore().collection("users").doc(confirmedIds[i]).get()
          .then((doc) => {
            allUsers.push({
              name: doc.data().name,
              profileImageURL: doc.data().profileImageURL,
              id: doc.data().uid,
              employerRating: doc.data().employerRating.sumOfRatings,
            });
            this.setState({ allUsers });
          });
      }
      this.setState({ array });
    });
  }

  onStarClick(nextValue, prevValue, name) {
    let array = this.state.array;
    for (var i in array) {
      if (array[i].id === name) {
        array[i].rate = nextValue;
      }
      this.setState({ array });
    }
  }

  sendReview = () => {
    firebase.firestore().collection("doneDeals").doc(this.props.job.id).set({
      jobId: this.props.job.id,
      employerValidated: true,
      pendingUsers: [],
      validatedUsers: [],
    });
    firebase.firestore().collection("doneDeals").doc(this.props.job.id).collection(`/feedbacks`)
      .add({ userId: sessionStorage.getItem("uid"), message: this.state.textarea});
    let array = this.state.array;
    for (let i = 0; i < array.length; i++) {
      firebase.firestore().collection("users").doc(array[i].id).get()
        .then((doc) => {
          const ER = doc.data().employeeRating;
          const rate = (array[i].rate + ER.sumOfRatings * ER.numberOfRatings) / (ER.numberOfRatings + 1);
          firebase.firestore().collection("users").doc(array[i].id).update({
              employeeRating: {
                numberOfRatings: ER.numberOfRatings + 1,
                sumOfRatings: rate,
              },
            });
        });
    }
    firebase.firestore().collection("jobs").doc(this.props.job.id).delete();
    firebase.firestore().collection("archive").doc(this.props.job.id).set(this.props.doc);
    this.props.ReviewJob();
  };

  closeReview = () => {
    firebase.firestore().collection("jobs").doc(this.props.job.id).delete();
    firebase.firestore().collection("archive").doc(this.props.job.id).set(this.props.doc);
    this.props.ReviewJob();
  };

  render() {
    return (
      <div className="review-main">
        {this.state.ratepop ? (
          <div className="rate-main">
            <h1>Rating</h1><br />
            {this.state.array.map((user) => (
              <div key={user.id}>
                <p>{getUserName(user.id , this.state.allUsers)}</p>
                <StarRatingComponent name={user.id} starCount={5} value={user.rate} onStarClick={this.onStarClick.bind(this)}/>
              </div>
            ))}
            <br />
            <button className="signin-btn" onClick={() => this.setState({ ratepop: !this.state.ratepop })}>Rate</button>
          </div>
        ) : ("")}
        <div className="review-head">
          <CheckCircleIcon style={{ fontSize: 40, color: "white" }} />
          <p>Your marked the job {this.props.job.title} as <br />finished</p>
        </div>
        <div className="review-main-content">
          <p style={{ fontWeight: "600" }}>We would love to ask you a few questions regrading the job process so we can imporve our service!</p>
          <p>Did all employees participate in your job as agreed?</p>
          <button className="review-yes">Yes</button>
          <button className="review-no">No</button>
          <p>Did you pay all your employees as agreed?</p>
          <button className="review-yes">Yes</button>
          <button className="review-no">No</button>
          <p>Please rate your employees , it's especially important for them</p>
          <button className="review-yes" onClick={() => this.setState({ ratepop: !this.state.ratepop })}>Go to rating</button>
          <button className="review-rate">Rate all 5 stars</button>
          <p>Did you have any other feedback regarding the job process or the employee? if not , you may leave this field blank.</p>
          <textarea typeof="text" className="review-textarea" placeholder="Write your feedback here" onChange={(e) => this.setState({ textarea: e.target.value })} /><br />
          <button className="review-submit" onClick={() => this.sendReview()}>Submit</button>
          <button className="review-close" onClick={() => this.closeReview()}>x</button>
        </div>
      </div>
    );
  }
}
