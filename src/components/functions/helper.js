import firebase from "../protected/Firebase";
import { toast } from "react-toastify";

export const addNotification = (notification) => {
  return firebase.firestore().collection("notifications").add({
    date: notification.date,
    fromUser: notification.fromUser,
    fromUsername: notification.fromUsername,
    jobId: notification.jobId,
    notificationType: notification.notificationType,
    toUser: notification.toUser,
  });
};

export const GeoName = (lng, lat) => {
  /*fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode?latitude=${lat}&longitude=${lng}&localityLanguage=en&key=5305f546fbc84e378acc3138bdd5a82f`
  )
    .then((response) => response.json())
    .then((data) => console.log(data.city));*/
  return "location";
};

export const calcCrow = (lon2, lat2, unit , sLat , sLng) => {
  var radlat1 = (Math.PI * sLat) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = sLng - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  return dist;
}

export const applyJob = (job) => {
  firebase
    .firestore()
    .collection("jobs")
    .doc(job.id)
    .get()
    .then((doc) => {
      let requests = doc.data().requests;
      requests.push({
        requestingUserId: sessionStorage.getItem("uid"),
        dateRequested: firebase.firestore.Timestamp.fromDate(new Date()),
      });
      firebase
        .firestore()
        .collection("jobs")
        .doc(job.id)
        .update({ requests });
    });
  addNotification({
    date: firebase.firestore.Timestamp.fromDate(new Date()),
    fromUser: sessionStorage.getItem("uid"),
    fromUsername: sessionStorage.getItem("name"),
    jobId: job.id,
    notificationType: "newRequest",
    toUser: job.creatingUserId,
  });
  toast.configure();
  toast.info("Job apllied", { autoClose: 2000 });
};
