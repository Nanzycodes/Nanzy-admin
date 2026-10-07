"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable, { ColumnDef } from "@/components/ui/data-table";
import { experiencesApi } from "@/lib/experiences-api";
import { ExperienceList } from "@/types/experience";

interface ExperienceTableProps {
  onViewDetails: (experience: ExperienceList) => void;
  onDelete: (experience: ExperienceList) => void;
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
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export default function ExperienceTable({ onViewDetails, onDelete }: ExperienceTableProps) {
  const [experiences, setExperiences] = useState<ExperienceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    experiencesApi
      .list({ page_size: 50 })
      .then((res) => {
        if (active) setExperiences(res.data.data.results ?? []);
      })
      .catch(() => {
        if (active) setError("Failed to load experiences");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const columns: ColumnDef<ExperienceList>[] = [
    {
      key: "seller",
      header: "Seller ID",
      cell: (e) => (
        <div>
          <p className="font-medium text-foreground">{e.creator_name}</p>
          <p className="text-xs text-muted-foreground">#{e.id}</p>
        </div>
      ),
    },
    {
      key: "businessName",
      header: "Business name",
      cell: (e) => <span className="text-muted-foreground">{e.business_name}</span>,
    },
    {
      key: "experience_type",
      header: "Category",
      cell: (e) => (
        <span className="text-muted-foreground capitalize">{e.experience_type}</span>
      ),
    },
    {
      key: "product_count",
      header: "Products",
      cell: (e) => <span className="text-muted-foreground">{String(e.product_count)}</span>,
    },
    {
      key: "created_at",
      header: "Date created",
      cell: (e) => <span className="text-muted-foreground">{formatDate(e.created_at)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (e) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center hover:opacity-70 transition-opacity">
              <ThreeDots />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onViewDetails(e)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(e)} className="text-destructive focus:text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return <div className="py-12 text-center text-sm text-muted-foreground">Loading experiences...</div>;
  if (error) return <div className="py-12 text-center text-sm text-destructive">{error}</div>;

  return (
    <DataTable<ExperienceList>
      data={experiences}
      columns={columns}
      getSearchText={(e) => e.creator_name + " " + e.business_name + " " + e.experience_type}
      getDate={(e) => {
        const d = new Date(e.created_at);
        return isNaN(d.getTime()) ? null : d;
      }}
      filterOptions={[
        { label: "Shortlet", value: "shortlet" },
        { label: "Spa", value: "spa" },
        { label: "Salon", value: "salon" },
        { label: "Hotel", value: "hotel" },
        { label: "Rental", value: "rental" },
        { label: "Pharmacy", value: "pharmacy" },
        { label: "Bakery", value: "bakery" },
        { label: "Restaurant", value: "restaurant" },
        { label: "Cafe", value: "cafe" },
        { label: "Alcohol", value: "alcohol" },
        { label: "Boat", value: "boat" },
        { label: "Car", value: "car" },
        { label: "Gift", value: "gift" },
      ]}
      getFilterValue={(e) => e.experience_type}
      emptyMessage="No experiences found"
    />
  );
}
