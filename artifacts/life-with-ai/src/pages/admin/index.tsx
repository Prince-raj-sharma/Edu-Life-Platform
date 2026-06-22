import { Link } from "wouter";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, FileText, ShoppingBag, TrendingUp, BarChart2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and key metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : (
            <>
              {[
                { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
                { label: "Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-indigo-500" },
                { label: "PDFs", value: stats?.totalPdfs ?? 0, icon: FileText, color: "text-purple-500" },
                { label: "Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-orange-500" },
                { label: "Revenue", value: `₹${((stats?.totalRevenue ?? 0)).toLocaleString()}`, icon: TrendingUp, color: "text-green-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick links */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/admin/courses", label: "Manage Courses", icon: BookOpen },
                { href: "/admin/pdfs", label: "Manage PDFs", icon: FileText },
                { href: "/admin/users", label: "Manage Users", icon: Users },
                { href: "/admin/orders", label: "View Orders", icon: ShoppingBag },
                { href: "/admin/revenue", label: "Revenue Report", icon: BarChart2 },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
            ) : !stats?.recentOrders?.length ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{order.itemTitle}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.itemType}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-medium text-foreground">₹{order.amount.toLocaleString()}</p>
                      <Badge variant="default" className="text-xs capitalize">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Courses */}
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Top Courses by Enrollment</h2>
              <Link href="/admin/courses" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
            ) : !stats?.topCourses?.length ? (
              <p className="text-sm text-muted-foreground">No courses yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-2 font-medium text-muted-foreground">Course</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Price</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Students</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.topCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{course.title}</td>
                        <td className="py-3 text-muted-foreground">₹{course.price.toLocaleString()}</td>
                        <td className="py-3 text-muted-foreground">{course.totalStudents}</td>
                        <td className="py-3">
                          <Badge variant={course.isPublished ? "default" : "secondary"}>{course.isPublished ? "Published" : "Draft"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
