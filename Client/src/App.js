import { useContext, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import GitHubIcon from "@material-ui/icons/GitHub";
import { Typography } from "@material-ui/core";

import "./Index.css";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import MenuBar from "./Components/MenuBar";
import { SocketContext } from "./SocketProvider";
import { useDispatch } from "react-redux";
import { setMysocketId } from "./Reducers/AuthReducer";

function App() {
  const { socket } = useContext(SocketContext);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("mySocketId", (socketId) => {
      dispatch(setMysocketId(socketId));
    });
  }, []);

  return (
    <Router>
      <MenuBar />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>
      </Switch>
      <footer>
        <Typography variant="subtitle1">
          Made by : zillias (2021) | All rights reserved ©
        </Typography>
        <a className="link" href="https://github.com/zillias">
          <GitHubIcon fontSize="large" className="icon" />
        </a>
      </footer>
    </Router>
  );
}

export default App;
