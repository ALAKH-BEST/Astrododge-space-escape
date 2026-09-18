"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SidebarContext = React.createContext<{open:boolean;setOpen:(v:boolean)=>void;toggleSidebar:()=>void} | null>(null)

export function SidebarProvider({children,defaultOpen=true,className,...props}:{children:React.ReactNode;defaultOpen?:boolean;className?:string}&React.ComponentProps<"div">){
  const [open,setOpen]=React.useState(defaultOpen)
  const toggleSidebar=React.useCallback(()=>setOpen(v=>!v),[])
  return <SidebarContext.Provider value={{open,setOpen,toggleSidebar}}><div className={cn("flex min-h-svh w-full",className)} {...props}>{children}</div></SidebarContext.Provider>
}

export function useSidebar(){const c=React.useContext(SidebarContext);if(!c)throw new Error("useSidebar must be used within a SidebarProvider.");return c}

export function Sidebar({className,children,...props}:React.ComponentProps<"aside">){return <aside data-slot="sidebar" className={cn("flex h-full w-64 flex-col border-r",className)} {...props}>{children}</aside>}
export function SidebarTrigger({className,...props}:React.ComponentProps<typeof Button>){const {toggleSidebar}=useSidebar();return <Button variant="ghost" size="icon" className={cn("h-7 w-7",className)} onClick={toggleSidebar} {...props}>☰</Button>}
export function SidebarRail({className,...props}:React.ComponentProps<"button">){const {toggleSidebar}=useSidebar();return <button aria-label="Toggle Sidebar" onClick={toggleSidebar} className={cn("absolute inset-y-0 w-2",className)} {...props}/>}
export function SidebarInset({className,...props}:React.ComponentProps<"main">){return <main className={cn("relative flex w-full flex-1 flex-col",className)} {...props}/>}
export function SidebarInput({className,...props}:React.ComponentProps<"input">){return <input className={cn("h-8 w-full rounded-md border bg-background px-3",className)} {...props}/>}
export function SidebarHeader({className,...props}:React.ComponentProps<"div">){return <div className={cn("flex flex-col gap-2 p-2",className)} {...props}/>}
export function SidebarFooter({className,...props}:React.ComponentProps<"div">){return <div className={cn("flex flex-col gap-2 p-2",className)} {...props}/>}
export function SidebarSeparator({className,...props}:React.ComponentProps<"hr">){return <hr className={cn("mx-2",className)} {...props}/>}
export function SidebarContent({className,...props}:React.ComponentProps<"div">){return <div className={cn("min-h-0 flex-1 overflow-auto",className)} {...props}/>}
export function SidebarGroup({className,...props}:React.ComponentProps<"div">){return <div className={cn("relative flex w-full flex-col p-2",className)} {...props}/>}
export function SidebarGroupLabel({className,...props}:React.ComponentProps<"div">){return <div className={cn("flex h-8 items-center px-2 text-xs font-medium",className)} {...props}/>}
export function SidebarGroupAction({className,...props}:React.ComponentProps<"button">){return <button className={cn("absolute right-3 top-3",className)} {...props}/>}
export function SidebarGroupContent({className,...props}:React.ComponentProps<"div">){return <div className={cn("w-full text-sm",className)} {...props}/>}
export function SidebarMenu({className,...props}:React.ComponentProps<"ul">){return <ul className={cn("flex w-full flex-col gap-1",className)} {...props}/>}
export function SidebarMenuItem({className,...props}:React.ComponentProps<"li">){return <li className={cn("relative",className)} {...props}/>}
export function SidebarMenuButton({className,...props}:React.ComponentProps<"button">){return <button className={cn("flex h-8 w-full items-center gap-2 rounded-md px-2 text-left hover:bg-accent",className)} {...props}/>}
export function SidebarMenuAction({className,...props}:React.ComponentProps<"button">){return <button className={cn("absolute right-1 top-1",className)} {...props}/>}
export function SidebarMenuBadge({className,...props}:React.ComponentProps<"span">){return <span className={cn("absolute right-1",className)} {...props}/>}
export function SidebarMenuSkeleton({className,...props}:React.ComponentProps<"div">){return <div className={cn("h-8 rounded-md bg-muted animate-pulse",className)} {...props}/>}
export function SidebarMenuSub({className,...props}:React.ComponentProps<"ul">){return <ul className={cn("ml-4 border-l pl-2",className)} {...props}/>}
export function SidebarMenuSubItem({className,...props}:React.ComponentProps<"li">){return <li className={className} {...props}/>}
export function SidebarMenuSubButton({className,...props}:React.ComponentProps<"button">){return <button className={cn("flex h-7 w-full items-center rounded-md px-2 text-sm hover:bg-accent",className)} {...props}/>}
