import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";

const ADMIN_ADDRESS = "0x462e58792e3a15a87e892c8e16eb6e080057aa18985df27e82ea57efc3eb36d9";

export function Navbar() {
  const account = useCurrentAccount();
  const isAdmin = account?.address === ADMIN_ADDRESS;

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
            {isAdmin && (
              <Link to="/admin" style={{ color: "#F59E0B", fontWeight: "600" }}>
                ADMIN
              </Link>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}


