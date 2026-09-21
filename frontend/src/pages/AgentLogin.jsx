import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function AgentLogin() {
  const { t } = useTranslation();
  const { agent, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (agent) {
    return <Navigate to="/agent" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      const redirectTo = location.state?.from || "/agent";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(t("agentLogin.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1>{t("agentLogin.title")}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          {t("agentLogin.email")}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          {t("agentLogin.password")}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? t("agentLogin.signingIn") : t("agentLogin.signIn")}
        </button>
      </form>
    </div>
  );
}
