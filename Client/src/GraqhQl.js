import { gql } from "@apollo/client";

export const registerUser = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export const loginUser = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      email
      token
      username
      createdAt
    }
  }
`;

export const getUsers = gql`
  {
    getUsers {
      id
      username
    }
  }
`;

export const getMessages = gql`
  query getMessages($username: String!, $to: String!) {
    getMessages(username: $username, to: $to) {
      id
      body
      createdAt
      sender
    }
  }
`;

export const sendMessage = gql`
  mutation sendMessage($body: String!, $to: String!) {
    sendMessage(body: $body, to: $to) {
      id
      body
      createdAt
      sender
    }
  }
`;

export const addNotification = gql`
  mutation addNotification($to: String!) {
    addNotification(to: $to) {
      from
      messagesCount
    }
  }
`;

export const getStoredNotifications = gql`
  {
    getNotifications {
      from
      messagesCount
    }
  }
`;

export const deleteNotification = gql`
  mutation removeNotification($from: String!) {
    removeNotification(from: $from) {
      from
      messagesCount
    }
  }
`;
