import { useGetRevenueStats, getGetRevenueStatsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BookOpen, FileText, ShoppingBag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminRevenuePage() {
  const { data, isLoading } = useGetRevenueStats({ query: { queryKey: getGetRevenueStatsQueryKey() } });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Revenue Report</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Platform financial overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {isLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />) : (
            <>
              {[
                { label: "Total Revenue", value: data?.totalRevenue ?? 0, icon: TrendingUp, color: "text-green-500" },
                { label: "Course Revenue", value: data?.courseRevenue ?? 0, icon: BookOpen, color: "text-blue-500" },
                { label: "PDF Revenue", value: data?.pdfRevenue ?? 0, icon: FileText, color: "text-purple-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">₹{(value as number).toLocaleString()}</p>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-bold text-foreground mb-6">Monthly Revenue</h2>
          {isLoading ? <Skeleton className="h-64 w-full" /> : !data?.monthlyRevenue?.length ? (
            <div className="text-center py-16"><ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">No revenue data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
