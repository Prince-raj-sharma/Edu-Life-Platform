import { useState } from "react";
import { useListPdfs, useCreatePdf, useUpdatePdf, useDeletePdf, getListPdfsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Plus, Pencil, Trash2, FileText, Upload } from "lucide-react";

function PdfForm({ initial, onSave, onClose, loading }: { initial?: any; onSave: (d: any) => void; onClose: () => void; loading: boolean }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? "",
    originalPrice: initial?.originalPrice ?? "",
    category: initial?.category ?? "AI & ML",
    thumbnail: initial?.thumbnail ?? "",
    pageCount: initial?.pageCount ?? "",
    fileUrl: initial?.fileUrl ?? "",
    filePublicId: initial?.filePublicId ?? "",
  });
  const { upload, isUploading } = useFileUpload();
  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await upload(file, "pdf");
    if (res) { update("fileUrl", res.url); update("filePublicId", res.publicId); }
  };

  return (
    <>
      <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
        <div><Label>Title</Label><Input data-testid="input-title" className="mt-1" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="PDF title" /></div>
        <div><Label>Description</Label><Textarea className="mt-1" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="PDF description" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Price (₹)</Label><Input data-testid="input-price" className="mt-1" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></div>
          <div><Label>Original Price (₹)</Label><Input className="mt-1" type="number" value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} /></div>
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["AI & ML","Career Guides","Interview Prep","Data Science","Business","Productivity"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Thumbnail URL</Label><Input className="mt-1" value={form.thumbnail} onChange={(e) => update("thumbnail", e.target.value)} placeholder="https://..." /></div>
        <div><Label>Page Count</Label><Input className="mt-1" type="number" value={form.pageCount} onChange={(e) => update("pageCount", e.target.value)} /></div>
        <div>
          <Label>PDF File</Label>
          <div className="mt-1 flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Upload PDF"}
              <input type="file" accept=".pdf" className="hidden" onChange={handleFile} disabled={isUploading} />
            </label>
            {form.fileUrl && <span className="text-xs text-green-600">✓ File uploaded</span>}
          </div>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button data-testid="button-save" onClick={() => onSave({ ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, pageCount: form.pageCount ? Number(form.pageCount) : undefined })} disabled={loading || isUploading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
          {loading ? "Saving..." : "Save PDF"}
        </button>
      </DialogFooter>
    </>
  );
}

export default function AdminPdfsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const params = { page, limit: 20 };
  const { data, isLoading } = useListPdfs(params, { query: { queryKey: getListPdfsQueryKey(params) } });
  const createPdf = useCreatePdf();
  const updatePdf = useUpdatePdf();
  const deletePdf = useDeletePdf();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListPdfsQueryKey(params) });

  const handleCreate = async (form: any) => {
    try {
      await createPdf.mutateAsync({ data: form });
      toast({ title: "PDF created!" });
      setShowCreate(false);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.error, variant: "destructive" });
    }
  };

  const handleUpdate = async (form: any) => {
    try {
      await updatePdf.mutateAsync({ id: editing.id, data: form });
      toast({ title: "PDF updated!" });
      setEditing(null);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.error, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deletePdf.mutateAsync({ id });
      toast({ title: "PDF deleted" });
      invalidate();
    } catch {
      toast({ title: "Error deleting PDF", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage PDFs</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} total PDFs</p>
          </div>
          <button data-testid="button-create-pdf" onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" />New PDF
          </button>
        </div>

        {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        : !data?.pdfs?.length ? (
          <div className="text-center py-20"><FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No PDFs yet.</p></div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.pdfs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{pdf.title}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{pdf.category}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">₹{pdf.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button data-testid={`button-edit-${pdf.id}`} onClick={() => setEditing(pdf)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                        <button data-testid={`button-delete-${pdf.id}`} onClick={() => handleDelete(pdf.id, pdf.title)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.pages && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Previous</button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Next</button>
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create New PDF</DialogTitle></DialogHeader>
            <PdfForm onSave={handleCreate} onClose={() => setShowCreate(false)} loading={createPdf.isPending} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit PDF</DialogTitle></DialogHeader>
            {editing && <PdfForm initial={editing} onSave={handleUpdate} onClose={() => setEditing(null)} loading={updatePdf.isPending} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
