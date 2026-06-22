import { useState } from "react";
import { Link } from "wouter";
import { useListPdfs, getListPdfsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText } from "lucide-react";

const CATEGORIES = ["All", "AI & ML", "Career Guides", "Interview Prep", "Data Science", "Business", "Productivity"];

function PdfCard({ pdf }: { pdf: any }) {
  return (
    <Link href={`/pdfs/${pdf.id}`}>
      <div data-testid={`card-pdf-${pdf.id}`} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
        <div className="relative h-44 bg-muted overflow-hidden">
          {pdf.thumbnail ? (
            <img src={pdf.thumbnail} alt={pdf.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/30">
              <FileText className="w-12 h-12 text-accent-foreground/40" />
            </div>
          )}
          {pdf.originalPrice && pdf.originalPrice > pdf.price && (
            <Badge className="absolute top-3 right-3 bg-green-600 text-white">
              {Math.round((1 - pdf.price / pdf.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>
        <div className="p-5">
          <Badge variant="outline" className="text-xs mb-2">{pdf.category}</Badge>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{pdf.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pdf.description}</p>
          {pdf.pageCount && <p className="text-xs text-muted-foreground mb-3">{pdf.pageCount} pages</p>}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary">₹{pdf.price.toLocaleString()}</span>
              {pdf.originalPrice && pdf.originalPrice > pdf.price && (
                <span className="text-sm text-muted-foreground line-through ml-2">₹{pdf.originalPrice.toLocaleString()}</span>
              )}
            </div>
            {pdf.isPurchased && <Badge variant="secondary" className="text-xs">Purchased</Badge>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PdfsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const params = {
    ...(search && { search }),
    ...(category !== "All" && { category }),
    page,
    limit: 12,
  };

  const { data, isLoading } = useListPdfs(params, {
    query: { queryKey: getListPdfsQueryKey(params) },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">PDF Store</h1>
          <p className="text-muted-foreground">Premium study materials, guides, and resources</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search PDFs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <Skeleton className="h-44 w-full" />
                <div className="p-5 space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-6 w-24" /></div>
              </div>
            ))}
          </div>
        ) : !data?.pdfs?.length ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No PDFs found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{data.total} items found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.pdfs.map((pdf) => <PdfCard key={pdf.id} pdf={pdf} />)}
            </div>
            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors">Previous</button>
                <span className="text-sm text-muted-foreground">Page {page} of {data.pages}</span>
                <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
