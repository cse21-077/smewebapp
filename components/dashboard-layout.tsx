"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Home, Upload, Lightbulb, FileText, Settings, Bell, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Upload Data", href: "/dashboard/upload", icon: Upload },
    { name: "Insights", href: "/dashboard/insights", icon: Lightbulb },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-full flex-col bg-white">
            <div className="flex h-16 items-center gap-2 border-b px-6">
              <BarChart2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold">PredictIQ</span>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive(item.href) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? "text-blue-600" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 flex-shrink-0 items-center gap-2 border-b border-gray-200 px-6">
            <BarChart2 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">PredictIQ</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-1 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive(item.href) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-end md:justify-between">
            <div className="hidden w-full max-w-md md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input type="search" placeholder="Search..." className="pl-10" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                <span className="sr-only">Notifications</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
