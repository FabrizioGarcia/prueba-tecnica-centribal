import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { t } = useTranslation();
  const { agent, loading } = useAuth();

  if (loading) {
    return <p className="page-status">{t("common.loading")}</p>;
  }

  if (!agent) {
    return <Navigate to="/agent/login" replace />;
  }

  return children;
}
