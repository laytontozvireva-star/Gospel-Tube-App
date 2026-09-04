import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function SignInModal({ open, onClose }) {
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await signIn({ name, email, password });
      onClose();
      setName("");
      setEmail("");
      setPassword("");
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in. Please try again.");
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        <h2>Sign In</h2>
        <p>Use your account to save sermons and continue watching.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          <button type="submit">Continue</button>
        </form>
      </div>
    </div>
  );
}

export default SignInModal;
