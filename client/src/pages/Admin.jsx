import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContacts, deleteContact } from "../services/contact.service";
import { logout } from "../services/auth.service";
import ContactTable from "../components/ContactTable";
import SkeletonTable from "../components/SkeletonTable";

function Admin() {
  const navigate = useNavigate();
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
      // If token expired, redirect to login
      if (err.message?.includes("expired") || err.message?.includes("log in")) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
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
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete contact.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // ── Skeleton loading ─────────────────────────────────────────────────────
  if (loading) return <SkeletonTable rows={5} />;

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="contact-card">
        <h2>Admin Dashboard</h2>
        <div className="alert alert-error">{error}</div>
        <button className="submit-btn" onClick={fetchContacts}>Retry</button>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="contact-card admin-card">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>

        <div className="admin-stats">
          <div className="stat-badge">
            <span className="stat-number">{contacts.length}</span>
            <span className="stat-label">Submissions</span>
          </div>

          <button className="refresh-btn" onClick={fetchContacts}>↻ Refresh</button>

          <button className="logout-btn" onClick={handleLogout}>↩ Logout</button>
        </div>
      </div>

      <p className="form-description">
        All contact form submissions are listed below.
      </p>

      <ContactTable contacts={contacts} onDelete={handleDelete} />
    </div>
  );
}

export default Admin;
