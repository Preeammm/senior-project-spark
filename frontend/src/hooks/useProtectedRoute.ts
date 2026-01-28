import { useEffect } from "react";

export function useProtectedRoute() {
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/login";
    }
  }, []);
}
