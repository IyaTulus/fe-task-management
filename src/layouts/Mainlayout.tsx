import { Sidebar } from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 m-6">
                <Outlet />
            </main>
        </div>
    );
}