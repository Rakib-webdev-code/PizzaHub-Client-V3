import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient, ObjectId } from "mongodb";

const g = globalThis as unknown as { _pizzaMongo?: MongoClient };
const client = g._pizzaMongo ?? new MongoClient(process.env.MONGODB_URI as string);
g._pizzaMongo = client;
const db = client.db(process.env.DB_NAME || "pizzahub");

const APP_URL = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
const PROTECTED = ["role", "isBlocked", "subscriptionPlan", "subscriptionExpiresAt", "email"];

export const auth = betterAuth({
  baseURL: APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [APP_URL],
  database: mongodbAdapter(db),
  emailAndPassword: { enabled: true, minPasswordLength: 6, autoSignIn: true },
  socialProviders: {
    google: { clientId: process.env.GOOGLE_CLIENT_ID as string, clientSecret: process.env.GOOGLE_CLIENT_SECRET as string },
  },
  user: {
    modelName: "users", // business `users` collection (Better Auth owns it)
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "customer", input: true },
      isBlocked: { type: "boolean", required: false, defaultValue: false, input: false },
      businessName: { type: "string", required: false, input: true },
      subscriptionPlan: { type: "string", required: false, defaultValue: "free", input: false },
      subscriptionExpiresAt: { type: "date", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Public registration can only ever create a vendor or a customer - never an admin
        before: async (user) => {
          const role = (user as { role?: string }).role === "vendor" ? "vendor" : "customer";
          return { data: { ...user, role, isBlocked: false, subscriptionPlan: "free" } };
        },
      },
    },
    session: {
      create: {
        // Blocked users cannot start a session
        before: async (session) => {
          try {
            const u = await db.collection("users").findOne({ _id: new ObjectId(String(session.userId)) });
            if (u?.isBlocked) throw new APIError("FORBIDDEN", { message: "Your account has been blocked. Contact support." });
          } catch (e) {
            if (e instanceof APIError) throw e;
          }
          return { data: session };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const body = (ctx.body ?? {}) as Record<string, unknown>;
      if (ctx.path === "/update-user") {
        for (const k of PROTECTED) if (k in body) throw new APIError("FORBIDDEN", { message: "You cannot change this field" });
      }
      if (ctx.path === "/sign-up/email") {
        const p = String(body.password ?? "");
        if (!/[A-Z]/.test(p) || !/[a-z]/.test(p))
          throw new APIError("BAD_REQUEST", { message: "Password must contain an uppercase and a lowercase letter" });
      }
    }),
  },
  plugins: [
    jwt({
      jwt: {
        issuer: APP_URL,
        audience: APP_URL,
        expirationTime: "15m",
        definePayload: ({ user }) => ({ id: user.id, email: user.email }),
      },
    }),
    nextCookies(),
  ],
});
