import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/feed", "routes/feed.tsx"),
  route("/events/create", "routes/events/create.tsx"),
  route("/events/:id", "routes/events/[id].tsx"),
  route("/my-events", "routes/events/my-events.tsx"),
] satisfies RouteConfig;