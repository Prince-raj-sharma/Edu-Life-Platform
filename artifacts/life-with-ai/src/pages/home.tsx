import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, BookOpen, Shield, Zap, FileText } from "lucide-react";
import { useListCourses, useListPdfs } from "@workspace/api-client-react";

export default function Home() {
  const { data: coursesData, isLoading: isLoadingCourses } = useListCourses()
  const { data: pdfsData, isLoading: isLoadingPdfs } = useListPdfs()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Accelerate your career with <span className="text-primary">AI & Tech</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Professional, high-quality courses and resources designed for modern job seekers. 
              Master the skills that matter today.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/courses">
                <Button size="lg" className="h-12 px-8 text-base shadow-md">
                  Explore Courses
                </Button>
              </Link>
              <Link href="/pdfs">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Browse Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="w-full py-12 border-y border-border/50 bg-white dark:bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="flex flex-col items-center p-6 space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Industry Recognized</h3>
              <p className="text-sm text-muted-foreground">Content curated by tech professionals</p>
            </div>
            <div className="flex flex-col items-center p-6 space-y-2">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground mb-2">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Fast-track Learning</h3>
              <p className="text-sm text-muted-foreground">Practical, project-based curriculum</p>
            </div>
            <div className="flex flex-col items-center p-6 space-y-2">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground mb-2">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Lifetime Access</h3>
              <p className="text-sm text-muted-foreground">Learn at your own pace, anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="w-full py-20 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">Top-rated tech skills to upgrade your portfolio.</p>
            </div>
            <Link href="/courses">
              <Button variant="ghost" className="hidden md:flex gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-border/50">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-6 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(coursesData?.courses || []).slice(0, 3).map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  <div className="h-48 overflow-hidden bg-muted relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-md border border-border">
                      {course.category}
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1">
                    <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 flex justify-between items-center">
                    <div className="font-semibold text-lg">${course.price}</div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-8 flex justify-center md:hidden">
            <Link href="/courses">
              <Button variant="outline" className="gap-2">
                View All Courses <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured PDFs */}
      <section className="w-full py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Premium Resources</h2>
              <p className="text-muted-foreground">Actionable guides, cheat sheets, and templates.</p>
            </div>
            <Link href="/pdfs">
              <Button variant="ghost" className="hidden md:flex gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoadingPdfs ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden border-border/50">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-5 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {(pdfsData?.pdfs || []).slice(0, 4).map((pdf) => (
                <Card key={pdf.id} className="overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden bg-muted relative border-b border-border/50">
                    <img 
                      src={pdf.thumbnail} 
                      alt={pdf.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 flex-1">
                    <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{pdf.title}</h3>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="font-medium">${pdf.price}</div>
                    <Link href={`/pdfs/${pdf.id}`}>
                      <Button size="sm" variant="secondary" className="px-3">
                        <FileText className="h-4 w-4 mr-1" /> View
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
