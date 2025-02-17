"use client";
import { Bot, CreditCard, LayoutDashboard, Presentation } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "~/components/ui/sidebar";
import Image from "next/image";

const pages = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Q&A",
    icon: Bot,
    href: "/qa",
  },
  {
    title: "Meetings",
    icon: Presentation,
    href: "/meetings",
  },
  {
    title: "Billings",
    icon: CreditCard,
    href: "/billings",
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src="/byteblaze.png" alt="logo" width={60} height={60} />
          {open && (
            <h1 className="text-xl font-bold text-primary/80">Byteblaze</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupLabel className="mx-3 font-bold">Application</SidebarGroupLabel>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
