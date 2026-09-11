import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative" 
        onClick={(event) => event.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h2>
          <p className="text-sm text-slate-500">Use your account to save sermons and continue watching.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
            <input 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              value={name} 
              onChange={(event) => setName(event.target.value)} 
              required 
              placeholder="Your name"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-red-600/20 mt-2"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignInModal;
