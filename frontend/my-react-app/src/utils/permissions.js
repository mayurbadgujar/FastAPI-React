import { ROLES } from "../constants/roles";

export function canViewDoctors(role) {
  return [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT].includes(role);
}

export function canManageDoctors(role) {
  return role === ROLES.ADMIN;
}

export function canViewPatients(role) {
  return role === ROLES.ADMIN || role === ROLES.DOCTOR;
}

export function canManagePatients(role) {
  return role === ROLES.ADMIN || role === ROLES.DOCTOR;
}
