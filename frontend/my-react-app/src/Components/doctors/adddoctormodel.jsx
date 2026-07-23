import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../../api";

export default function AddDoctorModal({ show, onClose, onSuccess }) {
  const initialDoctor = {
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    degree: "",
    specialization: "",
    address: "",
    date_of_birth: "",
    completion_date: "",
    is_active: true,
  };
  const [errors, setErrors] = useState({});
  const [doctor, setDoctor] = useState({ initialDoctor });

  const resetForm = () => {
    setDoctor(initialDoctor);
    setErrors({});
  };
  const validate = () => {
    const newErrors = {};

    if (!doctor.firstname.trim()) {
      newErrors.firstname = "First Name is required";
    }

    if (!doctor.lastname.trim()) {
      newErrors.lastname = "Last Name is required";
    }

    if (!doctor.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctor.email)) {
      newErrors.email = "Invalid email";
    }

    if (!doctor.phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(doctor.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!doctor.degree.trim()) {
      newErrors.degree = "Degree is required";
    }

    if (!doctor.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }

    if (!doctor.date_of_birth) {
      newErrors.date_of_birth = "Date of Birth is required";
    }

    if (!doctor.completion_date) {
      newErrors.completion_date = "Completion Date is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDoctor({
      ...doctor,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const saveDoctor = async () => {
    if (!validate()) return;
    try {
      await api.post("/doctors/create", doctor);
      onSuccess();
      alert("Doctor added!");
      resetForm();
      onClose();
      setDoctor({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        degree: "",
        specialization: "",
        address: "",
        date_of_birth: "",
        completion_date: "",
        is_active: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Doctor</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstname"
                value={doctor.firstname || ""}
                onChange={handleChange}
                isInvalid={!!errors.firstname}
              />
              <Form.Control.Feedback type="invalid">
                {!errors.firstname}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="lastname"
                value={doctor.lastname}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={doctor.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={doctor.phone}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Degree</Form.Label>
              <Form.Control
                name="degree"
                value={doctor.degree}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Specialization</Form.Label>
              <Form.Control
                name="specialization"
                value={doctor.specialization}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address"
                value={doctor.address}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="date_of_birth"
                value={doctor.date_of_birth}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Completion Date</Form.Label>
              <Form.Control
                type="date"
                name="completion_date"
                value={doctor.completion_date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Active"
              name="is_active"
              checked={doctor.is_active}
              onChange={handleChange}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button variant="primary" onClick={saveDoctor}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
