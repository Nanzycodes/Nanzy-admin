"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import InnerLayout from "@/components/inner-layout";
import ProductsTable from "@/components/products/products-table";
import ExperienceTable from "@/components/products/experience-table";
import CollectionsTable from "@/components/products/collections-table";
import ProductDetailModal from "@/components/products/product-detail-modal";
import ExperienceDetailModal from "@/components/products/experience-detail-modal";
import CollectionDetailModal from "@/components/products/collection-detail-modal";
import DeleteProductDialog from "@/components/products/delete-product-dialog";
import DeleteExperienceDialog from "@/components/products/delete-experience-dialog";
import DeleteCollectionDialog from "@/components/products/delete-collection-dialog";
import { ProductDetail, ProductList } from "@/types/product";
import { ExperienceList } from "@/types/experience";
import { ContentItem, ContentType } from "@/types/collection";
import { productsApi } from "@/lib/products-api";
import { experiencesApi } from "@/lib/experiences-api";
import { collectionsApi } from "@/lib/collections-api";
import { downloadCSV } from "@/lib/csv";
import ProductFormModal from "@/components/products/product-form-modal";
import {
  DemoDataMode,
  getDemoDataMode,
  isDemoSession,
  subscribeToDemoSession,
} from "@/lib/demo-mode";
import {
  getDemoProducts,
  saveDemoProducts,
  toProductList,
} from "@/lib/demo-products";

type Tab = "products" | "experience" | "collections";

const TABS: { label: string; value: Tab; count?: number }[] = [
  { label: "Products", value: "products", count: 10 },
  { label: "Experience", value: "experience" },
  { label: "Collections", value: "collections" },
];

