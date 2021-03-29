import React from "react";
import Signin from "./components/Sign/Signin";
import Signup from "./components/Sign/Signup";
import Header from "./components/Header/Header";
import Nav from "./components/Header/Nav";
import PublishManage from "./components/Main/PublishManage";
import Jobs from "./components/Main/Jobs";
import Myjobs from "./components/Main/Myjobs";
import { UserProvider } from "./components/Functions/UserContext";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Route path="/" exact component={Signin} />
        <Route path="/signup" exact component={Signup} />
        <Route path="/main" component={Header} />
        <Route path="/main" component={Nav} />
        <Route path="/main/publishmanage" exact component={PublishManage} />
        <Route path="/main/jobs" exact component={Jobs} />
        <Route path="/main/myjobs" exact component={Myjobs} />
        <Redirect to="/" />
      </Router>
    </UserProvider>
  );
}
