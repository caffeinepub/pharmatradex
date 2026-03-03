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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  DollarSign,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Announcement,
  AnnouncementType,
  OrderStatus,
  type Product,
  type UserProfile,
} from "../../backend.d";
import {
  useAnnouncementsByCompany,
  useCompanyStats,
  useCreateAnnouncement,
  useCreateProduct,
  useDeactivateAnnouncement,
  useDeleteProduct,
  useIncomingOrders,
  useProductsByCompany,
  useUpdateAnnouncement,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../../hooks/useQueries";
import {
  PHARMA_CATEGORIES,
  formatDate,
  formatPrice,
  getAnnouncementTypeConfig,
  getOrderStatusConfig,
} from "../../utils/format";

interface CompanyDashboardProps {
  profile: UserProfile;
}

const ANNOUNCEMENT_TYPES = [
  AnnouncementType.Promotion,
  AnnouncementType.NewProduct,
  AnnouncementType.TradeOffer,
  AnnouncementType.General,
];

export default function CompanyDashboard({ profile }: CompanyDashboardProps) {
  const { data: stats } = useCompanyStats();
  const { data: products, isLoading: productsLoading } = useProductsByCompany(
    profile.userId,
  );
  const { data: orders, isLoading: ordersLoading } = useIncomingOrders();
  const { data: announcements, isLoading: announcementsLoading } =
    useAnnouncementsByCompany(profile.userId);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deactivateAnnouncement = useDeactivateAnnouncement();

  // Product form state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    unitPrice: "",
    minimumOrderQty: "",
    stockAvailable: "",
    imageUrl: "",
  });

  // Announcement form state
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    announcementType: AnnouncementType.General as AnnouncementType,
  });

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        category: product.category,
        unitPrice: String(product.unitPrice),
        minimumOrderQty: String(product.minimumOrderQty),
        stockAvailable: String(product.stockAvailable),
        imageUrl: product.imageUrl,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        category: "",
        unitPrice: "",
        minimumOrderQty: "",
        stockAvailable: "",
        imageUrl: "",
      });
    }
    setProductDialogOpen(true);
  };

  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.category || !productForm.unitPrice) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          productId: editingProduct.id,
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          unitPrice: Number.parseFloat(productForm.unitPrice),
          minimumOrderQty: BigInt(productForm.minimumOrderQty || "1"),
          stockAvailable: BigInt(productForm.stockAvailable || "0"),
          imageUrl: productForm.imageUrl,
          isActive: true,
        });
        toast.success("Product updated successfully!");
      } else {
        await createProduct.mutateAsync({
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          unitPrice: Number.parseFloat(productForm.unitPrice),
          minimumOrderQty: BigInt(productForm.minimumOrderQty || "1"),
          stockAvailable: BigInt(productForm.stockAvailable || "0"),
          imageUrl: productForm.imageUrl,
        });
        toast.success("Product created successfully!");
      }
      setProductDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product.");
    }
  };

  const handleDeleteProduct = async (productId: bigint) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted successfully.");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const handleOrderStatusUpdate = async (
    orderId: bigint,
    newStatus: OrderStatus,
  ) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, newStatus });
      toast.success(`Order status updated to ${newStatus}.`);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  const openAnnouncementDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        content: announcement.content,
        announcementType: announcement.announcementType,
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: "",
        content: "",
        announcementType: AnnouncementType.General,
      });
    }
    setAnnouncementDialogOpen(true);
  };

  const handleAnnouncementSubmit = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      if (editingAnnouncement) {
        await updateAnnouncement.mutateAsync({
          announcementId: editingAnnouncement.id,
          ...announcementForm,
          isActive: true,
        });
        toast.success("Announcement updated!");
      } else {
        await createAnnouncement.mutateAsync(announcementForm);
        toast.success("Announcement published!");
      }
      setAnnouncementDialogOpen(false);
    } catch {
      toast.error("Failed to save announcement.");
    }
  };

  const handleDeactivateAnnouncement = async (id: bigint) => {
    try {
      await deactivateAnnouncement.mutateAsync(id);
      toast.success("Announcement deactivated.");
    } catch {
      toast.error("Failed to deactivate announcement.");
    }
  };

  const getNextStatuses = (current: OrderStatus): OrderStatus[] => {
    const flow: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
      [OrderStatus.Confirmed]: [OrderStatus.Shipped, OrderStatus.Cancelled],
      [OrderStatus.Shipped]: [OrderStatus.Delivered],
      [OrderStatus.Delivered]: [],
      [OrderStatus.Cancelled]: [],
    };
    return flow[current] ?? [];
  };

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
              {profile.name} · Company Dashboard
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Company
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
            value="products"
            data-ocid="dashboard.products.tab"
            className="flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            data-ocid="dashboard.orders.tab"
            className="flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger
            value="announcements"
            data-ocid="dashboard.announcements.tab"
            className="flex items-center gap-1.5"
          >
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Announcements</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Products",
                value: stats ? String(stats.totalProducts) : "—",
                icon: Package,
                color: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-950/30",
              },
              {
                label: "Total Orders",
                value: stats ? String(stats.totalOrders) : "—",
                icon: ShoppingCart,
                color: "text-teal-600",
                bg: "bg-teal-50 dark:bg-teal-950/30",
              },
              {
                label: "Pending Orders",
                value: stats ? String(stats.pendingOrders) : "—",
                icon: Clock,
                color: "text-yellow-600",
                bg: "bg-yellow-50 dark:bg-yellow-950/30",
              },
              {
                label: "Total Revenue",
                value: stats ? formatPrice(stats.totalRevenue) : "—",
                icon: DollarSign,
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

          {/* Quick stats summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                Business Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                You have <strong>{String(stats?.totalProducts ?? 0)}</strong>{" "}
                active products,{" "}
                <strong>{String(stats?.pendingOrders ?? 0)}</strong> pending
                orders awaiting action, and total revenue of{" "}
                <strong>{formatPrice(stats?.totalRevenue ?? 0)}</strong>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">My Products</h2>
            <Dialog
              open={productDialogOpen}
              onOpenChange={setProductDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => openProductDialog()}
                  data-ocid="product.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <Label>Product Name *</Label>
                      <Input
                        placeholder="Amoxicillin 500mg Capsules"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        data-ocid="product.form.name.input"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Category *</Label>
                      <Select
                        value={productForm.category}
                        onValueChange={(v) =>
                          setProductForm((p) => ({ ...p, category: v }))
                        }
                      >
                        <SelectTrigger data-ocid="product.form.category.select">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PHARMA_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Unit Price (USD) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="12.99"
                        value={productForm.unitPrice}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            unitPrice: e.target.value,
                          }))
                        }
                        data-ocid="product.form.price.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Min. Order Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="10"
                        value={productForm.minimumOrderQty}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            minimumOrderQty: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Stock Available</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="500"
                        value={productForm.stockAvailable}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            stockAvailable: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Image URL</Label>
                      <Input
                        placeholder="https://..."
                        value={productForm.imageUrl}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            imageUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Product description..."
                        rows={3}
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setProductDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProductSubmit}
                    disabled={
                      createProduct.isPending || updateProduct.isPending
                    }
                    data-ocid="product.form.submit_button"
                  >
                    {createProduct.isPending || updateProduct.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {productsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !products?.length ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="products.empty_state"
            >
              <Package className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">
                No products yet
              </p>
              <p className="text-sm text-muted-foreground/70">
                Add your first pharmaceutical product to the catalog
              </p>
            </div>
          ) : (
            <Card className="shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>MOQ</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, idx) => (
                    <TableRow
                      key={String(product.id)}
                      data-ocid={`products.item.${idx + 1}`}
                    >
                      <TableCell>
                        <div className="font-medium text-sm">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatPrice(product.unitPrice)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {String(product.minimumOrderQty)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            Number(product.stockAvailable) === 0
                              ? "bg-red-100 text-red-700"
                              : Number(product.stockAvailable) <= 20
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {String(product.stockAvailable)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openProductDialog(product)}
                            data-ocid="product.edit.edit_button"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                data-ocid="product.delete.delete_button"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="product.delete.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-ocid="product.delete.confirm_button"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <h2 className="font-display text-xl font-bold mb-4">
            Incoming Orders
          </h2>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !orders?.length ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="orders.empty_state"
            >
              <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">
                No incoming orders
              </p>
              <p className="text-sm text-muted-foreground/70">
                Orders from distributors and retailers will appear here
              </p>
            </div>
          ) : (
            <Card className="shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => {
                    const statusConfig = getOrderStatusConfig(order.status);
                    const nextStatuses = getNextStatuses(order.status);
                    return (
                      <TableRow
                        key={String(order.id)}
                        data-ocid={`orders.item.${idx + 1}`}
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          #{String(order.id)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {order.buyerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.buyerRole}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.productName}
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
                          {nextStatuses.length > 0 ? (
                            <Select
                              onValueChange={(v) =>
                                handleOrderStatusUpdate(
                                  order.id,
                                  v as OrderStatus,
                                )
                              }
                            >
                              <SelectTrigger
                                className="h-8 text-xs w-32"
                                data-ocid="order.status.select"
                              >
                                <SelectValue placeholder="Update..." />
                              </SelectTrigger>
                              <SelectContent>
                                {nextStatuses.map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="text-xs"
                                  >
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Final
                            </span>
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

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">My Announcements</h2>
            <Dialog
              open={announcementDialogOpen}
              onOpenChange={setAnnouncementDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => openAnnouncementDialog()}
                  data-ocid="announcement.create.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement
                      ? "Edit Announcement"
                      : "Create Announcement"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label>Title *</Label>
                    <Input
                      placeholder="New Product Launch: Amoxicillin 500mg"
                      value={announcementForm.title}
                      onChange={(e) =>
                        setAnnouncementForm((p) => ({
                          ...p,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select
                      value={announcementForm.announcementType}
                      onValueChange={(v) =>
                        setAnnouncementForm((p) => ({
                          ...p,
                          announcementType: v as AnnouncementType,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANNOUNCEMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Content *</Label>
                    <Textarea
                      placeholder="Announcement details..."
                      rows={4}
                      value={announcementForm.content}
                      onChange={(e) =>
                        setAnnouncementForm((p) => ({
                          ...p,
                          content: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAnnouncementDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAnnouncementSubmit}
                    disabled={
                      createAnnouncement.isPending ||
                      updateAnnouncement.isPending
                    }
                    data-ocid="announcement.form.submit_button"
                  >
                    {createAnnouncement.isPending ||
                    updateAnnouncement.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {editingAnnouncement ? "Update" : "Publish"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {announcementsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !announcements?.length ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="announcements.empty_state"
            >
              <Megaphone className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">
                No announcements yet
              </p>
              <p className="text-sm text-muted-foreground/70">
                Publish promotions, new products, or trade offers
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann, idx) => {
                const typeConfig = getAnnouncementTypeConfig(
                  ann.announcementType,
                );
                return (
                  <Card
                    key={String(ann.id)}
                    className="shadow-card"
                    data-ocid={`announcements.item.${idx + 1}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.className}`}
                            >
                              {typeConfig.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(ann.createdAt)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm mb-1">
                            {ann.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ann.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openAnnouncementDialog(ann)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Deactivate Announcement
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will deactivate the announcement "
                                  {ann.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeactivateAnnouncement(ann.id)
                                  }
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
