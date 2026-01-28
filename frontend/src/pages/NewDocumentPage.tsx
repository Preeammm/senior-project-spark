import { useProtectedRoute } from "../hooks/useProtectedRoute";

export default function NewDocumentPage() {
  useProtectedRoute();
  return <div>New Document Page</div>;
}
