import { useProtectedRoute } from "../hooks/useProtectedRoute";

export default function CourseDetailPage() {
  useProtectedRoute();
  return <div>Course Detail Page</div>;
}
