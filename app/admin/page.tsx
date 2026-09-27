import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Aggregate DB metrics
  const [
    ordersCount,
    pendingPaymentsCount,
    productsCount,
    lowStockProducts,
    allOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { status: "Payment Review" },
    }),
    prisma.product.count(),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        payment: true,
      },
    }),
  ]);

  // Calculate total confirmed revenue
  const confirmedOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["Payment Confirmed", "Processing", "Ready to Ship", "Shipped", "Delivered"],
      },
    },
    select: { total: true },
  });

  const totalRevenue = confirmedOrders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5E0]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
            Atelier Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-[#121212] mt-0.5">
            Operations & Treasury
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/payments"
            className="px-4 py-2.5 bg-[#9B783E] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#826330] transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Verify Payments ({pendingPaymentsCount})
          </Link>
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] transition-colors"
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-[#E8E5E0] p-6 space-y-2">
          <div className="flex items-center justify-between text-[#8E8B85]">
            <span className="text-xs uppercase tracking-wider font-medium">
              Confirmed Revenue
            </span>
            <DollarSign className="w-4 h-4 text-[#9B783E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#121212]">
            LKR {Math.round(totalRevenue).toLocaleString()}
          </div>
          <p className="text-[11px] text-[#2A6B46] flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Wire Verified Transactions
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#E8E5E0] p-6 space-y-2">
          <div className="flex items-center justify-between text-[#8E8B85]">
            <span className="text-xs uppercase tracking-wider font-medium">
              Total Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#121212]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#121212]">
            {ordersCount}
          </div>
          <p className="text-[11px] text-[#66635F]">
            Across all boutique channels
          </p>
        </div>

        {/* Pending Payments Review */}
        <div className="bg-white border border-[#E8E5E0] p-6 space-y-2">
          <div className="flex items-center justify-between text-[#8E8B85]">
            <span className="text-xs uppercase tracking-wider font-medium">
              Pending Wire Review
            </span>
            <Clock className="w-4 h-4 text-[#9B783E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#9B783E]">
            {pendingPaymentsCount}
          </div>
          <Link
            href="/admin/payments"
            className="text-[11px] text-[#9B783E] hover:underline flex items-center gap-1 font-medium"
          >
            Review receipts in queue →
          </Link>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-[#E8E5E0] p-6 space-y-2">
          <div className="flex items-center justify-between text-[#8E8B85]">
            <span className="text-xs uppercase tracking-wider font-medium">
              Active Catalog
            </span>
            <Package className="w-4 h-4 text-[#121212]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#121212]">
            {productsCount} Pieces
          </div>
          <p className="text-[11px] text-[#66635F]">
            {lowStockProducts.length} low stock alerts
          </p>
        </div>
      </div>

      {/* Simple Revenue & Status Visualizer */}
      <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
              Order Pipeline Distribution
            </h2>
            <p className="text-xs text-[#66635F]">
              Real-time progression from wire transfer receipt to global dispatch
            </p>
          </div>
          <span className="text-xs text-[#8E8B85] font-mono">
            {ordersCount} Total Orders
          </span>
        </div>

        {/* Progress distribution bar */}
        <div className="w-full h-3 bg-[#FAF8F5] border border-[#E8E5E0] flex overflow-hidden">
          <div
            className="bg-[#9B783E] h-full"
            style={{ width: `${ordersCount > 0 ? (pendingPaymentsCount / ordersCount) * 100 : 0}%` }}
            title="Pending Payment Review"
          />
          <div
            className="bg-[#2A6B46] h-full"
            style={{ width: `${ordersCount > 0 ? (confirmedOrders.length / ordersCount) * 100 : 0}%` }}
            title="Payment Confirmed / Dispatched"
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#66635F]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#9B783E]" />
            <span>Under Wire Review ({pendingPaymentsCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#2A6B46]" />
            <span>Confirmed / Dispatched ({confirmedOrders.length})</span>
          </div>
        </div>
      </div>

      {/* Two-column layout: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs uppercase tracking-wider text-[#9B783E] hover:underline flex items-center gap-1"
            >
              View all orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E5E0] text-[10px] uppercase tracking-wider text-[#8E8B85]">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5E0]">
                {allOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 font-mono font-medium text-[#121212]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 text-[#66635F]">
                      <div className="font-medium text-[#121212]">{order.customerName}</div>
                      <div className="text-[10px] text-[#8E8B85] truncate max-w-[150px]">
                        {order.customerEmail}
                      </div>
                    </td>
                    <td className="py-3.5 font-semibold text-[#121212]">
                      LKR {Math.round(order.total).toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          order.status === "Payment Confirmed"
                            ? "bg-[#F0FDF4] text-[#2A6B46]"
                            : order.status === "Payment Review"
                            ? "bg-[#FAF4EB] text-[#9B783E]"
                            : order.status === "Payment Rejected"
                            ? "bg-[#FFF5F5] text-[#9B2C2C]"
                            : "bg-[#FAF8F5] text-[#121212]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {order.status === "Payment Review" ? (
                        <Link
                          href="/admin/payments"
                          className="text-[11px] uppercase font-semibold text-[#9B783E] hover:underline"
                        >
                          Verify Receipt →
                        </Link>
                      ) : (
                        <Link
                          href={`/order/${order.orderNumber}`}
                          className="text-[11px] text-[#8E8B85] hover:text-[#121212]"
                        >
                          View →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
              Stock Alerts
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs text-[#9B783E] hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-[#66635F]">All inventory levels are healthy.</p>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-[#FAF8F5] border border-[#E8E5E0] flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-medium text-[#121212] line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-[#8E8B85]">{p.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[#9B783E] font-semibold">
                      <AlertTriangle className="w-3 h-3" /> {p.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
