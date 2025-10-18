import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HIGH_ACCURACY_OPTIONS } from '@/config/maps';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Map from '@/components/Map';
import SlugChaseLogic from '@/components/SlugChaseLogic';
import { Coins, Target, Trophy, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { uploadActivityToStrava } from '@/services/stravaService';

const Game = () => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [slugPosition, setSlugPosition] = useState<[number, number] | null>(null);
  const [coins, setCoins] = useState(0);
  const [dailyDistance, setDailyDistance] = useState(0);
  const [dailyGoal] = useState(50); // 50m daily goal
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [slugDistance, setSlugDistance] = useState<number>(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [playerSpeed, setPlayerSpeed] = useState<number>(0);
  const [slugSpeed, setSlugSpeed] = useState<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const lastMilestoneRef = useRef<number>(0);
  const notified100m = useRef<boolean>(false);
  const notified10m = useRef<boolean>(false);
  const gameStartTimeRef = useRef<Date>(new Date());

  // Start GPS tracking (works on phone browsers!)
  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('GPS not supported on this device');
      return;
    }

    setLocationError(null);
    setIsTracking(true);

    // Get current position first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.longitude, position.coords.latitude]);
        setAccuracy(position.coords.accuracy);
        setLocationError(null);
      },
      (error) => {
        console.error('GPS error:', error);
        setLocationError(error.message);
      },
      HIGH_ACCURACY_OPTIONS
    );

    // Watch position for continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([position.coords.longitude, position.coords.latitude]);
        setAccuracy(position.coords.accuracy);
        setLocationError(null);
      },
      (error) => {
        console.error('GPS error:', error);
        setLocationError(error.message);
      },
      HIGH_ACCURACY_OPTIONS
    );
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  // Auto-start tracking on mount
  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Add notifications based on milestones and slug distance
  useEffect(() => {
    // Coin milestones
    if (coins > 0 && coins % 10 === 0 && coins !== lastMilestoneRef.current) {
      addNotification(`🎉 ${coins} coins earned!`);
      lastMilestoneRef.current = coins;
    }
  }, [coins]);

  useEffect(() => {
    // Distance milestones
    const kmTraveled = Math.floor(dailyDistance / 1000);
    if (kmTraveled > 0 && kmTraveled % 1 === 0 && kmTraveled !== lastMilestoneRef.current) {
      addNotification(`🏃 ${kmTraveled}km traveled!`);
      lastMilestoneRef.current = kmTraveled;
    }
  }, [dailyDistance]);

  // Slug proximity notifications (one-time only at specific distances)
  useEffect(() => {
    if (slugDistance > 0 && slugDistance <= 10 && !notified10m.current) {
      addNotification("🚨 RUN FOREST RUN!");
      notified10m.current = true;
    } else if (slugDistance > 10 && slugDistance <= 100 && !notified100m.current) {
      addNotification("⚠️ 100 meters! The slug is closing in!");
      notified100m.current = true;
    }
  }, [slugDistance]);

  const addNotification = (message: string) => {
    setNotifications(prev => {
      const newNotifications = [...prev, message].slice(-3); // Keep last 3
      return newNotifications;
    });
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const uploadToStrava = async () => {
    try {
      const endTime = new Date();
      const elapsedSeconds = Math.floor((endTime.getTime() - gameStartTimeRef.current.getTime()) / 1000);
      
      await uploadActivityToStrava({
        name: 'Slug Chase Run',
        type: 'Run',
        start_date_local: gameStartTimeRef.current.toISOString(),
        elapsed_time: elapsedSeconds,
        distance: dailyDistance,
        description: `Slug Chase game - Earned ${coins} coins and traveled ${(dailyDistance / 1000).toFixed(2)}km before getting caught!`,
      });
      
      toast.success('Activity uploaded to Strava! 🎉');
    } catch (error) {
      console.error('Failed to upload to Strava:', error);
      toast.error('Failed to upload activity to Strava');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Stats Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center justify-between py-3">
          <Card className="flex items-center gap-2 px-3 py-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-bold">{coins}</span>
          </Card>
          <Card className="flex items-center gap-2 px-3 py-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{(dailyDistance / 1000).toFixed(2)}km / {(dailyGoal / 1000).toFixed(0)}km</span>
          </Card>
          <Card className="flex items-center gap-2 px-3 py-2">
            <Trophy className="w-4 h-4 text-purple-500" />
          </Card>
        </div>
      </div>

      {/* Map with Slug */}
      <div className="pt-16">
        <Map userPosition={userPosition} slugPosition={slugPosition} />

        
        {/* Slug Chase Logic Component */}
        <SlugChaseLogic 
          userPosition={userPosition}
          onCoinsEarned={(amount) => setCoins(prev => prev + amount)}
          onDistanceUpdate={(distance) => setDailyDistance(prev => prev + distance)}
          onSlugPositionUpdate={setSlugPosition}
          onGameOver={() => setIsGameOver(true)}
          onSlugDistanceUpdate={setSlugDistance}
          onPlayerSpeedUpdate={setPlayerSpeed}
          onSlugSpeedUpdate={setSlugSpeed}
        />
      </div>

      {/* Bottom Distance Display & Notifications */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="container space-y-2">
          {/* Permanent Distance Display */}
          <Card className="p-4 text-center relative">
            <div className="text-2xl font-bold">
              {slugDistance > 0 ? `${slugDistance.toFixed(1)}m` : '---'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Distance to slug
            </div>
            
            {/* Overlay Notifications */}
            {notifications.length > 0 && (
              <div className="absolute inset-0 bg-destructive/95 backdrop-blur-sm rounded-lg flex items-center justify-center animate-in fade-in zoom-in-95">
                <div className="text-lg font-bold text-destructive-foreground px-4">
                  {notifications[notifications.length - 1]}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Game Over Dialog */}
      <Dialog open={isGameOver} onOpenChange={setIsGameOver}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">💀 Game Over!</DialogTitle>
            <DialogDescription className="text-center text-lg pt-4">
              The slug caught you!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="text-4xl">🐌</div>
            <div className="text-center space-y-2">
              <p className="font-semibold">Final Stats:</p>
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>{coins} coins earned</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span>{(dailyDistance / 1000).toFixed(2)}km traveled</span>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button 
              onClick={uploadToStrava}
              variant="secondary"
              className="flex-1"
            >
              Upload to Strava
            </Button>
            <Button 
              onClick={() => {
                setIsGameOver(false);
                setCoins(0);
                setDailyDistance(0);
                setSlugPosition(null);
                gameStartTimeRef.current = new Date();
                window.location.reload();
              }}
              className="flex-1"
            >
              Play Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
