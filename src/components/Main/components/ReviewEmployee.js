import React, { Component } from "react";
import firebase from "../../Functions/Firebase";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import StarRatingComponent from "react-star-rating-component";

export default class ReviewEmployee extends Component {
  state = {
    textarea: "",
    rating: 5,
  };

  onStarClick(nextValue, prevValue, name) {
    this.setState({ rating: nextValue });
  }

  sendReview = () => {
    firebase.firestore().collection("users").doc(this.props.job.fromUser).get()
      .then((doc) => {
        const ER = doc.data().employerRating;
        const rate = (this.state.rating + ER.sumOfRatings * ER.numberOfRatings) / (ER.numberOfRatings + 1);
        firebase.firestore().collection("users").doc(this.props.job.fromUser)
          .update({
            employerRating: {
              numberOfRatings: ER.numberOfRatings + 1,
              sumOfRatings: rate,
            },
          });
      });
    firebase.firestore().collection("doneDeals").doc(this.props.job.jobId).collection(`/feedbacks`)
      .add({ userId: sessionStorage.getItem("uid"), message: this.state.textarea});
    firebase.firestore().collection("notifications").doc(this.props.job.id).delete();
    this.props.jobFinished();
  };

  render() {
    return (
      <div className="review-main">
        <div className="review-head">
          <CheckCircleIcon style={{ fontSize: 40, color: "white" }} />
          <p>A job you were attending to {this.props.job.jobId}<br />was marked as finished by the employer .</p>
        </div>
        <div className="review-main-content">
          <p style={{ fontWeight: "600" }}> We would love to ask you a few questions regrading the job process so we can imporve our service!</p>
          <p>Have you took participated in the job?</p>
          <button className="review-yes">Yes</button>
          <button className="review-no">No</button>
          <p>Did you get paid according to what was agreed with your employer?</p>
          <button className="review-yes">Yes</button>
          <button className="review-no">No</button>
          <p>Would you like to rate your employer {this.props.job.fromUser}?</p>
          <StarRatingComponent name={this.props.job.creatingUserId} starCount={5} value={this.state.rating} onStarClick={this.onStarClick.bind(this)}/>
          <p>Did you have any other feedback regarding the job process?</p>
          <textarea typeof="text" className="review-textarea" placeholder="Write your feedback here" onChange={(e) => this.setState({ textarea: e.target.value })}/><br/>
          <button className="review-submit" onClick={() => this.sendReview()}>Submit</button>
          <button className="review-close">x</button>
        </div>
      </div>
    );
  }
}