const Page = () => {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [exporting, setExporting] = useState(false);
  const demoSession = useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSession,
    () => false,
  );
  const demoDataMode = useSyncExternalStore<DemoDataMode>(
    subscribeToDemoSession,
    getDemoDataMode,
    () => "sample",
  );
  const [demoProducts, setDemoProducts] = useState<ProductDetail[]>([]);
  const [demoProductsError, setDemoProductsError] = useState<string | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);

  // Products
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedDemoProduct, setSelectedDemoProduct] = useState<ProductDetail | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductList | null>(null);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);

  useEffect(() => {
    if (!demoSession) return;
    try {
      setDemoProducts(getDemoProducts(demoDataMode));
      setDemoProductsError(null);
    } catch (error) {
      setDemoProductsError(
        error instanceof Error ? error.message : "Could not load saved demo products.",
      );
    }
  }, [demoSession, demoDataMode]);

  function saveProduct(product: ProductDetail) {
    const next = demoProducts.some((item) => item.id === product.id)
      ? demoProducts.map((item) => (item.id === product.id ? product : item))
      : [product, ...demoProducts];
    try {
      saveDemoProducts(demoDataMode, next);
      setDemoProducts(next);
      setDemoProductsError(null);
    } catch (error) {
      setDemoProductsError(
        error instanceof Error ? error.message : "Could not save this demo product.",
      );
    }
  }

  function deleteDemoProduct(id: number) {
    const next = demoProducts.filter((product) => product.id !== id);
    saveDemoProducts(demoDataMode, next);
    setDemoProducts(next);
  }

  // Experiences
  const [experienceRefreshKey, setExperienceRefreshKey] = useState(0);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [isExperienceDetailOpen, setIsExperienceDetailOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<ExperienceList | null>(null);
  const [isDeleteExperienceOpen, setIsDeleteExperienceOpen] = useState(false);

  // Collections
  const [collectionsRefreshKey, setCollectionsRefreshKey] = useState(0);
  const [activeContentType, setActiveContentType] = useState<ContentType>("video");
  const [selectedCollectionItem, setSelectedCollectionItem] = useState<{ id: string | number; content_type: ContentType } | null>(null);
  const [isCollectionDetailOpen, setIsCollectionDetailOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<ContentItem | null>(null);
  const [isDeleteCollectionOpen, setIsDeleteCollectionOpen] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      if (activeTab === "products") {
        const products = demoSession
          ? demoProducts.map(toProductList)
          : (await productsApi.list({ page_size: 1000 })).data.data.results;
        const rows = products.map((p) => ({
          ID: p.id,
          Seller: p.creator_name,
          Title: p.title,
          Price: p.price,
          "Discounted Price": p.discounted_price,
          Inventory: p.inventory,
          "Discount (%)": p.discount,
          "Created At": p.created_at,
        }));
        downloadCSV("products.csv", rows);
      } else if (activeTab === "experience") {
        const res = await experiencesApi.list({ page_size: 1000 });
        const rows = res.data.data.results.map((e) => ({
          ID: e.id,
          Seller: e.creator_name,
          "Business Name": e.business_name,
          Type: e.experience_type,
          "Product Count": e.product_count,
          "Created At": e.created_at,
        }));
        downloadCSV("experiences.csv", rows);
      } else {
        const res = await collectionsApi.list({ content_type: activeContentType, page_size: 1000 });
        const results = res.data.data.results;
        let rows: Record<string, unknown>[] = [];

        if (activeContentType === "article") {
          rows = results.map((c) =>
            c.content_type === "article"
              ? { ID: c.id, Title: c.title, Author: c.author_name, Summary: c.summary, Views: c.view_count, "Created At": c.created_at }
              : {}
          );
        } else if (activeContentType === "livestream") {
          rows = results.map((c) =>
            c.content_type === "livestream"
              ? { ID: c.id, Name: c.name, Creator: c.creator_name, Email: c.creator_email, Active: c.is_active, Bidding: c.has_bidding, Products: c.products.length, Participants: c.active_participants_count, "Started At": c.started_at, "Ended At": c.ended_at ?? "", "Created At": c.created_at }
              : {}
          );
        } else {
          rows = results.map((c) =>
            c.content_type !== "article" && c.content_type !== "livestream"
              ? { ID: c.id, Caption: c.caption, Tags: c.tags, Likes: c.like_count, Views: c.view_count, Comments: c.comment_count, Shares: c.share_count, "Created At": c.created_at }
              : {}
          );
        }
        downloadCSV(`${activeContentType}.csv`, rows);
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <InnerLayout
      sectionHeader="Products"
      sectionSubheader="Manage products, experiences, collections"
    >
      {/* Tabs + Export CSV */}
      <div className="flex items-center justify-between border-b border-border mb-0">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
              {/* {tab.count !== undefined && (
                <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-semibold
                  ${activeTab === tab.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {tab.count}
                </span>
              )} */}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {demoSession && activeTab === "products" && (
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }}
              className="mb-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={16} />
              Add product
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="mb-1 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {demoSession && (
        <p className="border-b border-border bg-amber-50 px-4 py-2 text-xs text-amber-900">
          Demo product changes are saved in this browser.
        </p>
      )}
      {demoProductsError && (
        <p role="alert" className="border-b border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {demoProductsError}
        </p>
      )}

      {/* Tables */}
      {activeTab === "products" && (
        <ProductsTable
          key={productsRefreshKey}
          demoProducts={demoSession ? demoProducts.map(toProductList) : undefined}
          onViewDetails={(p) => {
            setSelectedProductId(p.id);
            setSelectedDemoProduct(
              demoProducts.find((product) => product.id === p.id) ?? null,
            );
            setIsProductDetailOpen(true);
          }}
          onDelete={(p) => { setProductToDelete(p); setIsDeleteProductOpen(true); }}
          onEdit={(p) => {
            setEditingProduct(demoProducts.find((product) => product.id === p.id) ?? null);
            setIsProductFormOpen(true);
          }}
        />
      )}
      {activeTab === "experience" && (
        <ExperienceTable
          key={experienceRefreshKey}
          onViewDetails={(e) => { setSelectedExperienceId(e.id); setIsExperienceDetailOpen(true); }}
          onDelete={(e) => { setExperienceToDelete(e); setIsDeleteExperienceOpen(true); }}
        />
      )}
      {activeTab === "collections" && (
        <CollectionsTable
          key={collectionsRefreshKey}
          onViewDetails={(c) => { setSelectedCollectionItem({ id: c.id, content_type: c.content_type }); setIsCollectionDetailOpen(true); }}
          onDelete={(c) => { setCollectionToDelete(c); setIsDeleteCollectionOpen(true); }}
          onContentTypeChange={setActiveContentType}
        />
      )}

      {/* Product modals */}
      <ProductDetailModal
        productId={selectedProductId}
        initialProduct={selectedDemoProduct}
        isOpen={isProductDetailOpen}
        onClose={() => {
          setIsProductDetailOpen(false);
          setSelectedProductId(null);
          setSelectedDemoProduct(null);
        }}
      />
      {isProductFormOpen && (
        <ProductFormModal
          key={editingProduct?.id ?? "new-product"}
          product={editingProduct}
          onClose={() => {
            setIsProductFormOpen(false);
            setEditingProduct(null);
          }}
          onSave={saveProduct}
        />
      )}
      {productToDelete && (
        <DeleteProductDialog
          product={productToDelete}
          isOpen={isDeleteProductOpen}
          onClose={() => { setIsDeleteProductOpen(false); setProductToDelete(null); }}
          onDelete={demoSession ? async () => deleteDemoProduct(productToDelete.id) : undefined}
          onDeleted={() => {
            if (!demoSession) setProductsRefreshKey((k) => k + 1);
            setProductToDelete(null);
          }}
        />
      )}

      {/* Experience modals */}
      <ExperienceDetailModal
        experienceId={selectedExperienceId}
        isOpen={isExperienceDetailOpen}
        onClose={() => { setIsExperienceDetailOpen(false); setSelectedExperienceId(null); }}
      />
      {experienceToDelete && (
        <DeleteExperienceDialog
          experience={experienceToDelete}
          isOpen={isDeleteExperienceOpen}
          onClose={() => { setIsDeleteExperienceOpen(false); setExperienceToDelete(null); }}
          onDeleted={() => setExperienceRefreshKey((k) => k + 1)}
        />
      )}

      {/* Collection modals */}
      <CollectionDetailModal
        item={selectedCollectionItem}
        isOpen={isCollectionDetailOpen}
        onClose={() => { setIsCollectionDetailOpen(false); setSelectedCollectionItem(null); }}
      />
      {collectionToDelete && (
        <DeleteCollectionDialog
          item={collectionToDelete}
          isOpen={isDeleteCollectionOpen}
          onClose={() => { setIsDeleteCollectionOpen(false); setCollectionToDelete(null); }}
          onDeleted={() => setCollectionsRefreshKey((k) => k + 1)}
        />
      )}
    </InnerLayout>
  );
};

export default Page;
