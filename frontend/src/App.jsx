import "./App.css";
import { Routes, Route } from "react-router-dom";

import Pages from "./pages/Pages";
import AdminLogin from "./pages/AdminLogin";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Routes>
          <Route path="/*" element={<Pages />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/404" element={<NotFoundPage />} />
        </Routes>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;