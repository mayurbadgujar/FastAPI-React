import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import PageHeader from "../Components/layout/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_LABELS } from "../constants/roles.js";
import api from "../api.jsx";
import {
  getApiErrorMessage,
  showError,
  showSuccess,
} from "../utils/toast.js";

function formatAppointmentTime(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getAppointmentsInDashboardWindow(appointments, includeAllDates) {
  if (includeAllDates) {
    return appointments.sort(
      (first, second) =>
        new Date(first.scheduled_at) - new Date(second.scheduled_at),
    );
  }

  const now = Date.now();
  const start = now - 24 * 60 * 60 * 1000;
  const end = now + 3 * 24 * 60 * 60 * 1000;

  return appointments
    .filter((appointment) => {
      const scheduledAt = new Date(appointment.scheduled_at).getTime();
      return scheduledAt >= start && scheduledAt <= end;
    })
    .sort(
      (first, second) =>
        new Date(first.scheduled_at) - new Date(second.scheduled_at),
    );
}

export default function Home() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";
  const isStaff = user?.role === "admin" || user?.role === "doctor";
  const includeAllDates = isStaff;
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadAppointments = useCallback(async () => {
    const response = await api.get("/appointments/");
    setAppointments(
      getAppointmentsInDashboardWindow(response.data, includeAllDates),
    );
    setAppointmentsError("");
  }, [includeAllDates]);

  useEffect(() => {
    let isCurrent = true;
    api
      .get("/appointments/")
      .then((response) => {
        if (isCurrent) {
          setAppointments(
            getAppointmentsInDashboardWindow(response.data, includeAllDates),
          );
          setAppointmentsError("");
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setAppointmentsError(
            getApiErrorMessage(error, "Could not load appointments"),
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setAppointmentsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [includeAllDates]);

  const updateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}`, { status });
    } catch (error) {
      showError(getApiErrorMessage(error, "Could not update appointment"));
      setUpdatingId(null);
      return;
    }

    showSuccess(
      status === "confirmed"
        ? "Appointment accepted"
        : "Appointment declined",
    );
    try {
      await loadAppointments();
    } catch (error) {
      setAppointmentsError(
        getApiErrorMessage(
          error,
          "Appointment updated, but the list could not be refreshed",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title={`Hello, ${user?.username ?? "there"}`}
        subtitle={
          user?.role
            ? isStaff
              ? `${ROLE_LABELS[user.role] ?? user.role} appointment schedule.`
              : "Your appointments from the past day through the next three days."
            : "Appointments from the past day through the next three days."
        }
      />

      <section className="dashboard-appointments">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 className="h4 mb-1">
              {isPatient ? "Your appointments" : "Patient appointments"}
            </h2>
            <p className="page-subtitle">
              {isPatient
                ? "Your recent and upcoming visits."
                : isStaff
                  ? "Appointments assigned to you. Accept or decline pending requests."
                  : "Appointments assigned to your doctor account."}
            </p>
          </div>
          <Button
            as={Link}
            to="/appointments"
            variant="outline-primary"
            size="sm"
          >
            View all appointments
          </Button>
        </div>

        {appointmentsError ? (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>{appointmentsError}</span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                setAppointmentsLoading(true);
                loadAppointments()
                  .catch((error) =>
                    setAppointmentsError(
                      getApiErrorMessage(
                        error,
                        "Could not load appointments",
                      ),
                    ),
                  )
                  .finally(() => setAppointmentsLoading(false));
              }}
            >
              Retry
            </Button>
          </div>
        ) : appointmentsLoading ? (
          <p className="text-muted">Loading appointments…</p>
        ) : appointments.length === 0 ? (
          <div className="appointment-empty-state">
            <i className="bi bi-calendar2-check" aria-hidden="true" />
            <p className="mb-0">
              No appointments in the past day or the next three days.
            </p>
          </div>
        ) : (
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <article className="appointment-card" key={appointment.id}>
                <div className="appointment-card-main">
                  <div className="appointment-card-heading">
                    <h3>
                      Dr. {appointment.doctor_firstname}{" "}
                      {appointment.doctor_lastname}
                    </h3>
                    <span
                      className={`appointment-status status-${appointment.status}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <p className="appointment-specialty">
                    {appointment.specialization}
                  </p>
                  {!isPatient && <p>Patient: {appointment.patient_name}</p>}
                  <p>
                    <i
                      className="bi bi-calendar-event me-2"
                      aria-hidden="true"
                    />
                    {formatAppointmentTime(appointment.scheduled_at)}
                  </p>
                </div>
                <div className="appointment-card-actions">
                  {isStaff && appointment.status === "pending" && (
                    <>
                      <Button
                        variant="outline-success"
                        size="sm"
                        disabled={updatingId === appointment.id}
                        onClick={() =>
                          updateStatus(appointment.id, "confirmed")
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={updatingId === appointment.id}
                        onClick={() =>
                          updateStatus(appointment.id, "declined")
                        }
                      >
                        Deny
                      </Button>
                    </>
                  )}
                  {isPatient && appointment.status === "declined" && (
                    <Link
                      className="btn btn-sm btn-outline-primary"
                      to="/appointments"
                    >
                      Choose another time
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
