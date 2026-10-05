import PageHeader from "../Components/layout/PageHeader.jsx";

export default function Contact() {
  return (
    <div className="page-container">
      <PageHeader title="Contact" subtitle="Get in touch with the Cureveda team." />
      <div style={{ maxWidth: 700 }}>
        <p>
          For support or feedback, please reach out to the Cureveda team at{" "}
          <strong>support@cureveda.example.com</strong>.
        </p>
        <p>
          If you have questions about doctors or appointments, we are happy to help.
        </p>
      </div>
    </div>
  );
}
