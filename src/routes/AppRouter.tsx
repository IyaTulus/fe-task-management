import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import MainLayout from "../layouts/Mainlayout";
import TaskPage from "../pages/Task/TaskPage";
import SettingsPage from "../pages/Setting/SettingPage";
import NotFoundPage from "../pages/NotFoundPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <TaskPage />,
            },
            {
                path: "settings",
                element: <SettingsPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
