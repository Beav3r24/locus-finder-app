import { useEffect, useState, useRef } from 'react';
import * as turf from '@turf/turf';

interface SlugChaseLogicProps {
  userPosition: [number, number] | null;
  onCoinsEarned: (amount: number) => void;
  onDistanceUpdate: (distance: number) => void;
  onSlugPositionUpdate: (position: [number, number]) => void;
  onGameOver: () => void;
  onSlugDistanceUpdate: (distance: number) => void;
  onPlayerSpeedUpdate: (speed: number) => void;
  onSlugSpeedUpdate: (speed: number) => void;
}

const SlugChaseLogic = ({ 
  userPosition, 
  onCoinsEarned, 
  onDistanceUpdate,
  onSlugPositionUpdate,
  onGameOver,
  onSlugDistanceUpdate,
  onPlayerSpeedUpdate,
  onSlugSpeedUpdate
}: SlugChaseLogicProps) => {
  const [slugPosition, setSlugPosition] = useState<[number, number] | null>(null);
  const [distanceFromSlug, setDistanceFromSlug] = useState<number>(0);
  const [userSpeed, setUserSpeed] = useState<number>(0); // km/h
  const [slugSpeed, setSlugSpeed] = useState<number>(4.5); // km/h minimum
  const positionHistoryRef = useRef<Array<{ pos: [number, number], time: number }>>([]);
  const coinTimerRef = useRef<number>(0);

  // Initialize slug position 200 meters away from user
  useEffect(() => {
    if (!userPosition || slugPosition) return;
    
    // Spawn slug 200m away in random direction
    const from = turf.point([userPosition[0], userPosition[1]]);
    const bearing = Math.random() * 360; // Random direction
    const slugPoint = turf.destination(from, 0.2, bearing, { units: 'kilometers' });
    const initialSlugPos: [number, number] = [
      slugPoint.geometry.coordinates[0],
      slugPoint.geometry.coordinates[1]
    ];
    setSlugPosition(initialSlugPos);
    onSlugPositionUpdate(initialSlugPos);
  }, [userPosition]);

  // Calculate user speed over last 1000ms and track movement
  useEffect(() => {
    if (!userPosition) return;

    const now = Date.now();
    
    // Add current position to history
    positionHistoryRef.current.push({ pos: userPosition, time: now });
    
    // Remove positions older than 1000ms
    positionHistoryRef.current = positionHistoryRef.current.filter(
      entry => now - entry.time <= 1000
    );

    // Calculate speed over last 1000ms
    if (positionHistoryRef.current.length >= 2) {
      const oldest = positionHistoryRef.current[0];
      const newest = positionHistoryRef.current[positionHistoryRef.current.length - 1];
      
      const from = turf.point([oldest.pos[0], oldest.pos[1]]);
      const to = turf.point([newest.pos[0], newest.pos[1]]);
      const distanceKm = turf.distance(from, to, { units: 'kilometers' });
      const distanceM = distanceKm * 1000;
      const timeDiffSeconds = (newest.time - oldest.time) / 1000;
      
      // Filter GPS drift - only count if moved > 5 meters
      if (distanceM < 5 || timeDiffSeconds < 0.5) {
        setUserSpeed(0);
        onPlayerSpeedUpdate(0);
      } else {
        const speed = (distanceKm / timeDiffSeconds) * 3600;
        setUserSpeed(speed);
        onPlayerSpeedUpdate(speed);
        
        // Award coins for movement (1 coin per 10 meters)
        onDistanceUpdate(distanceM);
        
        coinTimerRef.current += distanceM;
        if (coinTimerRef.current >= 10) {
          const coinsToAward = Math.floor(coinTimerRef.current / 10);
          onCoinsEarned(coinsToAward);
          coinTimerRef.current = coinTimerRef.current % 10;
        }
      }
    }
  }, [userPosition]);

  // Dynamic slug speed based on user speed
  useEffect(() => {
    let newSpeed;
    if (userSpeed > 6) {
      // If user is fast, slug speeds up to 75% of user speed
      newSpeed = userSpeed * 0.75;
    } else {
      // Minimum slug speed is 4.5 km/h
      newSpeed = 4.5;
    }
    setSlugSpeed(newSpeed);
    onSlugSpeedUpdate(newSpeed);
  }, [userSpeed]);

  // Move slug toward user based on calculated speed
  useEffect(() => {
    if (!userPosition || !slugPosition) return;

    const interval = setInterval(() => {
      const from = turf.point([slugPosition[0], slugPosition[1]]);
      const to = turf.point([userPosition[0], userPosition[1]]);
      const distance = turf.distance(from, to, { units: 'meters' });
      
      setDistanceFromSlug(distance);
      onSlugDistanceUpdate(distance);

      // Don't move slug if already caught user
      if (distance < 3) {
        console.log('🐌 The slug caught you! Distance:', distance.toFixed(2), 'm');
        onGameOver();
        return;
      }

      // Calculate how far slug moves in 1 second at current slug speed
      const slugDistanceKm = (slugSpeed / 3600) * 1; // km per 1 second
      
      console.log(`🐌 Moving slug: ${slugSpeed.toFixed(1)} km/h = ${(slugDistanceKm * 1000).toFixed(2)}m per sec`);
      
      // Calculate direction and move slug toward user
      const bearing = turf.bearing(from, to);
      const newSlugPoint = turf.destination(from, slugDistanceKm, bearing, { units: 'kilometers' });
      const newSlugPos: [number, number] = [
        newSlugPoint.geometry.coordinates[0],
        newSlugPoint.geometry.coordinates[1]
      ];
      
      setSlugPosition(newSlugPos);
      onSlugPositionUpdate(newSlugPos);
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, [userPosition, slugPosition, slugSpeed]);

  // Determine status message
  const getStatusMessage = () => {
    if (distanceFromSlug < 3) return '💀 CAUGHT! Game Over!';
    if (distanceFromSlug < 20) return '🚨 DANGER! Run faster!';
    if (distanceFromSlug < 50) return '⚠️ Too close! Speed up!';
    if (userSpeed === 0) return '🐢 Standing still - slug approaching at 5 km/h!';
    if (userSpeed < 4) return '🐢 Too slow! Slug catching up!';
    if (userSpeed > 10) return '🏃‍♂️ Too fast! Slug speeding up!';
    return '✅ Perfect pace!';
  };

  return (
    <div className="fixed top-20 left-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg text-sm space-y-1 min-w-[200px]">
      <div className="font-semibold">🐌 Slug Chase</div>
      <div>Distance: {distanceFromSlug.toFixed(1)}m</div>
      <div>Your Speed: {userSpeed.toFixed(1)} km/h</div>
      <div>Slug Speed: {slugSpeed.toFixed(1)} km/h</div>
      <div className="text-xs text-muted-foreground pt-1 border-t">
        {getStatusMessage()}
      </div>
    </div>
  );
};

export default SlugChaseLogic;
