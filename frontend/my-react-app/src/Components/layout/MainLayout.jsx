import { useLocation } from "react-router-dom";
import NavigationBar from "../../Navbar/navbar.jsx";

const HIDDEN_NAVBAR_PATHS = ["/login", "/auth/register"];

export default function MainLayout({ children }) {
  const location = useLocation();
  const hideNavbar = HIDDEN_NAVBAR_PATHS.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <NavigationBar />}
      <main className="app-main">{children}</main>
    </>
  );
}
