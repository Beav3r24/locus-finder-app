import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Skins = () => {
  // TODO: Connect to Instant DB to fetch available skins
  const skins = [
    { id: 'default', name: 'Classic Slug', price: 0, owned: true, active: true },
    { id: 'speedy', name: 'Speedy Slug', price: 100, owned: false, active: false },
    { id: 'rainbow', name: 'Rainbow Slug', price: 250, owned: false, active: false },
    { id: 'golden', name: 'Golden Slug', price: 500, owned: false, active: false },
    { id: 'cosmic', name: 'Cosmic Slug', price: 1000, owned: false, active: false },
  ];

  const userCoins = 0; // TODO: Get from Instant DB

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Slug Skins</h1>
          <Link to="/">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Your Coins</span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">{userCoins}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skins.map((skin) => (
            <Card key={skin.id} className={skin.active ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{skin.name}</span>
                  {skin.active && <Check className="w-5 h-5 text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                  <span className="text-6xl">🐌</span>
                </div>
              </CardContent>
              <CardFooter>
                {skin.owned ? (
                  skin.active ? (
                    <Button className="w-full" disabled>Active</Button>
                  ) : (
                    <Button className="w-full">Equip</Button>
                  )
                ) : (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={userCoins < skin.price}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Buy for {skin.price}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skins;
