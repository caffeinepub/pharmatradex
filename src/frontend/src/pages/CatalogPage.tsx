import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Building2, Filter, Package, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllActiveProducts } from "../hooks/useQueries";
import {
  PHARMA_CATEGORIES,
  formatPrice,
  getStockStatus,
} from "../utils/format";

export default function CatalogPage() {
  const { data: products, isLoading } = useAllActiveProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");

  const companies = useMemo(() => {
    if (!products) return [];
    const names = [...new Set(products.map((p) => p.companyName))].sort();
    return names;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchesCompany =
        selectedCompany === "all" || p.companyName === selectedCompany;
      return matchesSearch && matchesCategory && matchesCompany;
    });
  }, [products, searchTerm, selectedCategory, selectedCompany]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedCompany("all");
  };

  const hasActiveFilters =
    searchTerm || selectedCategory !== "all" || selectedCompany !== "all";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Product Catalog
        </h1>
        <p className="text-muted-foreground">
          Browse {products?.length ?? 0} pharmaceutical products from verified
          companies
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-ocid="catalog.search.search_input"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger
            className="sm:w-48"
            data-ocid="catalog.category.select"
          >
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PHARMA_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="sm:w-48">
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={clearFilters}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4 mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? `${filteredProducts.length} of ${products?.length ?? 0} products`
              : `${filteredProducts.length} products`}
          </p>
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => `skel-catalog-${i}`).map(
            (key) => (
              <Card key={key} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ),
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="catalog.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No products found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "No products are available yet. Check back soon!"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, idx) => {
            const stockStatus = getStockStatus(product.stockAvailable);
            return (
              <Link
                key={String(product.id)}
                to="/product/$id"
                params={{ id: String(product.id) }}
                data-ocid={
                  idx < 10 ? `catalog.product.item.${idx + 1}` : undefined
                }
              >
                <Card className="shadow-card card-hover h-full border border-border hover:border-accent/40 transition-colors">
                  <CardContent className="p-4 flex flex-col h-full">
                    {/* Category pill */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>
                    </div>

                    {/* Product name */}
                    <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Company */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {product.companyName}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                      {product.description ||
                        "High-quality pharmaceutical product. Contact supplier for details."}
                    </p>

                    {/* Price and MOQ */}
                    <div className="mt-auto">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-lg font-display font-bold text-foreground">
                            {formatPrice(product.unitPrice)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            per unit
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-muted-foreground">
                            MOQ
                          </p>
                          <p className="text-sm font-bold">
                            {String(product.minimumOrderQty)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
