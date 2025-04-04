import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Menu, Search, X } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path ? "text-primary-600" : "text-gray-700 hover:text-primary-600";
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <span className="font-heading font-bold text-xl text-primary-600">AI Research Blog</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 -my-2 md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11">
                  <Menu className="h-5 w-5 text-gray-500" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="py-6 px-5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xl text-primary-600">AI Research Blog</span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5 text-gray-500" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <div className="mt-6 space-y-4">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-gray-700 hover:text-primary-600">
                    Home
                  </Link>
                  <Link href="/projects" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-gray-700 hover:text-primary-600">
                    AI Projects
                  </Link>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-gray-700 hover:text-primary-600">
                    About
                  </Link>
                </div>
                <div className="mt-6">
                  <Link href="#" className="flex items-center text-gray-700 hover:text-primary-600">
                    <Search className="h-4 w-4 mr-1" />
                    <span>Search</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`font-medium ${isActive("/")}`}>Home</Link>
            <Link href="/projects" className={`font-medium ${isActive("/projects")}`}>AI Projects</Link>
            <Link href="/about" className={`font-medium ${isActive("/about")}`}>About</Link>
          </nav>
          
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <Link href="#" className="flex items-center text-gray-700 hover:text-primary-600">
              <Search className="h-4 w-4 mr-1" />
              <span>Search</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
