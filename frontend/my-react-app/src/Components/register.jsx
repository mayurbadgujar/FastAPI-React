import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Form } from "react-bootstrap";
import api from "../api";
import AuthLayout from "../Components/layout/AuthLayout.jsx";
import { ROLES, ROLE_LABELS } from "../constants/roles.js";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.PATIENT);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const register = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
        role,
      });
      if (response.status === 201) {
        navigate("/login", {
          state: {
            message:
              response.data.message || "Registration successful. Please sign in.",
          },
        });
      }
    } catch (err) {
      const message = err?.response?.data?.detail || "Registration failed";
      setError(typeof message === "string" ? message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Cureveda as a patient or doctor"
    >
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <Form onSubmit={register}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Role</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value={ROLES.PATIENT}>{ROLE_LABELS[ROLES.PATIENT]}</option>
            <option value={ROLES.DOCTOR}>{ROLE_LABELS[ROLES.DOCTOR]}</option>
          </Form.Select>
          <Form.Text className="text-muted">
            The first registered user becomes an administrator automatically.
          </Form.Text>
        </Form.Group>
        <Button type="submit" className="w-100 btn-accent" disabled={submitting}>
          {submitting ? "Creating account…" : "Register"}
        </Button>
      </Form>
      <p className="auth-footer-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
