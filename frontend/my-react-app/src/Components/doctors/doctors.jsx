import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Button } from "react-bootstrap";
import AddDoctorModal from "./adddoctormodel.jsx";
import api from "../../api.jsx";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Doctors() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
    }),
    [],
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "ID",
        field: "id",
        width: 90,
      },
      {
        headerName: "Full Name",
        editable: true,
        valueGetter: (params) =>
          `${params.data.firstname ?? ""} ${params.data.lastname ?? ""}`,
      },
      {
        headerName: "Email",
        field: "email",
        editable: true,
      },
      {
        headerName: "Phone",
        editable: true,
        field: "phone",
      },
      {
        headerName: "Address",
        editable: true,
        field: "address",
      },
      {
        headerName: "Specialization",
        field: "specialization",
        editable: true,
      },
      {
        headerName: "Date of birth",
        field: "date_of_birth",
        editable: true,
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
        editable: true,
      },
    ],
    [],
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

  if (loading) {
    return (
      <div className="page-container">
        <h4>Loading doctors...</h4>
      </div>
    );
  }

  const onCellValueChanged = async (params) => {
    const field = params.colDef.field;

    const updatedRow = {
      ...params.data,
      [field]: params.newValue,
    };

    params.api.applyTransaction({ update: [updatedRow] });
    try {
      await api.put(`/doctors/${updatedRow.id}`, updatedRow);
      alert("Doctor updated successfully");
    } catch (error) {
      alert("Failed to update doctor");
    }
  };

  return (
    <div className="page-container">
      <div className="d-flex justify-content-end">
        <Button onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Doctor
        </Button>
      </div>
      <div
        className="ag-theme-quartz"
        style={{
          height: "400px",
          width: "100%",
        }}
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
      <AddDoctorModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadDoctors}
      />
    </div>
  );
}
