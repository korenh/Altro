import React, { Component } from "react";
const UserContext = React.createContext();

class UserProvider extends Component {
  state = {
    user: { uid: "",name: " ",profileImageURL: "",description: ""},
    lang: false,
    lat: "",
    lng: "",
  };

  setLang = () => {
    this.setState({ lang: !this.state.lang });
  };

  setUser = (uid, name, profileImageURL, description) => {
    const user = { uid, name, profileImageURL,description };
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({ lng: position.coords.longitude , lat: position.coords.latitude , user});
    });
  };

  render() {
    const { children } = this.props;
    const { user } = this.state;
    const { lang } = this.state;
    const { lat } = this.state;
    const { lng } = this.state;
    const { setUser } = this;
    const { setLang } = this;

    return (
      <UserContext.Provider value={{user,setUser,setLang,lang,lat,lng,}}>
        {children}
      </UserContext.Provider>
    );
  }
}

export default UserContext;

export { UserProvider };
