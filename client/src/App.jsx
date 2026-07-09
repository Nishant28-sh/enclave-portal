import { lazy, Suspense } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const ContactForm = lazy(() => import("./components/ContactForm"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
import ChatBot from "./components/ChatBot";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <main className="app">
      <section className={isLoginPage ? "container container--login" : "container"}>

        {/* Hero section — hidden on login page */}
        {!isLoginPage && (
          <div className="hero">
            <p className="badge">Production Ready Contact Portal</p>

            <h1>
              Secure Contact
              <br />
              Portal
            </h1>

            <p className="subtitle">
              Demonstrating React, Express, MongoDB,
              Zod Validation, Rate Limiting,
              Morgan, Winston Logging,
              Helmet and Cloudflare.
            </p>

            <div className="nav-buttons">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-btn active" : "nav-btn"
                }
              >
                Contact Form
              </NavLink>

              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "nav-btn active" : "nav-btn"
                }
              >
                Admin Dashboard
              </NavLink>
            </div>
          </div>
        )}

        <Suspense
          fallback={
            <div className="contact-card">
              <h2>Loading...</h2>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<ContactForm />} />

            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>

      </section>

      {/* AI Chatbot — available on every page */}
      <ChatBot />
    </main>
  );
}

export default App;