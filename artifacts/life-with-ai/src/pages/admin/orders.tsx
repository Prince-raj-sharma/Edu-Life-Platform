import { useState } from "react";
import { useListAllOrders, getListAllOrdersQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);

  const params = { page, limit: 20 };
  const { data, isLoading } = useListAllOrders(params, { query: { queryKey: getListAllOrdersQueryKey(params) } });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} total orders</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : !data?.orders?.length ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{order.itemTitle}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground hidden sm:table-cell">{order.itemType}</td>
                    <td className="px-4 py-3 text-foreground">₹{order.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={order.status === "completed" ? "default" : order.status === "failed" ? "destructive" : "secondary"} className="capitalize">{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.pages && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Previous</button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
