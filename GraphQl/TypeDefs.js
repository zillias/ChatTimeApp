import { gql } from "apollo-server-express";

export default gql`
  type User {
    id: ID!
    username: String!
    createdAt: String!
    email: String!
    token: String
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  type Message {
    id: ID!
    body: String!
    createdAt: String!
    sender: String!
  }

  type Notification {
    from: String!
    messagesCount: Int!
  }

  type Query {
    getUsers: [User]!
    getMessages(username: String!, to: String!): [Message]!
    getNotifications: [Notification]!
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    sendMessage(body: String!, to: String!): Message!
    addNotification(to: String!): Notification!
    removeNotification(from: String!): [Notification]!
  }
`;
