import SummaryCards from "./components/SummaryCards";
import LowStockTable from "../products/LowStockTable";
import DailySalesChart from "../analytics/DailySalesChart";

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                        SmartStock / Overview
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Monitor your inventory and business performance.
                    </p>
                </header>

                <SummaryCards />
                <LowStockTable />
                <DailySalesChart />
            </div>
        </main>
    );
}