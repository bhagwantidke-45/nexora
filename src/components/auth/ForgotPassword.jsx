import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Zap, ArrowLeft } from "lucide-react";
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Zap size={28} className="text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl blur opacity-30"></div>
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