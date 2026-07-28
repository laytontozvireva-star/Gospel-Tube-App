import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Bell,
  Clock,
  Compass,
  Home as HomeIcon,
  ListVideo,
  Play,
  Search,
  Tv,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SignInModal from "./SignInModal";
import "../pages/main.css";

const navItems = [
  { name: "Home", icon: HomeIcon, to: "/" },
  { name: "Explore", icon: Compass, to: "/explore" },
  { name: "Apostles", icon: Users, to: "/apostles" },
  { name: "Live", icon: Tv, to: "/live" },
  { name: "Playlists", icon: ListVideo, to: "/playlists" },
  { name: "Liked Videos", icon: Users, to: "/liked-videos" },
  { name: "History", icon: Clock, to: "/history" },
];

function PageShell({ title, description, children }) {
  const { user, signOut } = useAuth();
  const [signinOpen, setSigninOpen] = useState(false);

  return (
    <div className="page-shell-wrap">
      <header className="shell-topbar">
        <Link to="/" className="shell-brand">
          <div className="shell-logo">
            <Play size={15} className="fill-white translate-x-0.5" />
          </div>
          <span>
            GOSPEL<span>TUBE</span>
          </span>
        </Link>

        <div className="shell-search">
          <Search size={18} />
          <input type="text" placeholder="Search apostles, sermons, topics..." />
        </div>

        <div className="shell-actions">
          <button className="shell-icon-btn">
            <Bell size={18} />
            <span className="shell-dot" />
          </button>
          {user ? (
            <button className="shell-signin" onClick={signOut}>
              {user.name || "Sign Out"}
            </button>
          ) : (
            <button className="shell-signin" onClick={() => setSigninOpen(true)}>
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="shell-body">
        <aside className="shell-sidebar">
          <div className="shell-sidebar-links">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `shell-sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="shell-signin-card">
            <p>Sign In</p>
            <span>
              Sign in to follow apostles, save sermons, and take notes.
            </span>
            <button>Sign In</button>
          </div>
        </aside>

        <main className="shell-main">
          {title || description ? (
            <section className="shell-page-head">
              {title ? <h1>{title}</h1> : null}
              {description ? <p>{description}</p> : null}
            </section>
          ) : null}
          {children}
        </main>
      </div>

      <SignInModal open={signinOpen} onClose={() => setSigninOpen(false)} />
    </div>
  );
}

export default PageShell;
