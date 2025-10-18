import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Stats = () => {
  // TODO: Connect to Instant DB to fetch user stats and run history
  const stats = {
    totalDistance: 0,
    totalRuns: 0,
    longestRun: 0,
    averageDistance: 0,
    dailyStreak: 0,
  };

  const recentRuns = [
    // TODO: Fetch from Instant DB
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Fitness Stats</h1>
          <Link to="/">
            <Button variant="outline">Back</Button>
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
              <p className="text-2xl font-bold">{(stats.totalDistance / 1000).toFixed(1)} km</p>
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
              <p className="text-2xl font-bold">{(stats.longestRun / 1000).toFixed(1)} km</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.dailyStreak} days</p>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Average Distance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(stats.averageDistance / 1000).toFixed(1)} km per run</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No runs yet. Start running to see your stats!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRuns.map((run: any) => (
                  <Card key={run.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{(run.distance / 1000).toFixed(2)} km</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(run.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-semibold">{Math.floor(run.duration / 60)} min</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
