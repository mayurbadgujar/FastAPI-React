import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import api from "../../api";
import {
  showSuccess,
  showError,
  getApiErrorMessage,
} from "../../utils/toast.js";

export default function AddPatientModal({ show, onClose, onSuccess }) {
  const initialPatient = {
    fullname: "",
    dob: "",
    phone: "",
    sex: "",
    address: "",
    date_of_birth: "",
    remark: "",
    is_active: true,
  };
  const [errors, setErrors] = useState({});
  const [patient, setPatient] = useState(initialPatient);
  const canEdit = permissions.canManageDoctors;
  const resetForm = () => {
    setPatient(initialPatient);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!patient.fullname.trim()) {
      newErrors.fullname = "Full Name is required";
    }

    if (!patient.dob) {
      newErrors.dob = "Date of Birth is required";
    }

    if (!patient.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!patient.sex.trim()) {
      newErrors.sex = "Sex is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    try {
      await api.post("/patient/", patient);
      onSuccess();
      handleClose();
      resetForm();
      showSuccess("Patient added successfully");
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to add patient"));
    }
  };

  return (
    <Modal show={show} onClose={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Patient</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-2" controlId="fullname">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter full name"
              value={patient.fullname}
              onChange={(e) =>
                setPatient({ ...patient, fullname: e.target.value })
              }
              required
              isInvalid={!!errors.fullname}
            />
            <Form.Control.Feedback type="invalid">
              {errors.fullname}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-2" controlId="dob">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              value={patient.dob}
              onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
              required
              isInvalid={!!errors.dob}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dob}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2" controlId="phone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone number"
              value={patient.phone}
              onChange={(e) =>
                setPatient({ ...patient, phone: e.target.value })
              }
              required
              isInvalid={!!errors.phone}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2" controlId="sex">
            <Form.Label>Sex</Form.Label>
            <Form.Select
              value={patient.sex}
              onChange={(e) => setPatient({ ...patient, sex: e.target.value })}
              required
              isInvalid={!!errors.sex}
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.sex}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter address"
              value={patient.address}
              onChange={(e) =>
                setPatient({ ...patient, address: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-2" controlId="remark">
            <Form.Label>Remark</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter remark"
              value={patient.remark}
              onChange={(e) =>
                setPatient({ ...patient, remark: e.target.value })
              }
            />
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="Active"
            name="is_active"
            checked={patient.is_active}
            onChange={(e) =>
              setPatient({ ...patient, is_active: e.target.checked })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
