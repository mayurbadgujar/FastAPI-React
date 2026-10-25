import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import api from "../../api.jsx";
import PageHeader from "../layout/PageHeader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getApiErrorMessage,
  showError,
  showSuccess,
} from "../../utils/toast.js";

function getLocalDateValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

const appointmentTimeSlots = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const label = new Date(2000, 0, 1, hour, minute).toLocaleTimeString(
    undefined,
    { hour: "numeric", minute: "2-digit" },
  );
  return { value, label };
});

function getAvailableTimeSlots(date) {
  if (date !== getLocalDateValue()) {
    return appointmentTimeSlots;
  }

  const now = new Date();
  const nextSlotMinute = Math.ceil(
    (now.getHours() * 60 + now.getMinutes() + 1) / 15,
  ) * 15;
  return appointmentTimeSlots.filter(({ value }) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute >= nextSlotMinute;
  });
}

function formatAppointmentTime(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function doctorName(appointment) {
  return `Dr. ${appointment.doctor_firstname} ${appointment.doctor_lastname}`;
}

export default function Appointments() {
  const { role } = useAuth();
  const isPatient = role === "patient";
  const isStaff = role === "admin" || role === "doctor";
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(getLocalDateValue);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState(null);
  const bookingPanelRef = useRef(null);

  const requestPageData = useCallback(() => {
    return Promise.all([
      api.get("/appointments/"),
      isPatient ? api.get("/doctors/all") : Promise.resolve(null),
    ]);
  }, [isPatient]);

  const loadPage = useCallback(async () => {
    try {
      const [appointmentResponse, doctorsResponse] = await requestPageData();
      setAppointments(appointmentResponse.data);
      setLoadError("");
      if (doctorsResponse) {
        setDoctors(doctorsResponse.data);
      }
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Could not load appointments"));
    } finally {
      setLoading(false);
    }
  }, [requestPageData]);

  useEffect(() => {
    let isCurrent = true;
    requestPageData()
      .then(([appointmentResponse, doctorsResponse]) => {
        if (!isCurrent) return;
        setAppointments(appointmentResponse.data);
        setLoadError("");
        if (doctorsResponse) {
          setDoctors(doctorsResponse.data);
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(
            getApiErrorMessage(error, "Could not load appointments"),
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [requestPageData]);

  const bookAppointment = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const localAppointmentDate = new Date(
        `${appointmentDate}T${appointmentTime}`,
      );
      await api.post("/appointments/", {
        doctor_id: Number(doctorId),
        scheduled_at: localAppointmentDate.toISOString(),
        reason: reason.trim() || null,
      });
      showSuccess("Appointment request sent");
      setDoctorId("");
      setAppointmentDate(getLocalDateValue());
      setAppointmentTime("");
      setReason("");
      setReschedulingAppointmentId(null);
      await loadPage();
    } catch (error) {
      showError(getApiErrorMessage(error, "Could not book appointment"));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setUpdatingId(appointmentId);
    try {
      await api.post(`/appointments/${appointmentId}/cancel`);
      showSuccess("Appointment cancelled");
      await loadPage();
    } catch (error) {
      showError(getApiErrorMessage(error, "Could not cancel appointment"));
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}`, { status });
      showSuccess("Appointment status updated");
      await loadPage();
    } catch (error) {
      showError(getApiErrorMessage(error, "Could not update appointment"));
    } finally {
      setUpdatingId(null);
    }
  };

  const startRescheduling = (appointment) => {
    setDoctorId(String(appointment.doctor_id));
    setAppointmentDate(getLocalDateValue());
    setAppointmentTime("");
    setReason(appointment.reason ?? "");
    setReschedulingAppointmentId(appointment.id);
    bookingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Appointments"
        subtitle={
          isPatient
            ? "Find a specialist and request a time that works for you."
            : "Review and manage patient appointment requests."
        }
      />

      {isPatient && (
        <section
          className="appointment-booking-panel mb-4"
          ref={bookingPanelRef}
        >
          <h2 className="h4 mb-3">
            {reschedulingAppointmentId
              ? "Choose another appointment time"
              : "Book an appointment"}
          </h2>
          {reschedulingAppointmentId && (
            <p className="text-muted mb-3">
              Select a new time for the doctor who declined your previous request.
            </p>
          )}
          {doctors.length === 0 && !loading ? (
            <p className="text-muted mb-0">
              No active doctors are available to book right now.
            </p>
          ) : (
            <Form onSubmit={bookAppointment}>
              <div className="row g-3">
                <Form.Group className="col-12 col-md-6" controlId="appointment-doctor">
                  <Form.Label>Doctor / specialty</Form.Label>
                  <Form.Select
                    required
                    value={doctorId}
                    onChange={(event) => setDoctorId(event.target.value)}
                  >
                    <option value="">Choose a specialist</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstname} {doctor.lastname} —{" "}
                        {doctor.specialization}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-12 col-md-3" controlId="appointment-date">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    min={getLocalDateValue()}
                    value={appointmentDate}
                    onChange={(event) => {
                      setAppointmentDate(event.target.value);
                      setAppointmentTime("");
                    }}
                  />
                </Form.Group>
                <Form.Group className="col-12 col-md-3" controlId="appointment-time">
                  <Form.Label>Time (15-minute slots)</Form.Label>
                  <Form.Select
                    required
                    value={appointmentTime}
                    onChange={(event) => setAppointmentTime(event.target.value)}
                  >
                    <option value="">Choose a time</option>
                    {getAvailableTimeSlots(appointmentDate).map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-12" controlId="appointment-reason">
                  <Form.Label>Reason for visit (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    maxLength={1000}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Briefly describe what you need help with"
                  />
                </Form.Group>
                <div className="col-12">
                  <Button
                    className="btn-accent"
                    type="submit"
                    disabled={submitting || doctors.length === 0}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Booking…
                      </>
                    ) : (
                      reschedulingAppointmentId
                        ? "Request new time"
                        : "Request appointment"
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </section>
      )}

      <h2 className="h4 mb-3">
        {isPatient ? "Your appointments" : "Patient appointments"}
      </h2>
      {loadError && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{loadError}</span>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              setLoading(true);
              setLoadError("");
              loadPage();
            }}
          >
            Retry
          </Button>
        </div>
      )}
      {loading ? (
        <p className="text-muted">Loading appointments…</p>
      ) : appointments.length === 0 ? (
        <div className="appointment-empty-state">
          <i className="bi bi-calendar2-check" aria-hidden="true" />
          <p className="mb-0">
            {isPatient
              ? "You haven't booked an appointment yet."
              : "There are no appointment requests yet."}
          </p>
        </div>
      ) : (
        <div className="appointment-list">
          {appointments.map((appointment) => (
            <article className="appointment-card" key={appointment.id}>
              <div className="appointment-card-main">
                <div className="appointment-card-heading">
                  <h3>{doctorName(appointment)}</h3>
                  <span className={`appointment-status status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="appointment-specialty">
                  {appointment.specialization}
                </p>
                {!isPatient && (
                  <p>
                    <i className="bi bi-person me-2" aria-hidden="true" />
                    {appointment.patient_name}
                  </p>
                )}
                <p>
                  <i className="bi bi-calendar-event me-2" aria-hidden="true" />
                  {formatAppointmentTime(appointment.scheduled_at)}
                </p>
                {appointment.reason && (
                  <p className="appointment-reason">{appointment.reason}</p>
                )}
              </div>
              <div className="appointment-card-actions">
                {isPatient && appointment.status === "declined" && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => startRescheduling(appointment)}
                  >
                    Choose another time
                  </Button>
                )}
                {isPatient && ["pending", "confirmed"].includes(appointment.status) && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={updatingId === appointment.id}
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  )}
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
                      Confirm
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={updatingId === appointment.id}
                      onClick={() => updateStatus(appointment.id, "declined")}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {isStaff && appointment.status === "confirmed" && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={updatingId === appointment.id}
                    onClick={() => updateStatus(appointment.id, "completed")}
                  >
                    Mark completed
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
