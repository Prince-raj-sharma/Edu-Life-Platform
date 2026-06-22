import { useParams, useLocation } from "wouter";
import { useGetPdf, getGetPdfQueryKey, useDownloadPdf, getDownloadPdfQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, CheckCircle } from "lucide-react";

export default function PdfDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { initiatePayment } = useRazorpay();

  const { data: pdf, isLoading } = useGetPdf(id!, {
    query: { enabled: !!id, queryKey: getGetPdfQueryKey(id!) },
  });

  const { data: downloadData } = useDownloadPdf(id!, {
    query: { enabled: !!id && !!pdf?.isPurchased, queryKey: getDownloadPdfQueryKey(id!) },
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-64 rounded-xl" />
        <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
      </div>
    </div>
  );

  if (!pdf) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground">PDF not found.</p>
    </div>
  );

  const handleBuy = () => {
    if (!isAuthenticated) { setLocation("/auth/login"); return; }
    initiatePayment(pdf.id, "pdf", () => setLocation("/payment/success"), () => setLocation("/payment/failed"));
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="rounded-xl overflow-hidden border border-border bg-muted h-72 flex items-center justify-center">
            {pdf.thumbnail ? (
              <img src={pdf.thumbnail} alt={pdf.title} className="w-full h-full object-cover" />
            ) : (
              <FileText className="w-20 h-20 text-muted-foreground" />
            )}
          </div>

          <div>
            <Badge variant="outline" className="mb-3">{pdf.category}</Badge>
            <h1 className="text-2xl font-bold text-foreground mb-4">{pdf.title}</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">{pdf.description}</p>
            {pdf.pageCount && <p className="text-sm text-muted-foreground mb-6">{pdf.pageCount} pages</p>}

            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">₹{pdf.price.toLocaleString()}</span>
              {pdf.originalPrice && pdf.originalPrice > pdf.price && (
                <span className="text-lg text-muted-foreground line-through ml-2">₹{pdf.originalPrice.toLocaleString()}</span>
              )}
            </div>

            {pdf.isPurchased ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5" />Purchased
                </div>
                {downloadData?.downloadUrl && (
                  <a href={downloadData.downloadUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-lg py-3 font-semibold hover:opacity-90 transition-opacity">
                    <Download className="w-4 h-4" />Download PDF
                  </a>
                )}
              </div>
            ) : (
              <button data-testid="button-buy-pdf" onClick={handleBuy} className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-semibold hover:opacity-90 transition-opacity">
                Buy Now
              </button>
            )}

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Instant access after purchase</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />High-quality PDF format</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Lifetime access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
