import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./index.css";
import "./value-visuals.css";
import "./fact-graph.css";
import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  {
    rel: "preload",
    href: "/fonts/instrument-serif.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    href: "/fonts/manrope-latin.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#151811" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return <Outlet />;
}
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message =
    isRouteErrorResponse(error) && error.status === 404
      ? "This page hasn’t put down roots."
      : "Something went wrong.";
  return (
    <main className="error-page">
      <h1>{message}</h1>
      <a href="/">Back to Groundray</a>
    </main>
  );
}
