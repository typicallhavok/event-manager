import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useLocation } from 'react-router-dom';

import type { Route } from "./+types/root";
import "./app.css";
import { UserContextProvider } from './contexts/UserContext';
import { AuthGuard } from './components/AuthGuard';
import Navbar from './components/Navbar';

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

// Add this function to check if navbar should be hidden
const shouldHideNavbar = (pathname: string): boolean => {
  const hiddenPaths = ['/', '/login', '/register'];
  return hiddenPaths.includes(pathname);
};

export default function App() {
  const location = useLocation();

  return (
    <UserContextProvider>
      <AuthGuard>
        {!shouldHideNavbar(location.pathname) && <Navbar />}
        <Outlet />
      </AuthGuard>
    </UserContextProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const location = useLocation();
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <>
      {!shouldHideNavbar(location.pathname) && <Navbar />}
      <main className="pt-16 p-4 container mx-auto">
        <h1 className="text-2xl font-bold text-red-500">{message}</h1>
        <p className="text-gray-600 mt-2">{details}</p>
        {stack && (
          <pre className="w-full p-4 mt-4 bg-gray-100 rounded-lg overflow-x-auto">
            <code className="text-sm">{stack}</code>
          </pre>
        )}
      </main>
    </>
  );
}
