import React from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Provider } from "react-redux";

import "./Index.css";
import store from "./Reducers";
import App from "./App";
import { SocketProvider } from "./SocketProvider";

const httpLink = createHttpLink({
  uri: "https://mighty-mountain-71972.herokuapp.com/graphql",
});

const authLink = setContext(() => {
  const token = localStorage.getItem("JwtToken");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </Provider>
  </ApolloProvider>,
  document.getElementById("root")
);
