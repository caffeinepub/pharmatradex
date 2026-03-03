import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Loader2,
  Package,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatus, type UserProfile } from "../../backend.d";
import {
  useBuyerStats,
  useCancelOrder,
  useMyOrders,
} from "../../hooks/useQueries";
import {
  formatDate,
  formatPrice,
  getOrderStatusConfig,
} from "../../utils/format";

interface BuyerDashboardProps {
  profile: UserProfile;
}

export default function BuyerDashboard({ profile }: BuyerDashboardProps) {
  const { data: stats } = useBuyerStats();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const cancelOrder = useCancelOrder();

  const handleCancelOrder = async (orderId: bigint, productName: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success(`Order for "${productName}" has been cancelled.`);
    } catch {
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const RoleIcon = profile.role === "Distributor" ? Truck : Store;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {profile.companyName}
            </h1>
            <p className="text-muted-foreground">
              {profile.name} · {profile.role} Dashboard
            </p>
          </div>
          <Badge
            className={
              profile.role === "Distributor"
                ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
            }
          >
            <RoleIcon className="w-3 h-3 mr-1" />
            {profile.role}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 bg-muted">
          <TabsTrigger
            value="overview"
            data-ocid="dashboard.overview.tab"
            className="flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            data-ocid="dashboard.orders.tab"
            className="flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">My Orders</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Total Orders",
                value: stats ? String(stats.totalOrders) : "—",
                icon: ShoppingCart,
                color: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-950/30",
              },
              {
                label: "Pending Orders",
                value: stats ? String(stats.pendingOrders) : "—",
                icon: Clock,
                color: "text-yellow-600",
                bg: "bg-yellow-50 dark:bg-yellow-950/30",
              },
              {
                label: "Delivered Orders",
                value: stats ? String(stats.deliveredOrders) : "—",
                icon: CheckCircle2,
                color: "text-green-600",
                bg: "bg-green-50 dark:bg-green-950/30",
              },
            ].map((stat) => (
              <Card key={stat.label} className="shadow-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-xl font-display font-bold">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Access */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="shadow-card card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                    <Package className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Browse Catalog</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore pharmaceutical products
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/catalog">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Company Directory</h3>
                    <p className="text-sm text-muted-foreground">
                      Find pharmaceutical companies
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/companies">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Orders Tab */}
        <TabsContent value="orders">
          <h2 className="font-display text-xl font-bold mb-4">My Orders</h2>

          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !orders?.length ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="my_orders.empty_state"
            >
              <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                Browse the catalog and place your first order
              </p>
              <Button asChild>
                <Link to="/catalog">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <Card className="shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => {
                    const statusConfig = getOrderStatusConfig(order.status);
                    return (
                      <TableRow
                        key={String(order.id)}
                        data-ocid={`my_orders.item.${idx + 1}`}
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          #{String(order.id)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {order.productName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.supplierName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {String(order.quantity)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.status === OrderStatus.Pending && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive text-xs h-7"
                                  data-ocid="order.cancel.delete_button"
                                >
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel Order
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel the order
                                    for "{order.productName}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="order.cancel.cancel_button">
                                    Keep Order
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleCancelOrder(
                                        order.id,
                                        order.productName,
                                      )
                                    }
                                    disabled={cancelOrder.isPending}
                                    className="bg-destructive text-destructive-foreground"
                                    data-ocid="order.cancel.confirm_button"
                                  >
                                    {cancelOrder.isPending ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
