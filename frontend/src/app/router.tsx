import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import ProjectsPage from "../pages/ProjectsPage";
import CoursesPage from "../pages/CoursesPage";
import CourseDetailPage from "../pages/CourseDetailPage";
import PortfolioGeneratorPage from "../pages/PortfolioGeneratorPage";
import NewDocumentPage from "../pages/NewDocumentPage";
import NotFoundPage from "../pages/NotFoundPage";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/home" /> },
      { path: "/home", element: <HomePage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/courses", element: <CoursesPage /> },
      { path: "/courses/:courseId", element: <CourseDetailPage /> },
      { path: "/portfolio", element: <PortfolioGeneratorPage /> },
      { path: "/portfolio/new", element: <NewDocumentPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
