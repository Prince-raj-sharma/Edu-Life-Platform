import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import CoursesPage from "@/pages/courses";
import CourseDetailPage from "@/pages/course-detail";
import PdfsPage from "@/pages/pdfs";
import PdfDetailPage from "@/pages/pdf-detail";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import FaqPage from "@/pages/faq";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";

import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import VerifyOtpPage from "@/pages/auth/verify-otp";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";

import DashboardPage from "@/pages/dashboard";
import CoursePlayerPage from "@/pages/course-player";
import PaymentSuccessPage from "@/pages/payment-success";
import PaymentFailedPage from "@/pages/payment-failed";

import AdminDashboardPage from "@/pages/admin/index";
import AdminCoursesPage from "@/pages/admin/courses";
import AdminCourseManagePage from "@/pages/admin/course-manage";
import AdminPdfsPage from "@/pages/admin/pdfs";
import AdminUsersPage from "@/pages/admin/users";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminRevenuePage from "@/pages/admin/revenue";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <MainLayout><Home /></MainLayout>
      </Route>
      <Route path="/courses">
        <MainLayout><CoursesPage /></MainLayout>
      </Route>
      <Route path="/courses/:id">
        <MainLayout><CourseDetailPage /></MainLayout>
      </Route>
      <Route path="/pdfs">
        <MainLayout><PdfsPage /></MainLayout>
      </Route>
      <Route path="/pdfs/:id">
        <MainLayout><PdfDetailPage /></MainLayout>
      </Route>
      <Route path="/about">
        <MainLayout><AboutPage /></MainLayout>
      </Route>
      <Route path="/contact">
        <MainLayout><ContactPage /></MainLayout>
      </Route>
      <Route path="/faq">
        <MainLayout><FaqPage /></MainLayout>
      </Route>
      <Route path="/privacy">
        <MainLayout><PrivacyPage /></MainLayout>
      </Route>
      <Route path="/terms">
        <MainLayout><TermsPage /></MainLayout>
      </Route>

      {/* Auth Routes */}
      <Route path="/auth/login">
        <LoginPage />
      </Route>
      <Route path="/auth/register">
        <RegisterPage />
      </Route>
      <Route path="/auth/verify-otp">
        <VerifyOtpPage />
      </Route>
      <Route path="/auth/forgot-password">
        <ForgotPasswordPage />
      </Route>
      <Route path="/auth/reset-password">
        <ResetPasswordPage />
      </Route>

      {/* Payment Result Routes */}
      <Route path="/payment/success">
        <PaymentSuccessPage />
      </Route>
      <Route path="/payment/failed">
        <PaymentFailedPage />
      </Route>

      {/* Protected Student Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <MainLayout><DashboardPage /></MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/course/:id">
        <ProtectedRoute>
          <CoursePlayerPage />
        </ProtectedRoute>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <MainLayout><AdminDashboardPage /></MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/courses">
        <ProtectedRoute requireAdmin>
          <MainLayout><AdminCoursesPage /></MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/courses/:id">
        <ProtectedRoute requireAdmin>
          <MainLayout><AdminCourseManagePage /></MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pdfs">
        <ProtectedRoute requireAdmin>
          <MainLayout><AdminPdfsPage /></MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requireAdmin>
          <MainLayout><AdminUsersPage /></MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/orders">
        <ProtectedRoute requireAdmin>
          <MainLayout><AdminOrdersPage /></MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/revenue">
        <ProtectedRoute requireAdmin>
          <MainLayout><AdminRevenuePage /></MainLayout>
        </ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route>
        <MainLayout><NotFound /></MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
