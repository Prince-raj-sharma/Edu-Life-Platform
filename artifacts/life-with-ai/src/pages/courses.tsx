import { useState } from "react";
import { Link } from "wouter";
import { useListCourses, getListCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, Users, Star, BookOpen } from "lucide-react";

const CATEGORIES = ["All", "AI & Machine Learning", "Data Science", "Web Development", "Python", "Deep Learning", "NLP", "Computer Vision"];
const DIFFICULTIES = ["All", "beginner", "intermediate", "advanced"];

function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div data-testid={`card-course-${course.id}`} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
        <div className="relative h-48 bg-muted overflow-hidden">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <BookOpen className="w-12 h-12 text-primary/40" />
            </div>
          )}
          <Badge className="absolute top-3 left-3 capitalize" variant="secondary">{course.difficulty}</Badge>
          {course.originalPrice && course.originalPrice > course.price && (
            <Badge className="absolute top-3 right-3 bg-green-600 text-white">
              {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-1">{course.category}</p>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">{course.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">by {course.instructor}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            {course.totalLessons > 0 && (
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.totalLessons} lessons</span>
            )}
            {course.totalStudents > 0 && (
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.totalStudents.toLocaleString()}</span>
            )}
            {course.rating && (
              <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{course.rating}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary">₹{course.price.toLocaleString()}</span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="text-sm text-muted-foreground line-through ml-2">₹{course.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [page, setPage] = useState(1);

  const params = {
    ...(search && { search }),
    ...(category !== "All" && { category }),
    ...(difficulty !== "All" && { difficulty }),
    page,
    limit: 12,
  };

  const { data, isLoading } = useListCourses(params, {
    query: { queryKey: getListCoursesQueryKey(params) },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">All Courses</h1>
          <p className="text-muted-foreground">Master AI skills with industry-expert led courses</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger data-testid="select-category" className="w-full sm:w-56">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
            <SelectTrigger data-testid="select-difficulty" className="w-full sm:w-44">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.courses?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No courses found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{data.total} courses found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.courses.map((course) => <CourseCard key={course.id} course={course} />)}
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
