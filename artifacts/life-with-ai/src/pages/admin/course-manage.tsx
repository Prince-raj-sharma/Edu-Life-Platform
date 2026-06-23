import { useParams } from "wouter";
import { useState, useRef } from "react";
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
import { Plus, Pencil, Trash2, ChevronLeft, Upload, Link2, AlertCircle, CheckCircle2, RefreshCw, X, Play } from "lucide-react";
import { Link } from "wouter";

const MAX_VIDEO_SIZE_MB = 500;

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function isCloudinaryUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("cloudinary.com") || u.hostname.includes("res.cloudinary");
  } catch {
    return false;
  }
}

function VideoPreview({ url }: { url: string }) {
  const [error, setError] = useState(false);
  if (!url || !isValidUrl(url)) return null;
  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-border bg-black aspect-video">
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs p-4 text-center">
          <AlertCircle className="w-6 h-6 text-yellow-500" />
          <span>Cannot preview this URL directly.<br />It will still be saved and may play in the course player.</span>
        </div>
      ) : (
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
          onError={() => setError(true)}
          preload="metadata"
        >
          Your browser does not support video.
        </video>
      )}
    </div>
  );
}

function UploadProgress({ progress, fileName }: { progress: number; fileName: string }) {
  return (
    <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground truncate max-w-[200px]">{fileName}</span>
        <span className="font-medium text-primary">{progress}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {progress < 100 ? "Uploading to Cloudinary… This may take a moment for large files." : "Processing…"}
      </p>
    </div>
  );
}

type VideoMode = "upload" | "url";

interface LessonFormState {
  title: string;
  description: string;
  videoUrl: string;
  videoPublicId: string;
  notes: string;
  duration: number;
  order: number;
  isPreview: boolean;
}

