import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <main style={{ width: "100%" }}>
        <Outlet />
      </main>
    </div>
  );
}
