import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Play, Trophy } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-8xl mb-4">🐌</div>
          <CardTitle className="text-4xl font-bold mb-2">Run The Slug</CardTitle>
          <p className="text-muted-foreground">Run or be caught by the slug!</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/game" className="block">
            <Button className="w-full h-14 text-lg" size="lg">
              <Play className="mr-2" />
              Start Game
            </Button>
          </Link>
          <Link to="/stats" className="block">
            <Button variant="outline" className="w-full h-12" size="lg">
              <Trophy className="mr-2" />
              Stats & Records
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
