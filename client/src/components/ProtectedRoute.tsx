import { ReactNode } from "react";
import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {isAdmin ? <Component /> : <Redirect to="/" />}
    </Route>
  );
}

interface AdminLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function AdminLink({ href, children, className = "" }: AdminLinkProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}