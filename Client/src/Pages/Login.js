import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { Redirect } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import "./Login.css";
import { loginUser } from "../GraqhQl";
import { login } from "../Reducers/AuthReducer";

export default function Login() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [inputValues, setInputValues] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });
  };

  const [logUser, { loading }] = useMutation(loginUser, {
    update(proxy, result) {
      dispatch(login(result.data.login));
    },
    onError(err) {
      setErrors(err?.graphQLErrors[0]?.extensions.exception.errors);
    },
    variables: inputValues,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    logUser();
  };
  return !auth.user ? (
    loading ? (
      <div className="progress">
        <CircularProgress />
      </div>
    ) : (
      <div className="main">
        <div className="title">
          <Typography color="primary" variant="h5">
            Log in to your account
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
            error={errors?.username || errors?.general ? true : false}
            helperText={errors?.username || null}
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
            type="password"
            variant="outlined"
            error={errors?.password || errors?.general ? true : false}
            helperText={errors?.password || null}
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
            Login
          </Button>
          {errors?.general && (
            <div className="errors">
              <ul>
                <li>
                  <Typography variant="subtitle1">
                    Error: {errors?.general}
                  </Typography>
                </li>
              </ul>
            </div>
          )}
        </form>
        <div className="subtitle">
          <Typography>Don't have an accout ?</Typography>
          <Link style={{ textDecoration: "none" }} to="/register">
            <Button
              ariant="text"
              size="large"
              style={{ marginLeft: "10px" }}
              color="primary"
            >
              Register
            </Button>
          </Link>
        </div>
      </div>
    )
  ) : (
    <Redirect to="/" />
  );
}
