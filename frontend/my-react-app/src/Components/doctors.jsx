import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import api from "../api";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register all Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function Doctors() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      flex: 1,
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
        valueGetter: (params) =>
          `${params.data.firstname ?? ""} ${params.data.lastname ?? ""}`,
      },
      {
        headerName: "Email",
        field: "email",
      },
      {
        headerName: "Phone",
        field: "phone",
      },
      {
        headerName: "Address",
        field: "address",
      },
      {
        headerName: "Specialization",
        field: "specialization",
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
    ],
    [],
  );

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await api.get("/doctors/all");
      setRowData(res.data);
    } catch (error) {
      console.error("Failed to load doctors", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <h4>Loading doctors...</h4>
      </div>
    );
  }

  return (
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
      />
    </div>
  );
}
