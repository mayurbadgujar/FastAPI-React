import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Button } from "react-bootstrap";
import AddDoctorModal from "./adddoctormodel.jsx";
import api from "../../api.jsx";
import PageHeader from "../../Components/layout/PageHeader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  showSuccess,
  showError,
  getApiErrorMessage,
} from "../../utils/toast.js";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Doctors() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { permissions } = useAuth();
  const { isDark } = useTheme();
  const canEdit = permissions.canManageDoctors;

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      editable: canEdit,
    }),
    [canEdit],
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "ID",
        field: "id",
        width: 90,
        editable: false,
      },
      {
        headerName: "Full Name",
        editable: canEdit,
        valueGetter: (params) =>
          `${params.data.firstname ?? ""} ${params.data.lastname ?? ""}`,
      },
      {
        headerName: "Email",
        field: "email",
        editable: canEdit,
      },
      {
        headerName: "Phone",
        editable: canEdit,
        field: "phone",
      },
      {
        headerName: "Address",
        editable: canEdit,
        field: "address",
      },
      {
        headerName: "Specialization",
        field: "specialization",
        editable: canEdit,
      },
      {
        headerName: "Date of birth",
        field: "date_of_birth",
        editable: canEdit,
        cellEditor: "agDateStringCellEditor",
        cellEditorParams: {
          min: "0001-01-01",
          max: new Date().toISOString().split("T")[0],
        },
        valueFormatter: (params) => {
          if (!params.value) return "";
          const [year, month, day] = params.value.split("-");
          return `${month}/${day}/${year}`;
        },
        valueSetter: (params) => {
          if (!params.newValue) return false;
          const date = new Date(params.newValue);
          const formatted = date.toISOString().split("T")[0];
          params.data.date_of_birth = formatted;
          return true;
        },
      },
      {
        headerName: "Experience (Years)",
        editable: false,
        valueGetter: (params) => {
          if (!params.data.completion_date) {
            return "";
          }

          const completion = new Date(params.data.completion_date);
          const today = new Date();
          let years = today.getFullYear() - completion.getFullYear();
          const monthDiff = today.getMonth() - completion.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < completion.getDate())
          ) {
            years--;
          }
          return years;
        },
      },
      {
        headerName: "Active",
        field: "is_active",
        editable: canEdit,
      },
    ],
    [canEdit],
  );

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await api.get("/doctors/all");
      const formatted = res.data.map((doc) => ({
        ...doc,
        date_of_birth: doc.date_of_birth?.split("T")[0] ?? "",
        completion_date: doc.completion_date?.split("T")[0] ?? "",
      }));

      setRowData(formatted);
    } catch (error) {
      console.error("Failed to load doctors", error);
    } finally {
      setLoading(false);
    }
  };

  const onCellValueChanged = async (params) => {
    if (!canEdit) {
      return;
    }

    const field = params.colDef.field;

    const updatedRow = {
      ...params.data,
      [field]: params.newValue,
    };

    params.api.applyTransaction({ update: [updatedRow] });
    try {
      await api.put(`/doctors/${updatedRow.id}`, updatedRow);
      showSuccess("Doctor updated successfully");
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to update doctor"));
      loadDoctors();
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading doctors…</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Doctors"
        subtitle={canEdit}
        actions={
          canEdit ? (
            <Button className="btn-accent" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-circle me-2" />
              Add doctor
            </Button>
          ) : null
        }
      />
      <div
        className={`ag-theme-quartz${isDark ? "-dark" : ""} data-grid-panel`}
      >
        <AgGridReact
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          animateRows={true}
          getRowId={(params) => params.data.id.toString()}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
      {canEdit && (
        <AddDoctorModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadDoctors}
        />
      )}
    </div>
  );
}
