import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import {
  useCallerProfile,
  useCompanyProfile,
  usePlaceOrder,
  useProduct,
} from "../hooks/useQueries";
import { formatDate, formatPrice, getStockStatus } from "../utils/format";

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const productId = BigInt(id);

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: company } = useCompanyProfile(product?.companyId);

  const placeOrder = usePlaceOrder();

  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);

  const canOrder =
    profile &&
    (profile.role === UserRole.Distributor ||
      profile.role === UserRole.Retailer);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!product) return;
    const qty = Number.parseInt(quantity);

    if (!qty || qty <= 0) {
      setOrderError("Please enter a valid quantity.");
      return;
    }
    if (BigInt(qty) < product.minimumOrderQty) {
      setOrderError(
        `Minimum order quantity is ${String(product.minimumOrderQty)} units.`,
      );
      return;
    }
    if (BigInt(qty) > product.stockAvailable) {
      setOrderError(
        `Only ${String(product.stockAvailable)} units available in stock.`,
      );
      return;
    }

    try {
      await placeOrder.mutateAsync({
        productId: product.id,
        quantity: BigInt(qty),
        notes,
      });
      toast.success(
        `Order placed successfully for ${qty} units of ${product.name}!`,
      );
      setQuantity("");
      setNotes("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">
          Product Not Found
        </h2>
        <p className="text-muted-foreground mb-4">
          This product may have been removed or doesn't exist.
        </p>
        <Button asChild>
          <Link to="/catalog">Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stockAvailable);
  const totalOrderValue = quantity
    ? Number.parseFloat(quantity) * product.unitPrice
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-6 -ml-2" asChild>
        <Link to="/catalog">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Catalog
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Product Details */}
        <div className="lg:col-span-2">
          <Card className="shadow-card mb-6">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatus.className}`}
                    >
                      {stockStatus.label}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{product.companyName}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-display font-bold text-foreground">
                    {formatPrice(product.unitPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground">per unit</p>
                </div>
              </div>

              {/* Product image */}
              {product.imageUrl && (
                <div className="rounded-xl overflow-hidden bg-muted mb-4 h-48 w-full">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-2">Description</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Key specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Min. Order
                  </p>
                  <p className="font-semibold">
                    {String(product.minimumOrderQty)} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Stock Available
                  </p>
                  <p className="font-semibold">
                    {String(product.stockAvailable)} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Listed
                  </p>
                  <p className="font-semibold">
                    {formatDate(product.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Card */}
          {company && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  About {company.companyName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {company.description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {company.description}
                  </p>
                )}
                <div className="space-y-2">
                  {company.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{company.contactEmail}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{company.address}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link
                    to="/company/$id"
                    params={{ id: company.userId.toString() }}
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    View Full Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Form Sidebar */}
        <div>
          {profileLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : canOrder ? (
            <Card className="shadow-card sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="w-4 h-4" />
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={String(product.minimumOrderQty)}
                      max={String(product.stockAvailable)}
                      placeholder={`Min. ${String(product.minimumOrderQty)}`}
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        setOrderError(null);
                      }}
                      required
                      data-ocid="product_detail.quantity.input"
                    />
                    <p className="text-xs text-muted-foreground">
                      MOQ: {String(product.minimumOrderQty)} · Available:{" "}
                      {String(product.stockAvailable)}
                    </p>
                  </div>

                  {orderError && (
                    <div
                      className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2"
                      data-ocid="order.error_state"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {orderError}
                    </div>
                  )}

                  {quantity &&
                    !orderError &&
                    Number.parseInt(quantity) >=
                      Number(product.minimumOrderQty) && (
                      <div className="bg-accent/10 rounded-md p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Order Total
                          </span>
                          <span className="font-bold font-display">
                            {formatPrice(totalOrderValue)}
                          </span>
                        </div>
                      </div>
                    )}

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Order Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Delivery instructions, special requirements..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-semibold"
                    disabled={
                      placeOrder.isPending ||
                      Number(product.stockAvailable) === 0
                    }
                    data-ocid="product_detail.order.submit_button"
                  >
                    {placeOrder.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  {Number(product.stockAvailable) === 0 && (
                    <p className="text-xs text-destructive text-center">
                      This product is currently out of stock.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          ) : !profile ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Login to Order</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in as a Distributor or Retailer to place orders.
                </p>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ) : profile.role === UserRole.Company ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Building2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Company Account</h3>
                <p className="text-sm text-muted-foreground">
                  Companies cannot place orders. Switch to a Distributor or
                  Retailer account to purchase.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Data at a glance */}
          <Card className="shadow-card mt-4">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-3">Product Snapshot</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium">
                    {formatPrice(product.unitPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{product.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min. Order</span>
                  <span className="font-medium">
                    {String(product.minimumOrderQty)} units
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span
                    className={`font-medium ${stockStatus.className} px-2 py-0 rounded text-xs`}
                  >
                    {String(product.stockAvailable)} units
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
