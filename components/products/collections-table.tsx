"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { collectionsApi } from "@/lib/collections-api";
import { ContentItem, ContentType, CONTENT_TYPE_LABELS, getContentTitle, getContentCreator } from "@/types/collection";

interface CollectionsTableProps {
  onViewDetails: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onContentTypeChange?: (type: ContentType) => void;
}

const CONTENT_TYPES: ContentType[] = ["video", "article", "livestream", "influencer_content"];

const ThreeDots = () => (
  <div className="flex items-center">
    <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
    <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
    <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
  </div>
);

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function buildColumns(activeType: ContentType, onViewDetails: (c: ContentItem) => void, onDelete: (c: ContentItem) => void): ColumnDef<ContentItem>[] {
  const actions: ColumnDef<ContentItem> = {
    key: "actions",
    header: "Actions",
    cell: (c) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center hover:opacity-70 transition-opacity">
            <ThreeDots />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onViewDetails(c)}>View Details</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(c)} className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const dateCol: ColumnDef<ContentItem> = {
    key: "created_at",
    header: "Date created",
    cell: (c) => <span className="text-muted-foreground">{formatDate(c.created_at)}</span>,
  };

  if (activeType === "livestream") {
    return [
      {
        key: "name",
        header: "Name",
        cell: (c) => (
          <div>
            <p className="font-medium text-foreground">{getContentTitle(c)}</p>
            <p className="text-xs text-muted-foreground">#{String(c.id).slice(0, 8)}</p>
          </div>
        ),
      },
      {
        key: "creator",
        header: "Creator",
        cell: (c) => <span className="text-muted-foreground">{getContentCreator(c)}</span>,
      },
      {
        key: "products",
        header: "Products",
        cell: (c) => (
          <span className="text-muted-foreground">
            {c.content_type === "livestream" ? c.products.length : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (c) => {
          const active = c.content_type === "livestream" ? c.is_active : false;
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
              active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
            }`}>
              {active ? "Live" : "Ended"}
            </span>
          );
        },
      },
      dateCol,
      actions,
    ];
  }

  if (activeType === "article") {
    return [
      {
        key: "title",
        header: "Title",
        cell: (c) => (
          <div>
            <p className="font-medium text-foreground">{getContentTitle(c)}</p>
            <p className="text-xs text-muted-foreground">#{String(c.id).slice(0, 8)}</p>
          </div>
        ),
      },
      {
        key: "author",
        header: "Author",
        cell: (c) => <span className="text-muted-foreground">{getContentCreator(c)}</span>,
      },
      {
        key: "views",
        header: "Views",
        cell: (c) => (
          <span className="text-muted-foreground">
            {c.content_type !== "livestream" ? c.view_count : "—"}
          </span>
        ),
      },
      dateCol,
      actions,
    ];
  }

  // video / influencer_content
  return [
    {
      key: "caption",
      header: "Caption",
      cell: (c) => (
        <div>
          <p className="font-medium text-foreground">{getContentTitle(c)}</p>
          <p className="text-xs text-muted-foreground">#{c.id}</p>
        </div>
      ),
    },
    {
      key: "likes",
      header: "Likes",
      cell: (c) => (
        <span className="text-muted-foreground">
          {c.content_type !== "article" && c.content_type !== "livestream" ? c.like_count : "—"}
        </span>
      ),
    },
    {
      key: "views",
      header: "Views",
      cell: (c) => (
        <span className="text-muted-foreground">
          {c.content_type !== "livestream" ? c.view_count : "—"}
        </span>
      ),
    },
    dateCol,
    actions,
  ];
}

export default function CollectionsTable({ onViewDetails, onDelete, onContentTypeChange }: CollectionsTableProps) {
  const [activeType, setActiveType] = useState<ContentType>("video");

  function handleTypeChange(type: ContentType) {
    setActiveType(type);
    onContentTypeChange?.(type);
  }
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    collectionsApi
      .list({ content_type: activeType, page_size: 50 })
      .then((res) => setItems(res.data.data.results ?? []))
      .catch(() => setError("Failed to load content"))
      .finally(() => setLoading(false));
  }, [activeType]);

  const columns = buildColumns(activeType, onViewDetails, onDelete);

  return (
    <div>
      {/* Content type filter */}
      <div className="flex gap-2 px-4 pt-4 pb-2 border-b border-border">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              activeType === type
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {CONTENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {loading && <div className="py-12 text-center text-sm text-muted-foreground">Loading content...</div>}
      {error && <div className="py-12 text-center text-sm text-destructive">{error}</div>}

      {!loading && !error && (
        <DataTable<ContentItem>
          data={items}
          columns={columns}
          getSearchText={(c) => {
            if (c.content_type === "article") return c.title + " " + c.author_name;
            if (c.content_type === "livestream") return c.name + " " + c.creator_name;
            return c.caption + " " + c.tags;
          }}
          getDate={(c) => {
            const d = new Date(c.created_at);
            return isNaN(d.getTime()) ? null : d;
          }}
          filterOptions={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          getFilterValue={(c) => (c.is_active ? "active" : "inactive")}
          emptyMessage={`No ${CONTENT_TYPE_LABELS[activeType].toLowerCase()} content found`}
        />
      )}
    </div>
  );
}
