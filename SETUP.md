# Immortal Slug Chase - Setup Guide

## 🐌 Game Overview
A GPS-based fitness game where an immortal slug chases you based on your real-world location. Run to earn coins, unlock skins, and track your fitness progress!

## 📋 Setup Instructions

### 1. Instant DB Setup
1. Go to [https://instantdb.com/dash](https://instantdb.com/dash)
2. Create a new app
3. Copy your App ID
4. Update `src/lib/instantdb.ts` with your App ID:
   ```typescript
   const APP_ID = 'your-app-id-here';
   ```

### 2. Google Maps Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API** for your project
4. Create an API key in the Credentials section
5. The app will prompt you to enter it on first run

### 3. Define Your Data Schema in Instant DB Dashboard
Create these collections in your Instant DB dashboard:

**users**
- username (string)
- coins (number)
- activeSkin (string)
- totalDistance (number)
- dailyGoal (number)
- createdAt (number)

**runs**
- userId (string)
- distance (number)
- duration (number)
- date (number)
- coinsEarned (number)

**skins**
- name (string)
- price (number)
- image (string)

## 🎮 Project Structure

```
src/
├── components/
│   ├── Map.tsx                    # Google Maps integration
│   ├── SlugChaseLogic.tsx         # 🔥 YOUR CHASE LOGIC GOES HERE
│   └── ui/                        # UI components
├── pages/
│   ├── Index.tsx                  # Landing page
│   ├── Game.tsx                   # Main game screen
│   ├── Profile.tsx                # User profile
│   ├── Skins.tsx                  # Skin shop
│   └── Stats.tsx                  # Fitness stats
└── lib/
    └── instantdb.ts               # Database config
```

## 🎯 Implementing Your Chase Logic

Open `src/components/SlugChaseLogic.tsx` and implement your algorithm:

```typescript
// Key things you'll need to calculate:
// 1. Slug's position relative to user
// 2. Slug's movement speed
// 3. Chase behavior (direct chase, prediction, etc.)
// 4. Distance calculations
// 5. Reward system (coins for distance/time)
```

## 🚀 Features Ready to Connect

### ✅ Already Built
- GPS tracking
- Map visualization with user position
- Profile system
- Coins & skins system
- Fitness tracking
- Stats dashboard

### 🔥 TODO (Your Chase Logic)
- Slug position calculation
- Chase algorithm
- Distance-based rewards
- Game difficulty progression

## 📱 Testing

1. Run the app: It's already running in your Lovable preview
2. Allow location access when prompted
3. Enter your Google Maps API key
4. Start implementing your chase logic!

## 🎨 Features

- **Real-time GPS tracking**
- **Google Maps integration**
- **Coin & reward system**
- **Slug skin shop**
- **Daily fitness goals**
- **Run history & stats**
- **User profiles**

## 🐛 Need Help?

- Make sure location permissions are enabled
- Google Maps API key must start with `AIza`
- Instant DB App ID format: UUID string
- Check browser console for any errors
