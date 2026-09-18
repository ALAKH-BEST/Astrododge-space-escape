import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { data: user } = useUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [activeTab, setActiveTab] = useState("login");
  useEffect(() => { if (user) setLocation("/game"); }, [user, setLocation]);
  if (user) return null;
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute right-4 top-4 z-20"><ThemeSelector /></div>
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-background z-0"><div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" /><div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000" /></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md z-10">
          <div className="text-center mb-8"><div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg shadow-primary/20"><Rocket className="h-10 w-10 text-white" /></div><h1 className="text-4xl font-display font-bold mb-2">ASTRODODGE</h1><p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Initiate Launch Sequence</p></div>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader><Tabs value={activeTab} onValueChange={setActiveTab} className="w-full"><TabsList className="grid w-full grid-cols-2 bg-muted/50"><TabsTrigger value="login" className="font-display tracking-wide">LOGIN</TabsTrigger><TabsTrigger value="register" className="font-display tracking-wide">REGISTER</TabsTrigger></TabsList></Tabs></CardHeader>
            <CardContent className="pt-6">{activeTab === "login" ? <AuthForm mode="login" mutation={loginMutation} /> : <AuthForm mode="register" mutation={registerMutation} />}</CardContent>
            <CardFooter className="justify-center border-t border-white/5 pt-4 pb-4"><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Made by Alakh</p></CardFooter>
          </Card>
        </motion.div>
      </div><PublicFooter />
    </div>
  );
}

function AuthForm({ mode, mutation }: { mode: "login" | "register"; mutation: ReturnType<typeof useLogin> | ReturnType<typeof useRegister> }) {
  const form = useForm<InsertUser>({ resolver: zodResolver(insertUserSchema), defaultValues: { username: "", password: "" } });
  function onSubmit(data: InsertUser) { mutation.mutate(data); }
  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField control={form.control} name="username" render={({ field }) => <FormItem><FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Username</FormLabel><FormControl><Input placeholder="CommanderName" className="bg-background/50 border-white/10 focus:border-primary/50 font-mono" {...field} /></FormControl><FormMessage /></FormItem>} />
    <FormField control={form.control} name="password" render={({ field }) => <FormItem><FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" className="bg-background/50 border-white/10 focus:border-primary/50 font-mono" {...field} /></FormControl><FormMessage /></FormItem>} />
    <Button type="submit" className="w-full font-display tracking-wider text-lg h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg shadow-primary/25" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === "login" ? "ENTER SYSTEM" : "CREATE ACCOUNT"}</Button>
  </form></Form>;
}
