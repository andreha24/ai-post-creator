import { FastifyReply, FastifyRequest } from "fastify";
import {
  register,
  login,
  findOrCreateGoogleUser,
  findOrCreateTwitterUser,
} from "./auth.service";
import { RegisterInput, LoginInput } from "./auth.schema";
import { env } from "prisma/config";

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
}

interface TwitterUserInfo {
  data: {
    id: string;
    name: string;
    username: string;
    email?: string;
  };
}

export const registerHandler = async (
  request: FastifyRequest<{
    Body: RegisterInput;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { token, user } = await register(request.body);

    reply.setCookie("token", token, {
      httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return reply.code(201).send(user);
  } catch (error: any) {
    console.error("Registration error:", error);
    return reply.code(400).send({
      error: error.message || "Registration failed",
    });
  }
};

export const loginHandler = async (
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { token, user } = await login(request.body);

    reply.setCookie("token", token, {
      httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return reply.code(200).send(user);
  } catch (error: any) {
    console.error("Login error:", error);
    return reply.code(401).send({
      error: error.message || "Login failed",
    });
  }
};

export const googleOAuthHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const token =
      await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
        request,
      );

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token.token.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;

    const result = await findOrCreateGoogleUser(
      googleUser.id,
      googleUser.email,
      googleUser.name,
    );

    reply.setCookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return reply.redirect(
      `${env("FRONTEND_URL")}?auth=success${result.isNewUser ? "&new_user=true" : ""}`,
    );
  } catch (error: any) {
    console.error("Google OAuth error:", error);
    return reply.code(500).send({
      error: error.message || "Google authentication failed",
    });
  }
};

export const twitterOAuthHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const token =
      await request.server.twitterOAuth2.getAccessTokenFromAuthorizationCodeFlow(
        request,
      );

    const userInfoResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=id,name,username,email",
      {
        headers: {
          Authorization: `Bearer ${token.token.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info from Twitter");
    }

    const twitterUser = (await userInfoResponse.json()) as TwitterUserInfo;

    const result = await findOrCreateTwitterUser(
      twitterUser.data.id,
      twitterUser.data.name,
      twitterUser.data.username,
    );

    reply.setCookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return reply.redirect(
      `${env("FRONTEND_URL")}?auth=success${result.isNewUser ? "&new_user=true" : ""}`,
    );
  } catch (error: any) {
    console.error("Twitter OAuth error:", error);
    return reply.code(500).send({
      error: error.message || "Twitter authentication failed",
    });
  }
};

export const logoutHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  reply.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return reply.code(200).send({
    message: "Logged out successfully",
  });
};
