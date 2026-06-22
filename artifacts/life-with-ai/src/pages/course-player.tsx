import { useParams } from "wouter";
import { useState } from "react";
import { useGetCourse, useGetCourseProgress, useUpdateCourseProgress, useGetLessonStream, getGetCourseQueryKey, getGetCourseProgressQueryKey, getGetLessonStreamQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, PlayCircle, Lock, FileText, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function CoursePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useGetCourse(id!, {
    query: { enabled: !!id, queryKey: getGetCourseQueryKey(id!) },
  });

  const { data: progress } = useGetCourseProgress(id!, {
    query: { enabled: !!id, queryKey: getGetCourseProgressQueryKey(id!) },
  });

  const updateProgress = useUpdateCourseProgress();

  const currentLesson = selectedLessonId
    ? course?.lessons?.find((l) => l.id === selectedLessonId)
    : course?.lessons?.[0];

  const { data: streamData } = useGetLessonStream(id!, currentLesson?.id ?? "", {
    query: {
      enabled: !!id && !!currentLesson?.id,
      queryKey: getGetLessonStreamQueryKey(id!, currentLesson?.id ?? ""),
    },
  });

  const isCompleted = (lessonId: string) => progress?.completedLessons?.includes(lessonId) ?? false;

  const handleMarkComplete = async (lessonId: string) => {
    await updateProgress.mutateAsync({
      id: id!,
      data: { lessonId, completed: !isCompleted(lessonId) },
    });
    queryClient.invalidateQueries({ queryKey: getGetCourseProgressQueryKey(id!) });
  };

  if (courseLoading) return (
    <div className="flex h-screen">
      <div className="flex-1 p-6"><Skeleton className="h-full w-full rounded-xl" /></div>
      <div className="w-80 border-l border-border p-4 space-y-3">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    </div>
  );

  if (!course) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Course not found or not purchased.</p>
    </div>
  );

  const sortedLessons = [...(course.lessons ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main video area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-foreground truncate">{course.title}</h1>
            {progress && (
              <div className="flex items-center gap-2 mt-1">
                <Progress value={progress.percentage} className="w-32 h-1.5" />
                <span className="text-xs text-muted-foreground">{progress.percentage}% complete</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-black flex items-center justify-center">
          {streamData?.streamUrl ? (
            <video
              key={streamData.streamUrl}
              src={streamData.streamUrl}
              controls
              controlsList="nodownload"
              className="max-h-full max-w-full"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <div className="text-center text-white/60">
              <PlayCircle className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p>{currentLesson ? "Loading video..." : "Select a lesson to start"}</p>
            </div>
          )}
        </div>

        {currentLesson && (
          <div className="border-t border-border p-4 bg-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-foreground">{currentLesson.title}</h2>
                {currentLesson.description && <p className="text-sm text-muted-foreground mt-1">{currentLesson.description}</p>}
              </div>
              <button
                onClick={() => handleMarkComplete(currentLesson.id)}
                disabled={updateProgress.isPending}
                className={`shrink-0 flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  isCompleted(currentLesson.id)
                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-400"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {isCompleted(currentLesson.id) ? "Completed" : "Mark Complete"}
              </button>
            </div>
            {currentLesson.notes && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FileText className="w-4 h-4" />Lesson Notes
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentLesson.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lesson list sidebar */}
      <div className="w-72 lg:w-80 border-l border-border flex flex-col bg-card overflow-y-auto shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Course Content</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{sortedLessons.length} lessons</p>
        </div>
        <div className="divide-y divide-border">
          {sortedLessons.map((lesson, i) => {
            const completed = isCompleted(lesson.id);
            const selected = (currentLesson?.id ?? sortedLessons[0]?.id) === lesson.id;
            return (
              <button
                key={lesson.id}
                data-testid={`button-lesson-${lesson.id}`}
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`w-full text-left p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${selected ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className="shrink-0 mt-0.5">
                  {completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : lesson.isPreview || course.isPurchased ? (
                    <PlayCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground">{i + 1}.</span>
                  <p className={`text-sm font-medium mt-0.5 leading-tight ${selected ? "text-primary" : "text-foreground"}`}>{lesson.title}</p>
                  {lesson.duration > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(lesson.duration / 60)}m</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
