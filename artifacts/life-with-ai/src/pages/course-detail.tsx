import { useParams, useLocation } from "wouter";
import { useGetCourse, getGetCourseQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, PlayCircle, ChevronDown, ChevronUp, Clock, Users, Star, BookOpen, CheckCircle } from "lucide-react";
import { useState } from "react";

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { initiatePayment } = useRazorpay();
  const [expandedLessons, setExpandedLessons] = useState(false);

  const { data: course, isLoading } = useGetCourse(id!, {
    query: { enabled: !!id, queryKey: getGetCourseQueryKey(id!) },
  });

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );

  if (!course) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground">Course not found.</p>
    </div>
  );

  const handleBuy = () => {
    if (!isAuthenticated) { setLocation("/auth/login"); return; }
    initiatePayment(course.id, "course", () => setLocation("/payment/success"), () => setLocation("/payment/failed"));
  };

  const visibleLessons = expandedLessons ? course.lessons : course.lessons?.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary" className="capitalize">{course.difficulty}</Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">{course.category}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-primary-foreground/80 text-lg mb-6">{course.description?.slice(0, 200)}{course.description?.length > 200 ? "..." : ""}</p>
            <p className="text-sm text-primary-foreground/70 mb-4">Instructor: <span className="font-medium text-primary-foreground">{course.instructor}</span></p>
            <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
              {course.totalLessons > 0 && <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.totalLessons} lessons</span>}
              {course.totalDuration > 0 && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(course.totalDuration)}</span>}
              {course.totalStudents > 0 && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.totalStudents.toLocaleString()} students</span>}
              {course.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{course.rating}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title} className="w-full rounded-xl object-cover max-h-72" />
            )}

            <div>
              <h2 className="text-xl font-bold mb-4">Course Content</h2>
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {visibleLessons?.map((lesson, i) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-4">
                    <span className="text-sm text-muted-foreground w-5 shrink-0">{i + 1}</span>
                    {lesson.isPreview || course.isPurchased ? (
                      <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                    {lesson.duration > 0 && (
                      <span className="text-xs text-muted-foreground">{formatDuration(lesson.duration)}</span>
                    )}
                    {lesson.isPreview && !course.isPurchased && (
                      <Badge variant="outline" className="text-xs">Preview</Badge>
                    )}
                  </div>
                ))}
              </div>
              {course.lessons?.length > 5 && (
                <button onClick={() => setExpandedLessons(!expandedLessons)} className="w-full text-sm text-primary flex items-center justify-center gap-1 mt-3 hover:underline">
                  {expandedLessons ? <><ChevronUp className="w-4 h-4" />Show less</> : <><ChevronDown className="w-4 h-4" />Show all {course.lessons.length} lessons</>}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">₹{course.price.toLocaleString()}</span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-lg text-muted-foreground line-through ml-2">₹{course.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                {course.isPurchased ? (
                  <a href={`/dashboard/course/${course.id}`} className="w-full block text-center bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-4 h-4 inline mr-2" />Go to Course
                  </a>
                ) : (
                  <button data-testid="button-buy-course" onClick={handleBuy} className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-semibold hover:opacity-90 transition-opacity">
                    Buy Now
                  </button>
                )}

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" />{course.totalLessons} lessons</div>
                  {course.totalDuration > 0 && <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{formatDuration(course.totalDuration)} total</div>}
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Lifetime access</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Certificate of completion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
