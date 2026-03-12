import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import Login from "./About/login";
import { auth } from "./auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);

  const user = auth.getUser();

  const onLogout = async () => {
    await auth.logout();
    navigate("/", { replace: true });
  };

  const onHomeSection = (e, sectionId) => {
    // If already on homepage, let normal anchor scrolling happen.
    if (location.pathname === "/" || location.pathname === "/home") return;

    e.preventDefault();
    navigate(`/home#${sectionId}`);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
        style={{
          paddingTop: "10px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(47,111,237,0.25)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,250,255,0.98))",
          zIndex: 1030,
        }}
      >
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/home">
            <img
              src="/media/estock-chart-logo.svg"
              alt="eStock Logo"
              className="navLogo"
              style={{ width: "auto", objectFit: "contain" }}
            />
          </Link>

          {/* Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Menu */}
          <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
            <ul className="navbar-nav align-items-lg-center gap-lg-3 mt-3 mt-lg-0">
              {/* If logged in, show Dashboard first */}
              {user && (
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link fw-semibold navHover ${isActive ? "navActive" : ""}`
                    }
                    to="/dashboard"
                  >
                    Dashboard
                  </NavLink>
                </li>
              )}

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link fw-semibold navHover ${isActive ? "navActive" : ""}`
                  }
                  to="/home"
                >
                  Home
                </NavLink>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link fw-semibold navHover"
                  href="#education"
                  onClick={(e) => onHomeSection(e, "education")}
                >
                  Lessons
                </a>
              </li>

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link fw-semibold navHover ${isActive ? "navActive" : ""}`
                  }
                  to={user ? "/practice/simulator" : "/signup"}
                >
                  Practice
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link fw-semibold navHover ${isActive ? "navActive" : ""}`
                  }
                  to="/support"
                >
                  Support
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link fw-semibold navHover ${isActive ? "navActive" : ""}`
                  }
                  to="/about"
                >
                  About
                </NavLink>
              </li>

              {/* Logged OUT: show Login + Open Account */}
              {!user && (
                <>
                  <li className="nav-item">
                    <button
                      type="button"
                      className="btn btn-outline-primary px-4 fw-semibold loginBtn"
                      onClick={() => setShowLogin(true)}
                    >
                      Login
                    </button>
                  </li>

                  <li className="nav-item">
                    <a
                      className="btn btn-success px-4 fw-semibold openBtn"
                      href="#open-account"
                      onClick={(e) => onHomeSection(e, "open-account")}
                    >
                      Open Account
                    </a>
                  </li>
                </>
              )}

              {/* Logged IN: show user chip + logout */}
              {user && (
                <li className="nav-item d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="userChip"
                    onClick={() => navigate("/dashboard")}
                    title={user.email}
                  >
                    <span className="userAvatar">{(user.name || "U").slice(0, 1).toUpperCase()}</span>
                    <span className="userEmail">{user.email}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger px-3 fw-semibold"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Prevent content hiding under fixed navbar */}
      <div style={{ height: "88px" }} />

      {/* Login Modal */}
      <Login show={showLogin} onClose={() => setShowLogin(false)} />

      <style>{`
        html { scroll-behavior: smooth; scroll-padding-top: 90px; }

        .navLogo{
          height: 70px;
        }

        .navHover { position: relative; transition: color .2s ease; }
        .navHover:hover { color: #2f6fed !important; }

        .navActive { color: #2f6fed !important; }
        .navActive::after {
          content: "";
          position: absolute;
          left: 10px; right: 10px; bottom: 4px;
          height: 2px;
          background: linear-gradient(90deg,#2f6fed,#7b61ff);
          border-radius: 999px;
        }

        .loginBtn, .openBtn {
          border-radius: 10px;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .loginBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(47,111,237,0.25);
          background: linear-gradient(135deg,#2f6fed,#7b61ff);
          color: #fff;
          border-color: transparent;
        }

        .openBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(25,135,84,0.22);
        }

        .userChip{
          display:flex;
          align-items:center;
          gap:10px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.85);
          border-radius: 999px;
          padding: 8px 12px;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .userChip:hover{
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.08);
        }

        .userAvatar{
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display:grid;
          place-items:center;
          font-weight: 900;
          background: linear-gradient(135deg,#2f6fed,#7b61ff);
          color: #fff;
        }

        .userEmail{
          max-width: 170px;
          overflow:hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 700;
          color: rgba(0,0,0,0.70);
          font-size: 13px;
        }

        @media (max-width: 991px){
          .navLogo{
            height: 58px;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
