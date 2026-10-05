import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ROLE_LABELS } from "../constants/roles";

export default function NavigationBar() {
  const { user, logout, permissions } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar
      bg={theme === "light" ? "light" : "dark"}
      variant={theme === "light" ? "light" : "dark"}
      expand="lg"
      className="theme-navbar app-navbar"
    >
      <Container fluid className="app-container">
        <Navbar.Brand as={Link} to="/">
          Cureveda
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            {permissions.canViewPatients && (
              <Nav.Link as={NavLink} to="/patients">
                Patients
              </Nav.Link>
            )}
            {permissions.canViewDoctors && (
              <Nav.Link as={NavLink} to="/doctors">
                Doctors
              </Nav.Link>
            )}
            <Nav.Link as={NavLink} to="/about">
              About
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact">
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Nav className="ms-auto align-items-center gap-1">
          <Nav.Link
            className="theme-toggle-btn"
            onClick={toggleTheme}
            role="button"
            aria-label="Toggle theme"
          >
            <i
              className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"} fs-5`}
            />
          </Nav.Link>
          <NavDropdown
            title={
              <span className="d-inline-flex align-items-center gap-2">
                <i className="bi bi-person-circle fs-5" />
                {user?.username}
              </span>
            }
            align="end"
          >
            {user?.role && (
              <NavDropdown.ItemText>
                <Badge bg="secondary" className="role-badge">
                  {ROLE_LABELS[user.role] ?? user.role}
                </Badge>
              </NavDropdown.ItemText>
            )}
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
