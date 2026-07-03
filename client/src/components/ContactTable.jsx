function ContactTable({ contacts, onDelete }) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Contacts Found</h3>

        <p>No users have submitted the contact form yet.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="contact-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map((contact, index) => (
            <tr key={contact._id}>
              <td>{index + 1}</td>

              <td>{contact.name}</td>

              <td>{contact.email}</td>

              <td>{contact.subject}</td>

              <td className="message-cell">
                {contact.message.length > 60
                  ? contact.message.slice(0, 60) + "..."
                  : contact.message}
              </td>

              <td>
                {new Date(contact.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>

              <td>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(contact._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactTable;
