import { useState } from "react";
import { Link } from "wouter";
import { useListCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, getListCoursesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, BookOpen } from "lucide-react";

function CourseForm({ initial, onSave, onClose, loading }: { initial?: any; onSave: (d: any) => void; onClose: () => void; loading: boolean }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? "",
    originalPrice: initial?.originalPrice ?? "",
    category: initial?.category ?? "AI & Machine Learning",
    difficulty: initial?.difficulty ?? "beginner",
    instructor: initial?.instructor ?? "",
    thumbnail: initial?.thumbnail ?? "",
    isPublished: initial?.isPublished ?? false,
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
        <div><Label>Title</Label><Input data-testid="input-title" className="mt-1" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Course title" /></div>
        <div><Label>Description</Label><Textarea className="mt-1" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Course description" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Price (₹)</Label><Input data-testid="input-price" className="mt-1" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0" /></div>
          <div><Label>Original Price (₹)</Label><Input className="mt-1" type="number" value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} placeholder="Optional" /></div>
        </div>
        <div><Label>Instructor</Label><Input data-testid="input-instructor" className="mt-1" value={form.instructor} onChange={(e) => update("instructor", e.target.value)} placeholder="Instructor name" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => update("difficulty", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["AI & Machine Learning","Data Science","Web Development","Python","Deep Learning","NLP","Computer Vision"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Thumbnail URL</Label><Input className="mt-1" value={form.thumbnail} onChange={(e) => update("thumbnail", e.target.value)} placeholder="https://..." /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="rounded border-border" />
          <Label htmlFor="published">Published (visible to students)</Label>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button data-testid="button-save" onClick={() => onSave({ ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined })} disabled={loading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
          {loading ? "Saving..." : "Save Course"}
        </button>
      </DialogFooter>
    </>
  );
}

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const params = { page, limit: 20 };
  const { data, isLoading } = useListCourses(params, { query: { queryKey: getListCoursesQueryKey(params) } });
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey(params) });

  const handleCreate = async (form: any) => {
    try {
      await createCourse.mutateAsync({ data: form });
      toast({ title: "Course created!" });
      setShowCreate(false);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.error, variant: "destructive" });
    }
  };

  const handleUpdate = async (form: any) => {
    try {
      await updateCourse.mutateAsync({ id: editing.id, data: form });
      toast({ title: "Course updated!" });
      setEditing(null);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.error, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteCourse.mutateAsync({ id });
      toast({ title: "Course deleted" });
      invalidate();
    } catch {
      toast({ title: "Error deleting course", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Courses</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} total courses</p>
          </div>
          <button data-testid="button-create-course" onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />New Course
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : !data?.courses?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses yet. Create your first one!</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Lessons</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.courses.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.instructor}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{course.category}</td>
                    <td className="px-4 py-3 text-foreground hidden sm:table-cell">₹{course.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{course.totalLessons}</td>
                    <td className="px-4 py-3">
                      <Badge variant={course.isPublished ? "default" : "secondary"}>{course.isPublished ? "Published" : "Draft"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/courses/${course.id}`}>
                          <button data-testid={`button-manage-${course.id}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button data-testid={`button-edit-${course.id}`} onClick={() => setEditing(course)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button data-testid={`button-delete-${course.id}`} onClick={() => handleDelete(course.id, course.title)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
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
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Course</DialogTitle></DialogHeader>
            <CourseForm onSave={handleCreate} onClose={() => setShowCreate(false)} loading={createCourse.isPending} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
            {editing && <CourseForm initial={editing} onSave={handleUpdate} onClose={() => setEditing(null)} loading={updateCourse.isPending} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
