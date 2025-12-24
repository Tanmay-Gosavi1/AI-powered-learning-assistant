import { LayoutDashboard , FileText ,Plus , Users} from "lucide-react";

export const NAVIGATION_MENU = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "invoices", name: "Invoices", icon: FileText },
  { id: "invoices/new", name: "Create Invoice", icon: Plus },
  { id: "profile", name: "Profile", icon: Users },
];