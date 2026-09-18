import { GameLayout } from "@/components/layout/GameLayout";
import { useScores } from "@/hooks/use-scores";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, Medal, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardPage() {
  const { data: scores, isLoading } = useScores();
  return (
    <GameLayout><div className="max-w-4xl mx-auto">
      <div className="text-center mb-12"><h1 className="text-5xl font-display font-bold mb-4 neon-text">HALL OF FAME</h1><p className="text-muted-foreground font-mono">ELITE PILOTS OF THE FEDERATION</p></div>
      <Card className="bg-card/40 backdrop-blur-md border-white/10 shadow-2xl"><CardHeader><CardTitle className="flex items-center gap-3"><Trophy className="h-6 w-6 text-yellow-500" />TOP SCORES</CardTitle></CardHeader><CardContent>
        {isLoading ? <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}</div> : <Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-[100px] text-primary">RANK</TableHead><TableHead className="text-primary">PILOT</TableHead><TableHead className="text-right text-primary">SCORE</TableHead></TableRow></TableHeader><TableBody>
          {scores && scores.length > 0 ? scores.map((score, index) => <TableRow key={score.id} className="border-white/5 hover:bg-white/5 transition-colors group"><TableCell className="font-mono font-bold text-lg">{index === 0 && <Medal className="h-6 w-6 text-yellow-500 inline mr-2" />}{index === 1 && <Medal className="h-6 w-6 text-gray-400 inline mr-2" />}{index === 2 && <Medal className="h-6 w-6 text-amber-700 inline mr-2" />}<span className="opacity-50">#{index + 1}</span></TableCell><TableCell><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"><User className="h-4 w-4 text-primary" /></div><span className="font-medium text-foreground group-hover:text-primary transition-colors">{score.username}</span></div></TableCell><TableCell className="text-right font-mono text-xl text-accent">{score.score.toLocaleString()}</TableCell></TableRow>) : <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No flight records found. Be the first to launch!</TableCell></TableRow>}
        </TableBody></Table>}
      </CardContent></Card>
    </div></GameLayout>
  );
}
