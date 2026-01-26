import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
