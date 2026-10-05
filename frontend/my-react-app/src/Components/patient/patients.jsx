import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import api from "../../api.jsx";
import PageHeader from "../../Components/layout/PageHeader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { showSuccess, showError, getApiErrorMessage } from "../../utils/toast.js";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Patients() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { permissions } = useAuth();
  const { isDark } = useTheme();
  const canEdit = permissions.canManagePatients;

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
        field: "fullname",
      },
      {
        headerName: "Date of Birth",
        editable: canEdit,
        field: "dob",
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
          if (isNaN(date.getTime())) return false;
          const formattedDate = date.toISOString().split("T")[0];
          params.data.dob = formattedDate;
          return true;
        },
      },
      { headerName: "Phone", editable: canEdit, field: "phone" },
      { headerName: "Gender", editable: canEdit, field: "sex" },
      { headerName: "Address", editable: canEdit, field: "address" },
      { headerName: "Remarks", editable: canEdit, field: "remark" },
      { headerName: "Active", field: "is_active", editable: canEdit },
    ],
    [canEdit],
  );

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await api.get("/patient/all");
      const formattedData = response.data.map((patient) => ({
        ...patient,
        dob: patient.dob?.split("T")[0] || null,
      }));
      setRowData(formattedData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCellValueChanged = async (params) => {
    if (!canEdit) {
      return;
    }

    const field = params.colDef.field;
    const updatedRows = {
      ...params.data,
      [field]: params.newValue,
    };
    params.api.applyTransaction({ update: [updatedRows] });
    try {
      await api.put(`/patient/${params.data.id}`, updatedRows);
      showSuccess("Patient updated successfully");
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to update patient"));
      loadPatients();
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading patients…</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Patients"
        subtitle="Clinical staff can review and update patient records."
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
    </div>
  );
}
