import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/AsyncHandler";
import { clerkClient, getAuth } from "@clerk/express";
import { AppError } from "../../utils/AppError";
import { User } from "../../models/User";
import { ok } from "../../utils/envelop";

export const authRouter = Router();

// Router for creating/updating logged-in user in database
authRouter.post(
  "/sync",
  requireAuth,
  asyncHandler(async (req, res) => {
    // Extracts authenticated user ID from request token
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(401, "Unauthorized- invalid token!");
    }

    // user
    // Fetches full user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    // here finds user's primary email- Because Clerk may store multiple emails.
    // If no primary email exists, take first email
    const extractEmailFromUserInfo =
      clerkUser.emailAddresses.find(
        (item) => item.id === clerkUser.primaryEmailAddressId,
      ) || clerkUser.emailAddresses[0];

    // Gets actual string email
    const email = extractEmailFromUserInfo.emailAddress;

    // Creates full name
    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean) //["Rajeev", undefined] = ["Rajeev"]
      .join(" ") // ["Rajeev", "Kumar"] = "Rajeev Kumar"
      .trim(); // Removes extra spaces

    // If full name empty then use Clerk username
    const name = fullName || clerkUser.username;

    // admin
    const raw = process.env.ADMIN_EMAILS || "";

    const adminEmails = new Set(
      raw
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    );

    // if the current user is existing user or not
    // update / do nothing then
    // create the user and save in our db with role

    const existingUser = await User.findOne({ clerkUserId: userId });

    // Checks whether current email is inside admin emails list
    const shouldBeAdmin = email ? adminEmails.has(email.toLowerCase()) : false;

    const nextRole =
      existingUser?.role === "admin"
        ? "admin"
        : shouldBeAdmin
          ? "admin"
          : existingUser?.role || "user";

    // If existing user already admin
    // ↓
    // keep admin forever

    // Else if email in ADMIN_EMAILS
    // ↓
    // make admin

    // Else if user already has role
    // ↓
    // keep role

    // Else
    // ↓
    // "user"

    // Update
    const newlyCreateDbUser = await User.findOneAndUpdate(
      {
        // Searches user by Clerk ID
        clerkUserId: userId,
      },
      {
        // Data To Save
        clerkUserId: userId,
        email,
        name,
        role: nextRole,
      },
      {
        new: true, // Return updated document
        upsert: true, // update if exists OR insert if missing
        setDefaultsOnInsert: true, // If new user gets created: apply schema default values.
      },
    );

    // Returned User Object
    res.status(200).json(
      ok({
        user: {
          id: newlyCreateDbUser._id,
          clerkUserId: newlyCreateDbUser.clerkUserId,
          email: newlyCreateDbUser.email,
          name: newlyCreateDbUser.name,
          role: newlyCreateDbUser.role,
        },
      }),
    );
  }),
);

// Router to get the current logged-in user info
authRouter.get(
  "/get-profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(401, "Unauthorized- invalid token!");
    }

    const dbUser = await User.findOne({ clerkUserId: userId });

    if (!dbUser) {
      throw new AppError(404, "User not found in DB!");
    }

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
      }),
    );
  }),
);
