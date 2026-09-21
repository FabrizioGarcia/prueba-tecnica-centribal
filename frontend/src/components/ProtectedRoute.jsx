import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { agent, loading } = useAuth();

  if (loading) {
    return <p className="page-status">Loading...</p>;
  }

  if (!agent) {
    return <Navigate to="/agent/login" replace />;
  }

  return children;
}
