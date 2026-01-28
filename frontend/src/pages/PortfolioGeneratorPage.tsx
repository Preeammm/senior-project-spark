import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

export default function PortfolioGeneratorPage() {
  useProtectedRoute();
  return (
    <div>
      <PageHeader title="Portfolio Content Generator" careerFocus="Data Analyst" onCareerFocusChange={() => {}} />
      <div>Portfolio Generator Page</div>
    </div>
  );
}
