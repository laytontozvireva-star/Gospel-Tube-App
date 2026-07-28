import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <h2> Gospel Tube</h2>

      <ul className="nav">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/videos">Videos</Link>
        </li>

        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>

    </nav>
  );
}

export default Navbar;
