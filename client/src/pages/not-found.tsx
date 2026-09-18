import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card/50 border-white/10 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold font-display text-white">404 LOST IN SPACE</h1>
          </div>
          <p className="mt-4 text-sm text-muted-foreground font-mono">
            The sector you are looking for does not exist or has been destroyed by the empire.
          </p>
          <div className="mt-8">
             <Link href="/">
                <Button className="w-full font-mono">RETURN TO BASE</Button>
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
