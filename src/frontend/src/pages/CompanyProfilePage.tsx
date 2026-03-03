import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Megaphone,
  Package,
  Phone,
} from "lucide-react";
import {
  useAnnouncementsByCompany,
  useCompanyProfile,
  useProductsByCompany,
} from "../hooks/useQueries";
import {
  formatDate,
  formatPrice,
  getAnnouncementTypeConfig,
  getStockStatus,
} from "../utils/format";

export default function CompanyProfilePage() {
  const { id } = useParams({ from: "/company/$id" });

  // We need to convert id string to Principal
  // We use a workaround since we can't import Principal directly here
  const principalLike = {
    toString: () => id,
    toText: () => id,
  } as unknown as Principal;

  const { data: company, isLoading: companyLoading } =
    useCompanyProfile(principalLike);
  const { data: products, isLoading: productsLoading } =
    useProductsByCompany(principalLike);
  const { data: announcements, isLoading: announcementsLoading } =
    useAnnouncementsByCompany(principalLike);

  if (companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-48 w-full mb-6" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">
          Company Not Found
        </h2>
        <p className="text-muted-foreground mb-4">
          This company profile doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/companies">Browse Companies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 -ml-2" asChild>
        <Link to="/companies">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Companies
        </Link>
      </Button>

      {/* Company Header */}
      <Card className="shadow-card mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl pharma-gradient-bg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl font-bold mb-1">
                    {company.companyName}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {company.name}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Company
                </Badge>
              </div>

              {company.description && (
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-2xl">
                  {company.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-4">
                {company.contactEmail && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a
                      href={`mailto:${company.contactEmail}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {company.contactEmail}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-xl font-bold">Products</h2>
            {products && (
              <Badge variant="secondary" className="ml-auto">
                {products.length}
              </Badge>
            )}
          </div>

          {productsLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : !products?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl">
              <Package className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">
                No products listed yet
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stockAvailable);
                return (
                  <Link
                    key={String(product.id)}
                    to="/product/$id"
                    params={{ id: String(product.id) }}
                  >
                    <Card className="shadow-card card-hover h-full border border-border hover:border-accent/40 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatus.className}`}
                          >
                            {stockStatus.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {product.description}
                        </p>
                        <div className="flex items-end justify-between">
                          <span className="font-display font-bold">
                            {formatPrice(product.unitPrice)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            MOQ: {String(product.minimumOrderQty)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements Sidebar */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-lg font-bold">Announcements</h2>
          </div>

          {announcementsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : !announcements?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/30 rounded-xl">
              <Megaphone className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground text-sm">No announcements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => {
                const typeConfig = getAnnouncementTypeConfig(
                  ann.announcementType,
                );
                return (
                  <Card key={String(ann.id)} className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
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
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {ann.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
