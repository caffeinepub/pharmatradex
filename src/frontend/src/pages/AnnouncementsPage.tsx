import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Link } from "@tanstack/react-router";
import { Building2, Gift, Info, Megaphone, Package, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { AnnouncementType } from "../backend.d";
import { useAllActiveAnnouncements } from "../hooks/useQueries";
import { formatDate, getAnnouncementTypeConfig } from "../utils/format";

const FILTER_OPTIONS = [
  { value: "all", label: "All", icon: Megaphone },
  { value: AnnouncementType.Promotion, label: "Promotions", icon: Gift },
  { value: AnnouncementType.NewProduct, label: "New Products", icon: Package },
  { value: AnnouncementType.TradeOffer, label: "Trade Offers", icon: Tag },
  { value: AnnouncementType.General, label: "General", icon: Info },
];

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAllActiveAnnouncements();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!announcements) return [];
    if (filter === "all") return announcements;
    return announcements.filter((a) => a.announcementType === filter);
  }, [announcements, filter]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Announcements Board
        </h1>
        <p className="text-muted-foreground">
          Stay updated with the latest promotions, new products, and trade
          offers from pharmaceutical companies
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(v) => v && setFilter(v)}
          className="flex flex-wrap gap-2 justify-start"
        >
          {FILTER_OPTIONS.map((opt) => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className="flex items-center gap-1.5 px-4 h-9 text-sm rounded-full border border-border data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:border-accent"
              data-ocid="announcements.filter.tab"
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, i) => `skel-ann-${i}`).map((key) => (
            <Card key={key} className="shadow-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="announcements.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No announcements found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {filter !== "all"
              ? "No announcements in this category yet."
              : "No announcements have been published yet."}
          </p>
          {filter !== "all" && (
            <Button variant="outline" onClick={() => setFilter("all")}>
              View All
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length}{" "}
            {filtered.length === 1 ? "announcement" : "announcements"}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((ann, idx) => {
              const typeConfig = getAnnouncementTypeConfig(
                ann.announcementType,
              );
              return (
                <Card
                  key={String(ann.id)}
                  className="shadow-card card-hover border border-border hover:border-accent/30 transition-colors"
                  data-ocid={`announcements.item.${idx + 1}`}
                >
                  <CardContent className="p-5">
                    {/* Type badge + date */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeConfig.className}`}
                      >
                        {typeConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(ann.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-base mb-2 leading-snug">
                      {ann.title}
                    </h3>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {ann.content}
                    </p>

                    {/* Company footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <Link
                          to="/company/$id"
                          params={{ id: ann.companyId.toString() }}
                          className="text-accent hover:underline font-medium text-xs"
                        >
                          {ann.companyName}
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
