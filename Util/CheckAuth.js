import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-express";

import { SECRET_KEY } from "../Config.js";

const checkAuth = (context) => {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (error) {
        throw new AuthenticationError("Invalid or expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error("Authorisation header must be provided");
};

export default checkAuth;
