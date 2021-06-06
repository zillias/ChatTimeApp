import React, { useContext, useState } from "react";
import {
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { Redirect } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import "./Login.css";
import { registerUser } from "../GraqhQl";
import { login } from "../Reducers/AuthReducer";
import { SocketContext } from "../SocketProvider";

export default function Register() {
  const auth = useSelector((state) => state.auth);
  const { socket } = useContext(SocketContext);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [inputValues, setInputValues] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });

  const handleChange = (e) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });
  };

  const [addUser, { loading }] = useMutation(registerUser, {
    update(proxy, result) {
      dispatch(login(result.data.register));
      socket.emit("NewUser", {
        id: result.data.register.id,
        username: result.data.register.username,
      });
    },
    onError(err) {
      setErrors(err?.graphQLErrors[0]?.extensions.exception.errors);
    },
    variables: inputValues,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser();
  };

  return !auth.user ? (
    loading ? (
      <div className="progress">
        <CircularProgress />
      </div>
    ) : (
      <div className="main">
        <div className="registerTitle">
          <Typography color="primary" variant="h5">
            Create new account
          </Typography>
        </div>
        <form className="loginForm" onSubmit={handleSubmit} autoComplete="off">
          <TextField
            className="textField"
            label="Username"
            placeholder="Enter Username"
            name="username"
            value={inputValues.username}
            onChange={handleChange}
            variant="outlined"
            type="text"
            error={errors.username ? true : false}
            helperText={errors.username || null}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            className="textField"
            label="Email"
            placeholder="Enter your Email"
            name="email"
            value={inputValues.email}
            onChange={handleChange}
            variant="outlined"
            type="email"
            error={errors.email ? true : false}
            helperText={errors.email || null}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            className="textField"
            label="Password"
            placeholder="Enter Password"
            name="password"
            value={inputValues.password}
            onChange={handleChange}
            variant="outlined"
            type="password"
            error={errors.password ? true : false}
            helperText={errors.password || null}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            className="textField"
            label="Confirm Password"
            placeholder="Confirm your password"
            name="confirmPassword"
            value={inputValues.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword ? true : false}
            helperText={errors.confirmPassword || null}
            variant="outlined"
            type="password"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Button
            style={{ marginTop: "10px" }}
            color="primary"
            variant="contained"
            type="submit"
          >
            Register
          </Button>
        </form>
        <div className="subtitle">
          <Typography>Already have an accout ?</Typography>
          <Link style={{ textDecoration: "none" }} to="/login">
            <Button
              variant="text"
              size="large"
              style={{ marginLeft: "10px" }}
              color="primary"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    )
  ) : (
    <Redirect to="/" />
  );
}
