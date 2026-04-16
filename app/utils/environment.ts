/*
 * This helper function returns a flag stating the current environment.
 * If an environment variable is found with NODE_ENV set to true,
 * then it is a prod environment. Otherwise, dev.
 * Returns true if the application is running in production.
 */

// utils/environment.ts

const isLocalhost = () =>
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "");

const dev = {
  url: "http://localhost:8080",
  ws: "ws://localhost:8080/ws",
};

const prod = {
  url: "https://sopra-fs26-group-32-server.oa.r.appspot.com",
  ws: "wss://sopra-fs26-group-32-server.oa.r.appspot.com/ws",
};

export const getDomain = () => (isLocalhost() ? dev.url : prod.url);
export const getWsDomain = () => (isLocalhost() ? dev.ws : prod.ws);

export function isProduction(): boolean {
  return !isLocalhost();
}