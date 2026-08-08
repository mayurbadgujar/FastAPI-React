import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import api from "../../api.jsx";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function Patients() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
    }),
    [],
  );

  const columnDefs = useMemo(() => [
    {
      headerName: "ID",
      field: "id",
      width: 90,
    },
    {
      headerName: "Full Name",
      editable: true,
      field: "fullname",
    },
    {
      headerName: "Date of Birth",
      editable: true,
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
    { headerName: "Phone", editable: true, field: "phone" },
    { headerName: "Gender", editable: true, field: "sex" },
    { headerName: "Address", editable: true, field: "address" },
    { headerName: "Remarks", editable: true, field: "remark" },
    { headerName: "Active", field: "is_active", editable: true },
  ]);

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

  if (loading) {
    return (
      <div className="page-container">
        <h4>Loading patients...</h4>
      </div>
    );
  }

  const onCellValueChanged = async (params) => {
    const field = params.colDef.field;
    const updatedRows = {
      ...params.data,
      [field]: params.newValue,
    };
    params.api.applyTransaction({ update: [updatedRows] });
    try {
      await api.put(`/patient/${params.data.id}`, updatedRows);
      alert("Patient updated successfully");
    } catch (error) {
      alert("Faied to update");
    }
  };

  return (
    <div className="page-container">
      <div
        className="ag-theme-quartz"
        style={{ height: "400px", width: "100%" }}
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
