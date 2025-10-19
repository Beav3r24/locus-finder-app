import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Trophy, Target, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameStats {
  totalDistance: number;
  totalRuns: number;
  longestRun: number;
  totalCoins: number;
  lastRunDate: string;
}

const Stats = () => {
  const [stats, setStats] = useState<GameStats>({
    totalDistance: 0,
    totalRuns: 0,
    longestRun: 0,
    totalCoins: 0,
    lastRunDate: '',
  });

  useEffect(() => {
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const averageDistance = stats.totalRuns > 0 ? stats.totalDistance / stats.totalRuns : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Fitness Stats</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(stats.totalDistance / 1000).toFixed(2)} km</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalRuns}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Longest Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(stats.longestRun / 1000).toFixed(2)} km</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Total Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalCoins}</p>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Average Distance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(averageDistance / 1000).toFixed(2)} km per run</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stats;
