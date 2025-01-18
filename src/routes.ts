/**
 * An array of routes that are accessible to the public
 * These routes does not require authentication
 * @type {String[]}
 */
export const publicRoutes: string[] = ["/"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {String[]}
 */
export const authRoutes: string[] = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {String}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {String}
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/settings";
