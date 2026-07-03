import { useState, useRef } from "react";
import { submitContact } from "../services/contact.service";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function ContactForm() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [serverMessage, setServerMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => prev.filter((error) => error.field !== name));
    setServerMessage("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== "image"),
        { field: "image", message: "Only image files are allowed (jpeg, png, webp, gif)." },
      ]);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== "image"),
        { field: "image", message: "Image must be smaller than 5MB." },
      ]);
      return;
    }

    setErrors((prev) => prev.filter((e) => e.field !== "image"));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFieldError = (fieldName) =>
    errors.find((error) => error.field === fieldName)?.message;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess(false);
    setServerMessage("");

    try {
      // Use FormData to support file upload
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("subject", formData.subject);
      data.append("message", formData.message);
      if (imageFile) {
        data.append("image", imageFile);
      }

      const response = await submitContact(data);
      setSuccess(true);
      setServerMessage(response.message);
      setFormData(initialForm);
      removeImage();
    } catch (error) {
      if (error.errors) setErrors(error.errors);
      setServerMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-card">
      <h2>Send us a Message</h2>

      <p className="form-description">
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>

      {serverMessage && (
        <div className={`alert ${success ? "alert-success" : "alert-error"}`}>
          {serverMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
          />
          {getFieldError("name") && (
            <small className="error-text">{getFieldError("name")}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
          />
          {getFieldError("email") && (
            <small className="error-text">{getFieldError("email")}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            name="subject"
            placeholder="Need assistance"
            value={formData.subject}
            onChange={handleChange}
          />
          {getFieldError("subject") && (
            <small className="error-text">{getFieldError("subject")}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="6"
            placeholder="Write your message..."
            value={formData.message}
            onChange={handleChange}
          />
          {getFieldError("message") && (
            <small className="error-text">{getFieldError("message")}</small>
          )}
        </div>

        {/* ── Image Upload ─────────────────────────────────────────── */}
        <div className="form-group">
          <label>Attach Image <span className="optional-label">(optional)</span></label>

          {!imagePreview ? (
            <label className="upload-area" htmlFor="image-input">
              <div className="upload-icon">📎</div>
              <p className="upload-text">Click to upload an image</p>
              <p className="upload-hint">JPEG, PNG, WebP, GIF — max 5MB</p>
              <input
                id="image-input"
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden-file-input"
              />
            </label>
          ) : (
            <div className="image-preview-wrapper">
              <img
                src={imagePreview}
                alt="Preview"
                className="image-preview"
              />
              <button
                type="button"
                className="remove-image-btn"
                onClick={removeImage}
              >
                ✕ Remove
              </button>
            </div>
          )}

          {getFieldError("image") && (
            <small className="error-text">{getFieldError("image")}</small>
          )}
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Submitting" : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;
