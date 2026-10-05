import { Link } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import PageHeader from "../Components/layout/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_LABELS } from "../constants/roles.js";

export default function Home() {
  const { user, permissions } = useAuth();

  return (
    <div className="page-container">
      <PageHeader
        title={`Hello, ${user?.username ?? "there"}`}
        subtitle={
          user?.role
            ? `You are signed in as ${ROLE_LABELS[user.role] ?? user.role}.`
            : "Your medical workspace dashboard"
        }
      />
      <Row className="g-3 dashboard-grid">
        {permissions.canViewDoctors && (
          <Col md={6} lg={4}>
            <Card className="dashboard-card h-100">
              <Card.Body>
                <div className="dashboard-icon">
                  <i className="bi bi-heart-pulse" />
                </div>
                <Card.Title>Doctors</Card.Title>
                <Card.Text>Browse and manage the doctor directory.</Card.Text>
                <Link to="/doctors" className="stretched-link">
                  Open doctors
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}
        {permissions.canViewPatients && (
          <Col md={6} lg={4}>
            <Card className="dashboard-card h-100">
              <Card.Body>
                <div className="dashboard-icon">
                  <i className="bi bi-people" />
                </div>
                <Card.Title>Patients</Card.Title>
                <Card.Text>View and update patient records.</Card.Text>
                <Link to="/patients" className="stretched-link">
                  Open patients
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col md={6} lg={4}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <div className="dashboard-icon">
                <i className="bi bi-info-circle" />
              </div>
              <Card.Title>About</Card.Title>
              <Card.Text>Learn how Cureveda is structured.</Card.Text>
              <Link to="/about" className="stretched-link">
                Read more
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
