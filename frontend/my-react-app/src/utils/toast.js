import { toast } from "react-toastify";

export function getApiErrorMessage(err, fallback = "Something went wrong") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg ?? String(item)).join(", ");
  }
  return fallback;
}

export function showSuccess(message) {
  toast.success(message);
}

export function showError(message) {
  toast.error(message);
}
