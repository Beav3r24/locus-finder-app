import { STRAVA_ACCESS_TOKEN, STRAVA_API_BASE_URL } from '@/config/strava';

export interface StravaActivity {
  name: string;
  type: 'Run';
  start_date_local: string;
  elapsed_time: number; // in seconds
  distance: number; // in meters
  description?: string;
}

export const uploadActivityToStrava = async (activity: StravaActivity) => {
  try {
    const response = await fetch(`${STRAVA_API_BASE_URL}/activities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAVA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Strava API error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to upload activity to Strava:', error);
    throw error;
  }
};
