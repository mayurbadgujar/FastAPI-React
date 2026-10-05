import PageHeader from "../Components/layout/PageHeader.jsx";

export default function About() {
  return (
    <div className="page-container">
      <PageHeader title="About Cureveda" subtitle="Learn about the Cureveda platform." />
      <div style={{ maxWidth: 700 }}>
        <p>
          Cureveda is a simple medical directory interface that helps you find doctors,
          view their details, and manage appointments. It is built with React, FastAPI,
          and SQLite.
        </p>
        <p>
          This demo shows how authentication, protected routes, and data listing can
          work together in a modern web app.
        </p>
      </div>
    </div>
  );
}
