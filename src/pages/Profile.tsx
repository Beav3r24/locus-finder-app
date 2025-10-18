import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Coins, Trophy, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  // TODO: Connect to Instant DB to fetch user data
  const userData = {
    username: 'Runner123',
    coins: 0,
    totalDistance: 0,
    runs: 0,
    activeSkin: 'default',
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Link to="/">
            <Button variant="outline">Back to Game</Button>
          </Link>
        </div>

        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback>
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userData.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{userData.coins} coins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(userData.totalDistance / 1000).toFixed(1)} km</p>
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
              <p className="text-2xl font-bold">{userData.runs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Active Skin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold capitalize">{userData.activeSkin}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userData.coins}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link to="/skins" className="flex-1">
            <Button className="w-full" variant="outline">View Skins</Button>
          </Link>
          <Link to="/stats" className="flex-1">
            <Button className="w-full" variant="outline">View Stats</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
