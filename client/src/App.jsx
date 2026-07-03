import ContactForm from "./components/ContactForm";

function App() {
  return (
    <main className="app">
      <section className="container">
        <div className="hero">
          <p className="badge">Production Ready Contact Portal</p>

          <h1>
            Secure Contact
            <br />
            Portal
          </h1>

          <p className="subtitle">
            A simple production-ready contact form demonstrating React,
            Express, MongoDB, Zod Validation, Rate Limiting, Morgan,
            Winston Logging, Helmet, and Cloudflare deployment.
          </p>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}

export default App;