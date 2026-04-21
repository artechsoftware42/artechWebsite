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
          <Route path="/rrq-s12-oec41-i25-9al-awk5-8zyb0" element={<AdminLogin />} />
          <Route path="/404" element={<NotFoundPage />} />
        </Routes>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
