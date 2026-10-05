import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function AuthLayout({ title, subtitle, children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-layout">
      <div className="auth-layout-toolbar">
        <Link to="/" className="auth-brand">
          Cureveda
        </Link>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <i
            className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"}`}
          />
        </button>
      </div>
      <div className="auth-card">
        <header className="auth-card-header">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </header>
        {children}
      </div>
    </div>
  );
}
