import React from "react";

/* PAGES */
import Home from "./Home";
import Contact from "./Contact";
import Career from "./Career";
import AdminPanel from "./AdminPanel";
import AdminLogin from "./AdminLogin";
import KvkkPage from "./KvkkPage"
import AdminProtectedRoute from "./AdminProtectedRoute";
import AboutPage from "./AboutPage";
import ProjectsPage from "./ProjectsPage";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";

import Company from "./Company";
/* COMPONENTS */
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import { Routes, Route, useLocation } from "react-router-dom";


const Pages = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return (
    <>
      <ScrollToTop />

      {!isAdminPage && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/kvkk" element={<KvkkPage />} />
        <Route path="/career" element={<Career />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPanel />
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <div>Admin page</div>
            </AdminProtectedRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/kurumsal" element={<Company />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
};

export default Pages;