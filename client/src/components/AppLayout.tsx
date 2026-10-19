import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogoutMutation, useGetCurrentUserQuery } from "../features/auth/auth.api";

export default function AppLayout() {
    const navigate = useNavigate();
    const [logoutApi] = useLogoutMutation();
    const { data: userData } = useGetCurrentUserQuery();

    const storedUserStr = localStorage.getItem("user");
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    const currentUser = userData?.user || storedUser;

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `rounded-lg px-3.5 py-2 text-sm font-medium transition ${isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`;

    async function handleLogout() {
        try {
            await logoutApi().unwrap();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            navigate("/login");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-6">
                        <NavLink to="/" className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow">
                                S
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900">
                                SmartStock
                            </span>
                        </NavLink>

                        <div className="flex items-center gap-1.5">
                            <NavLink to="/" end className={linkClass}>
                                Dashboard
                            </NavLink>

                            <NavLink to="/products" className={linkClass}>
                                Products
                            </NavLink>

                            <NavLink to="/sales" className={linkClass}>
                                Sales
                            </NavLink>

                            <NavLink to="/categories" className={linkClass}>
                                Categories
                            </NavLink>

                            <NavLink to="/suppliers" className={linkClass}>
                                Suppliers
                            </NavLink>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentUser && (
                            <div className="hidden sm:flex flex-col text-right">
                                <span className="text-sm font-semibold text-slate-900">
                                    {currentUser.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {currentUser.role || "OWNER"}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-red-600 transition"
                        >
                            Log out
                        </button>
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
