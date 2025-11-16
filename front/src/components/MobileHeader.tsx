import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { SidebarContents } from "./SidebarContents";

export function MobileHeader() {
  return (
    <header className="lg:hidden p-4 border-b bg-white sticky top-0 z-10">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContents />
        </SheetContent>
      </Sheet>
    </header>
  );
}
