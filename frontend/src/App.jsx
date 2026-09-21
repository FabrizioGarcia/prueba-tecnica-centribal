import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LanguageSwitcher from "./components/LanguageSwitcher";
import CustomerTicketForm from "./pages/CustomerTicketForm";
import PublicTicketView from "./pages/PublicTicketView";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import AgentTicketDetail from "./pages/AgentTicketDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageSwitcher />
        <Routes>
          <Route path="/" element={<CustomerTicketForm />} />
          <Route path="/t/:publicId" element={<PublicTicketView />} />
          <Route path="/agent/login" element={<AgentLogin />} />
          <Route
            path="/agent"
            element={
              <ProtectedRoute>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/tickets/:id"
            element={
              <ProtectedRoute>
                <AgentTicketDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