function LessonForm({
  initial,
  onSave,
  onClose,
  loading,
}: {
  initial?: any;
  onSave: (d: any) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<LessonFormState>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    videoUrl: initial?.videoUrl ?? "",
    videoPublicId: initial?.videoPublicId ?? "",
    notes: initial?.notes ?? "",
    duration: initial?.duration ?? 0,
    order: initial?.order ?? 0,
    isPreview: initial?.isPreview ?? false,
  });

  const [mode, setMode] = useState<VideoMode>(
    initial?.videoUrl && !initial?.videoPublicId ? "url" : "upload"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof LessonFormState, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      setUploadError(
        `File is ${Math.round(sizeMB)} MB. Maximum allowed is ${MAX_VIDEO_SIZE_MB} MB. Please upload to Cloudinary directly and paste the URL instead.`
      );
      setPendingFile(null);
      return;
    }

    setUploadError(null);
    setPendingFile(file);
    setUploadFileName(file.name);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(5);

    try {
      // Simulate progress during base64 encoding + network
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 3, 85));
      }, 800);

      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(pendingFile);
      });

      clearInterval(progressInterval);
      setUploadProgress(90);

      const res = await fetch("/api/upload/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lifewithai_token")}`,
        },
        body: JSON.stringify({ data: base64 }),
      });

      setUploadProgress(98);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setUploadProgress(100);

      update("videoUrl", data.url);
      update("videoPublicId", data.publicId);
      if (data.duration) update("duration", data.duration);

      setPendingFile(null);
      setUploadFileName("");
      toast({ title: "Video uploaded!", description: "Cloudinary URL saved." });
    } catch (err: any) {
      setUploadError(
        err?.message || "Upload failed. Check your Cloudinary credentials or try pasting the URL instead."
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setUploadError(null);
    setUploadProgress(0);
    handleUpload();
  };

  const clearVideo = () => {
    update("videoUrl", "");
    update("videoPublicId", "");
    setPendingFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setUrlError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUrlChange = (val: string) => {
    update("videoUrl", val);
    update("videoPublicId", ""); // clear publicId — direct URL mode
    if (val && !isValidUrl(val)) {
      setUrlError("Enter a valid URL (must start with https://)");
    } else {
      setUrlError(null);
    }
  };

  const hasVideo = !!form.videoUrl;

  const handleSave = () => {
    if (!form.title.trim()) {
      toast({ title: "Lesson title is required", variant: "destructive" });
      return;
    }
    if (form.videoUrl && !isValidUrl(form.videoUrl)) {
      toast({ title: "Invalid video URL", description: "Please enter a valid URL.", variant: "destructive" });
      return;
    }
    onSave(form);
  };

  return (
    <>
      <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
        {/* Title */}
        <div>
          <Label>Title <span className="text-destructive">*</span></Label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Introduction to AI"
          />
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            className="mt-1"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What will students learn in this lesson?"
            rows={2}
          />
        </div>

        {/* Video Section */}
        <div className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Video</Label>
            {hasVideo && (
              <button
                onClick={clearVideo}
                className="flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <X className="w-3 h-3" /> Remove video
              </button>
            )}
          </div>

          {/* Mode tabs */}
          <div className="flex bg-muted rounded-lg p-0.5 gap-0.5 w-fit">
            <button
              onClick={() => { setMode("upload"); setUploadError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "upload"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              onClick={() => { setMode("url"); setUploadError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "url"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" /> Paste URL
            </button>
          </div>

          {/* Upload mode */}
          {mode === "upload" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Max {MAX_VIDEO_SIZE_MB} MB. For larger videos, upload directly to Cloudinary and paste the URL.
              </p>

              {!hasVideo && !isUploading && (
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors ${pendingFile ? "border-primary/50 bg-primary/5" : ""}`}>
                    <Upload className="w-4 h-4" />
                    {pendingFile ? pendingFile.name : "Choose video file"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  {pendingFile && !uploadError && (
                    <button
                      onClick={handleUpload}
                      className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                  )}
                </div>
              )}

              {isUploading && (
                <UploadProgress progress={uploadProgress} fileName={uploadFileName} />
              )}

              {uploadError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{uploadError}</p>
                  </div>
                  <div className="flex gap-2">
                    {pendingFile && (
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-muted"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    )}
                    <button
                      onClick={() => { setMode("url"); setUploadError(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary/20"
                    >
                      <Link2 className="w-3 h-3" /> Use URL instead
                    </button>
                  </div>
                </div>
              )}

              {hasVideo && !isUploading && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Video ready{form.videoPublicId ? " (Cloudinary upload)" : " (URL)"}</span>
                </div>
              )}
            </div>
          )}

          {/* Paste URL mode */}
          {mode === "url" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Upload your video to{" "}
                <a
                  href="https://cloudinary.com/console/media_library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Cloudinary Media Library
                </a>
                , then paste the URL below.
              </p>
              <Input
                value={form.videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://res.cloudinary.com/your-cloud/video/upload/..."
                className={urlError ? "border-destructive" : ""}
              />
              {urlError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {urlError}
                </p>
              )}
              {form.videoUrl && !urlError && !isCloudinaryUrl(form.videoUrl) && (
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> This doesn't look like a Cloudinary URL. It will still be saved.
                </p>
              )}
              {form.videoUrl && !urlError && isCloudinaryUrl(form.videoUrl) && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid Cloudinary URL
                </p>
              )}
            </div>
          )}

          {/* Video preview */}
          {hasVideo && !urlError && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Play className="w-3 h-3" /> Preview
              </div>
              <VideoPreview url={form.videoUrl} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label>Notes / Resources</Label>
          <Textarea
            className="mt-1"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Links, reading materials, or additional notes for students"
            rows={2}
          />
        </div>

        {/* Duration & Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (seconds)</Label>
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.duration}
              onChange={(e) => update("duration", Number(e.target.value))}
            />
            {form.duration > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ≈ {Math.floor(form.duration / 60)}m {form.duration % 60}s
              </p>
            )}
          </div>
          <div>
            <Label>Order</Label>
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => update("order", Number(e.target.value))}
            />
          </div>
        </div>

        {/* Preview toggle */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <input
            type="checkbox"
            id="preview"
            checked={form.isPreview}
            onChange={(e) => update("isPreview", e.target.checked)}
            className="rounded"
          />
          <div>
            <Label htmlFor="preview" className="cursor-pointer">Free preview lesson</Label>
            <p className="text-xs text-muted-foreground">Non-paying visitors can watch this lesson</p>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-4 gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || isUploading}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving…" : isUploading ? "Uploading…" : "Save Lesson"}
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

  const { data: course, isLoading } = useGetCourse(id!, {
    query: { enabled: !!id, queryKey: getGetCourseQueryKey(id!) },
  });
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(id!) });

  const handleAdd = async (data: any) => {
    try {
      await addLesson.mutateAsync({ id: id!, data });
      toast({ title: "Lesson added!" });
      setShowAdd(false);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error adding lesson", description: err?.data?.error || "Something went wrong", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateLesson.mutateAsync({ id: id!, lessonId: editingLesson.id, data });
      toast({ title: "Lesson updated!" });
      setEditingLesson(null);
      invalidate();
    } catch (err: any) {
      toast({ title: "Error updating lesson", description: err?.data?.error || "Something went wrong", variant: "destructive" });
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

  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  if (!course)
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );

  const sortedLessons = [...(course.lessons ?? [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/courses">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {course.totalLessons} lesson{course.totalLessons !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Tips banner */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
          <Link2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> For large videos, upload directly to{" "}
            <a
              href="https://cloudinary.com/console/media_library"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Cloudinary Media Library
            </a>{" "}
            and paste the URL into the lesson form. No file size limits.
          </p>
        </div>

        {/* Lessons list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Lessons</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Lesson
          </button>
        </div>

        {sortedLessons.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">
              No lessons yet. Add your first lesson!
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {sortedLessons.map((lesson, i) => (
              <div key={lesson.id} className="flex items-center gap-3 p-4">
                <span className="text-sm text-muted-foreground w-6 shrink-0">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lesson.duration > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                      </span>
                    )}
                    {lesson.isPreview && (
                      <Badge variant="outline" className="text-xs">
                        Preview
                      </Badge>
                    )}
                    {lesson.videoUrl ? (
                      <span className="text-xs text-green-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Video ready
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600">No video</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingLesson(lesson)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Edit lesson"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id, lesson.title)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title="Delete lesson"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add lesson dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Lesson</DialogTitle>
            </DialogHeader>
            <LessonForm
              onSave={handleAdd}
              onClose={() => setShowAdd(false)}
              loading={addLesson.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit lesson dialog */}
        <Dialog
          open={!!editingLesson}
          onOpenChange={(o) => !o && setEditingLesson(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Lesson</DialogTitle>
            </DialogHeader>
            {editingLesson && (
              <LessonForm
                initial={editingLesson}
                onSave={handleUpdate}
                onClose={() => setEditingLesson(null)}
                loading={updateLesson.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
