import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error("Failed to send reset email!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
              style={{ background: "linear-gradient(135deg,#12052a,#1e0a3c)" }}
            >
              <svg width="44" height="44" viewBox="0 0 512 512" fill="none">
                <defs>
                  <linearGradient id="lfl-forgot" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="40%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path
                  d="M256 72C256 72 324 118 320 168C346 144 338 104 338 104C338 104 380 148 372 200C364 244 344 272 308 292C292 301 274 306 256 308C238 306 220 301 204 292C168 272 148 244 140 200C132 148 174 104 174 104C174 104 166 144 192 168C188 118 256 72 256 72Z"
                  fill="url(#lfl-forgot)"
                />
                <path
                  d="M256 132C256 132 290 158 287 182C304 168 299 146 299 146C299 146 322 172 318 198C314 220 300 236 278 246C271 249 264 251 256 252C248 251 241 249 234 246C212 236 198 220 194 198C190 172 213 146 213 146C213 146 208 168 225 182C222 158 256 132 256 132Z"
                  fill="white"
                  opacity="0.22"
                />
                <ellipse cx="256" cy="222" rx="30" ry="38" fill="white" opacity="0.10" />
                <circle cx="196" cy="400" r="22" fill="#f97316" opacity="0.9" />
                <circle cx="256" cy="400" r="22" fill="#ec4899" opacity="0.9" />
                <circle cx="316" cy="400" r="22" fill="#a855f7" opacity="0.9" />
              </svg>
            </div>
            <div
              className="absolute -inset-1 rounded-2xl blur opacity-40 animate-pulse-slow"
              style={{ background: "linear-gradient(135deg,#f97316,#ec4899,#a855f7)" }}
            />
          </div>
          <h1 className="font-display font-bold text-3xl text-gradient">Nexora</h1>
          <p className="text-gray-400 text-sm mt-1">Your Personal Productivity Hub</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {!sent ? (
            <>
              <h2 className="font-display font-semibold text-xl text-white mb-2">
                Reset Password 🔐
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-glass pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 text-base"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-400" />
              </div>
              <h2 className="font-display font-semibold text-xl text-white mb-2">
                Check your email! 📧
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                We sent a password reset link to{" "}
                <span className="text-primary-400">{email}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn-secondary w-full justify-center py-3"
              >
                Send again
              </button>
            </div>
          )}

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm mt-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;