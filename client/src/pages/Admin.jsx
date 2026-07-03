import { useEffect, useState } from "react";

import { getContacts, deleteContact } from "../services/contact.service";

import ContactTable from "../components/ContactTable";

function Admin() {
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const response = await getContacts();

      setContacts(response.data);

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this contact?");

    if (!confirmed) return;

    try {
      await deleteContact(id);

      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete contact.");
    }
  };

  if (loading) {
    return (
      <div className="contact-card admin-loading">
        <div className="loading-pulse">
          <h2>Loading contacts...</h2>
          <p className="form-description">Fetching data from server</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contact-card">
        <h2>Admin Dashboard</h2>
        <div className="alert alert-error">{error}</div>
        <button className="submit-btn" onClick={fetchContacts}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="contact-card admin-card">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>

        <div className="admin-stats">
          <div className="stat-badge">
            <span className="stat-number">{contacts.length}</span>
            <span className="stat-label">Total Submissions</span>
          </div>

          <button className="refresh-btn" onClick={fetchContacts}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <p className="form-description">
        All contact form submissions from users are listed below.
      </p>

      <ContactTable contacts={contacts} onDelete={handleDelete} />
    </div>
  );
}

export default Admin;
