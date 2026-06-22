import { useParams } from "wouter";
import { useState } from "react";
import {
  useGetCourse, useAddLesson, useUpdateLesson, useDeleteLesson,
  getGetCourseQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Plus, Pencil, Trash2, ChevronLeft, Upload } from "lucide-react";
import { Link } from "wouter";

function LessonForm({ initial, onSave, onClose, loading }: { initial?: any; onSave: (d: any) => void; onClose: () => void; loading: boolean }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    videoUrl: initial?.videoUrl ?? "",
    videoPublicId: initial?.videoPublicId ?? "",
    notes: initial?.notes ?? "",
    duration: initial?.duration ?? 0,
    order: initial?.order ?? 0,
    isPreview: initial?.isPreview ?? false,
  });
  const { upload, isUploading } = useFileUpload();
  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await upload(file, "video");
    if (res) { update("videoUrl", res.url); update("videoPublicId", res.publicId); }
  };

  return (
    <>
      <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
        <div><Label>Title</Label><Input className="mt-1" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Lesson title" /></div>
        <div><Label>Description</Label><Textarea className="mt-1" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Lesson description" /></div>
        <div>
          <Label>Video File</Label>
          <div className="mt-1 flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Upload Video"}
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoFile} disabled={isUploading} />
            </label>
            {form.videoUrl && <span className="text-xs text-green-600">✓ Video uploaded</span>}
          </div>
        </div>
        <div><Label>Notes</Label><Textarea className="mt-1" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Lesson notes or resources" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Duration (seconds)</Label><Input className="mt-1" type="number" value={form.duration} onChange={(e) => update("duration", Number(e.target.value))} /></div>
          <div><Label>Order</Label><Input className="mt-1" type="number" value={form.order} onChange={(e) => update("order", Number(e.target.value))} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="preview" checked={form.isPreview} onChange={(e) => update("isPreview", e.target.checked)} className="rounded" />
          <Label htmlFor="preview">Free preview lesson</Label>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button onClick={() => onSave(form)} disabled={loading || isUploading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
          {loading ? "Saving..." : "Save Lesson"}
        </button>
      </DialogFooter>
    </>
  );
}

export default function AdminCourseManagePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const { data: course, isLoading } = useGetCourse(id!, { query: { enabled: !!id, queryKey: getGetCourseQueryKey(id!) } });
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(id!) });

  const handleAdd = async (data: any) => {
    try {
      await addLesson.mutateAsync({ id: id!, data });
      toast({ title: "Lesson added!" });
      setShowAdd(false);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.error, variant: "destructive" });
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateLesson.mutateAsync({ id: id!, lessonId: editingLesson.id, data });
      toast({ title: "Lesson updated!" });
      setEditingLesson(null);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.error, variant: "destructive" });
    }
  };

  const handleDelete = async (lessonId: string, title: string) => {
    if (!confirm(`Delete lesson "${title}"?`)) return;
    try {
      await deleteLesson.mutateAsync({ id: id!, lessonId });
      toast({ title: "Lesson deleted" });
      invalidate();
    } catch {
      toast({ title: "Error deleting lesson", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!course) return <div className="p-8"><p className="text-muted-foreground">Course not found</p></div>;

  const sortedLessons = [...(course.lessons ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/courses">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={course.isPublished ? "default" : "secondary"}>{course.isPublished ? "Published" : "Draft"}</Badge>
              <span className="text-xs text-muted-foreground">{course.totalLessons} lessons</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Lessons</h2>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm hover:opacity-90">
            <Plus className="w-4 h-4" />Add Lesson
          </button>
        </div>

        {sortedLessons.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">No lessons yet. Add your first lesson!</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {sortedLessons.map((lesson, i) => (
              <div key={lesson.id} className="flex items-center gap-3 p-4">
                <span className="text-sm text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lesson.duration > 0 && <span className="text-xs text-muted-foreground">{Math.round(lesson.duration / 60)}m</span>}
                    {lesson.isPreview && <Badge variant="outline" className="text-xs">Preview</Badge>}
                    {lesson.videoUrl && <span className="text-xs text-green-600">● Video</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingLesson(lesson)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(lesson.id, lesson.title)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Lesson</DialogTitle></DialogHeader>
            <LessonForm onSave={handleAdd} onClose={() => setShowAdd(false)} loading={addLesson.isPending} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingLesson} onOpenChange={(o) => !o && setEditingLesson(null)}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Lesson</DialogTitle></DialogHeader>
            {editingLesson && <LessonForm initial={editingLesson} onSave={handleUpdate} onClose={() => setEditingLesson(null)} loading={updateLesson.isPending} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
