import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Trophy, Target, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStravaActivities, getActivityStream, StravaActivity } from '@/services/stravaService';
import { toast } from 'sonner';
import Map from '@/components/Map';

const Stats = () => {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [activityRoutes, setActivityRoutes] = useState<Array<[number, number][]>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getStravaActivities(10);
        setActivities(data);
        
        // Fetch routes for all activities
        const routes = await Promise.all(
          data.map(async (activity) => {
            try {
              const stream = await getActivityStream(activity.id);
              return stream.latlng?.data || [];
            } catch (error) {
              console.error(`Failed to fetch route for activity ${activity.id}:`, error);
              return [];
            }
          })
        );
        setActivityRoutes(routes.filter(route => route.length > 0));
      } catch (error) {
        console.error('Failed to fetch Strava activities:', error);
        toast.error('Failed to load Strava activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const stats = {
    totalDistance: activities.reduce((sum, act) => sum + act.distance, 0) / 1000,
    totalRuns: activities.length,
    longestRun: Math.max(...activities.map(act => act.distance / 1000), 0),
    averageDistance: activities.length > 0 
      ? activities.reduce((sum, act) => sum + act.distance, 0) / 1000 / activities.length 
      : 0,
    dailyStreak: 0, // TODO: Calculate streak
  };

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

        {/* Map Visualization */}
        {activityRoutes.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Activity Routes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] rounded-b-lg overflow-hidden">
                <Map activityRoutes={activityRoutes} userPosition={null} slugPosition={null} />
              </div>
            </CardContent>
          </Card>
        )}

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
              <p className="text-2xl font-bold">{stats.totalDistance.toFixed(1)} km</p>
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
              <p className="text-2xl font-bold">{stats.longestRun.toFixed(1)} km</p>
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
              <p className="text-2xl font-bold">{stats.averageDistance.toFixed(1)} km per run</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading activities from Strava...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No Strava activities found. Start running to see your stats!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{activity.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.start_date_local).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(activity.distance / 1000).toFixed(2)} km</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(activity.elapsed_time / 60)} min
                          </p>
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
