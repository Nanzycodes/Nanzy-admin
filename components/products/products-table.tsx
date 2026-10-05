"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { productsApi } from "@/lib/products-api";
import { ProductList } from "@/types/product";

interface ProductsTableProps {
  onViewDetails: (product: ProductList) => void;
  onDelete: (product: ProductList) => void;
  onEdit?: (product: ProductList) => void;
  demoProducts?: ProductList[];
}

const ThreeDots = () => (
  <div className="flex items-center">
    <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
    <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
    <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
  </div>
);

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function formatPrice(price: string): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return price;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductsTable({
  onViewDetails,
  onDelete,
  onEdit,
  demoProducts,
}: ProductsTableProps) {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoProducts) return;
    void productsApi
      .list({ page_size: 50 })
      .then((res) => setProducts(res.data.data.results ?? []))
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [demoProducts]);

  const columns: ColumnDef<ProductList>[] = [
    {
      key: "seller",
      header: "Seller ID",
      cell: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.creator_name}</p>
          <p className="text-xs text-muted-foreground">#{p.id}</p>
        </div>
      ),
    },
    {
      key: "title",
      header: "Product name",
      cell: (p) => <span className="text-muted-foreground">{p.title}</span>,
    },
    {
      key: "price",
      header: "Price",
      cell: (p) => <span className="text-muted-foreground">{formatPrice(p.price)}</span>,
    },
    {
      key: "inventory",
      header: "Inventory",
      cell: (p) => <span className="text-muted-foreground">{p.inventory}</span>,
    },
    {
      key: "created_at",
      header: "Date created",
      cell: (p) => <span className="text-muted-foreground">{formatDate(p.created_at)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center hover:opacity-70 transition-opacity">
              <ThreeDots />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onViewDetails(p)}>View Details</DropdownMenuItem>
            {demoProducts && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(p)}>Edit</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(p)} className="text-destructive focus:text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading && !demoProducts) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading products...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-sm text-destructive">{error}</div>;
  }

  return (
    <DataTable<ProductList>
      data={demoProducts ?? products}
      columns={columns}
      getSearchText={(p) => p.creator_name + " " + p.title}
      getDate={(p) => {
        const d = new Date(p.created_at);
        return isNaN(d.getTime()) ? null : d;
      }}
      filterOptions={[
        { label: "In Stock", value: "in_stock" },
        { label: "Out of Stock", value: "out_of_stock" },
      ]}
      getFilterValue={(p) => (p.inventory > 0 ? "in_stock" : "out_of_stock")}
      emptyMessage="No products found"
    />
  );
}
