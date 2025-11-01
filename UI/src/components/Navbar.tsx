import { ConnectButton } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <div className="nav">
      <div className="container nav-inner">
        <div className="topbar">
          <Link to="/profile" className="brand" aria-label="My Account">
            <div className="brand-pill">My Account</div>
          </Link>
          <div className="menu">
            <Link to="/polls">PROJECTS</Link>
            <Link to="/about">ABOUT</Link>
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}


