import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useListMyOrders, getListMyOrdersQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, ShoppingBag, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useListMyOrders({ query: { queryKey: getListMyOrdersQueryKey() } });

  const courseOrders = orders?.filter((o) => o.itemType === "course" && o.status === "completed") ?? [];
  const pdfOrders = orders?.filter((o) => o.itemType === "pdf" && o.status === "completed") ?? [];

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Courses Enrolled", count: courseOrders.length, icon: BookOpen, color: "text-blue-500" },
            { label: "PDFs Purchased", count: pdfOrders.length, icon: FileText, color: "text-purple-500" },
            { label: "Total Orders", count: orders?.length ?? 0, icon: ShoppingBag, color: "text-green-500" },
          ].map(({ label, count, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className={`${color} bg-current/10 rounded-lg p-3`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">My Courses</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline">Browse more</Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : courseOrders.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No courses yet. <Link href="/courses" className="text-primary hover:underline">Browse courses</Link></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseOrders.map((order) => (
                <Link key={order.id} href={`/dashboard/course/${order.itemId}`}>
                  <div data-testid={`card-course-${order.id}`} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
                    {order.itemThumbnail ? (
                      <img src={order.itemThumbnail} alt={order.itemTitle} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground line-clamp-2">{order.itemTitle}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3" />Enrolled</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My PDFs */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">My PDFs</h2>
            <Link href="/pdfs" className="text-sm text-primary hover:underline">Browse more</Link>
          </div>
          {isLoading ? <Skeleton className="h-24 rounded-xl" /> : pdfOrders.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No PDFs yet. <Link href="/pdfs" className="text-primary hover:underline">Browse PDF store</Link></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfOrders.map((order) => (
                <Link key={order.id} href={`/pdfs/${order.itemId}`}>
                  <div data-testid={`card-pdf-${order.id}`} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
                    {order.itemThumbnail ? (
                      <img src={order.itemThumbnail} alt={order.itemTitle} className="w-14 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-purple-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground line-clamp-2">{order.itemTitle}</p>
                      <Badge variant="secondary" className="text-xs mt-1">Purchased</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Order History</h2>
          {isLoading ? <Skeleton className="h-48 rounded-xl" /> : !orders?.length ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{order.itemTitle}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground hidden sm:table-cell">{order.itemType}</td>
                      <td className="px-4 py-3 text-foreground">₹{order.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant={order.status === "completed" ? "default" : order.status === "failed" ? "destructive" : "secondary"} className="capitalize">{order.status}</Badge>
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
  );
}
