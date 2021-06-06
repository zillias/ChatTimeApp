import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserInputError } from "apollo-server-express";

import { SECRET_KEY } from "../Config.js";
import User from "../Models/User.js";
import Messages from "../Models/Messages.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../Util/Validation.js";
import checkAuth from "../Util/CheckAuth.js";

const fetchMessages = async (from, to) => {
  let sentMessages = [];
  const sender = await User.findOne({ username: from });

  if (sender.messagesSent.length > 0) {
    const conversation = sender.messagesSent.find((conv) => conv.to === to);

    if (conversation) {
      sentMessages = await Promise.all(
        conversation.messages.map(async (message) => {
          const messageData = await Messages.findById(message);
          return messageData;
        })
      );
    }
  }
  return sentMessages;
};

export default {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.find();
        return users;
      } catch (error) {
        throw new Error(error);
      }
    },
    getMessages: async (parent, { username, to }) => {
      try {
        const conversation = [
          ...(await fetchMessages(username, to)),
          ...(await fetchMessages(to, username)),
        ];

        if (conversation.length) {
          return conversation.sort((a, b) => a.createdAt - b.createdAt);
        } else {
          return conversation;
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    getNotifications: async (parent, args, context) => {
      try {
        let user = checkAuth(context);
        user = await User.findOne({ username: user.username });
        return user.notifications;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    async login(parent, { username, password }, context) {
      const { errors, valid } = validateLoginInput(username, password);
      username = username.toLowerCase();

      if (!valid) {
        throw new UserInputError("Input Error", { errors });
      }
      const existingUser = await User.findOne({ username });
      if (!existingUser) {
        throw new UserInputError("Wrong credentials", {
          errors: { general: "User not found" },
        });
      }
      const match = await bcrypt.compare(password, existingUser.password);
      if (!match) {
        throw new UserInputError("Wrong credentials", {
          errors: { general: "Password is not correct" },
        });
      }

      const token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
        },
        SECRET_KEY
      );

      await existingUser.save();

      return {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        createdAt: existingUser.createdAt,
        token,
      };
    },
    async register(
      parent,
      { registerInput: { username, email, password, confirmPassword }, context }
    ) {
      //   validate User Data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError("Input Errors", { errors });
      }
      // make sure Username doesn't really exist

      username = username.toLowerCase();
      const ExistingUser = await User.findOne({ username });
      if (ExistingUser) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // hash password and create auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toLocaleString(),
        messagesSent: [],
      });

      const result = await newUser.save();

      const token = jwt.sign(
        {
          id: result.id,
          email: result.email,
          username: result.username,
        },
        SECRET_KEY
      );

      return {
        id: result.id,
        email: result.email,
        username: result.username,
        createdAt: result.createdAt,
        token,
      };
    },

    async sendMessage(parent, { to, body }, context) {
      const user = checkAuth(context);

      let newMessage = new Messages({
        body,
        createdAt: Date.now(),
        sender: user.username,
      });

      newMessage = await newMessage.save();

      const sender = await User.findOne({ username: user.username });

      if (sender.messagesSent.length === 0) {
        sender.messagesSent = [{ to, messages: [newMessage.id] }];
      } else {
        const existingConversation = await sender.messagesSent.filter(
          (message) => message.to === to
        );

        if (existingConversation.length) {
          sender.messagesSent = await sender.messagesSent.map(
            (conversation) => {
              if (conversation.to === to) {
                conversation.messages.push(newMessage.id);
              }
              return conversation;
            }
          );
        } else {
          sender.messagesSent.push({ to, messages: [newMessage.id] });
        }
      }

      await sender.save();

      return newMessage;
    },

    async addNotification(parent, { to }, context) {
      let user = checkAuth(context);
      let receiver = await User.findOne({ username: to });

      if (!receiver.notifications.length) {
        receiver.notifications = [{ from: user.username, messagesCount: 1 }];
      } else {
        const notificationsFromUser = await receiver.notifications.filter(
          (notification) => notification.from === user.username
        );

        if (notificationsFromUser.length) {
          receiver.notifications = await receiver.notifications.map(
            (notification) => {
              if (notification.from === user.username) {
                return {
                  from: user.username,
                  messagesCount: notification.messagesCount + 1,
                };
              } else return notification;
            }
          );
        } else {
          receiver.notifications.push({ from: user.id, messagesCount: 1 });
        }
      }
      receiver = await receiver.save();

      const addedNotification = receiver.notifications.find(
        (notification) => notification.from === user.username
      );

      return addedNotification;
    },

    async removeNotification(parent, { from }, context) {
      let user = checkAuth(context);

      user = await User.findOne({ username: user.username });

      user.notifications = await user.notifications.filter(
        (notification) => notification.from !== from
      );

      user = await user.save();

      return user.notifications;
    },
  },
};
