import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Package, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useAllActiveProducts,
  useAllCompanyProfiles,
} from "../hooks/useQueries";

export default function CompaniesPage() {
  const { data: companies, isLoading: companiesLoading } =
    useAllCompanyProfiles();
  const { data: products } = useAllActiveProducts();
  const [search, setSearch] = useState("");

  const productCountByCompany = useMemo(() => {
    if (!products) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.companyId.toString();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    const q = search.toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [companies, search]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Company Directory
        </h1>
        <p className="text-muted-foreground">
          Discover {companies?.length ?? 0} verified pharmaceutical companies on
          Pharmact
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      {companiesLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => `skel-company-${i}`).map(
            (key) => (
              <Card key={key} className="shadow-card">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ),
          )}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="companies.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No companies found</h3>
          <p className="text-muted-foreground text-sm">
            {search
              ? "Try a different search term."
              : "No pharmaceutical companies are registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company, idx) => {
            const productCount =
              productCountByCompany.get(company.userId.toString()) ?? 0;
            return (
              <Link
                key={company.userId.toString()}
                to="/company/$id"
                params={{ id: company.userId.toString() }}
              >
                <Card
                  className="shadow-card card-hover h-full border border-border hover:border-accent/40 transition-colors"
                  data-ocid={`companies.item.${idx + 1}`}
                >
                  <CardContent className="p-6">
                    {/* Company header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl pharma-gradient-bg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-base leading-snug mb-0.5 truncate">
                          {company.companyName}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {company.name}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {company.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {company.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic mb-4">
                        No description provided.
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>
                          {productCount}{" "}
                          {productCount === 1 ? "product" : "products"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-accent font-medium">
                        View Profile
                        <ArrowRight className="w-4 h-4" />
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
