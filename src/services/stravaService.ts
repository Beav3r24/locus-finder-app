import { STRAVA_ACCESS_TOKEN, STRAVA_API_BASE_URL } from '@/config/strava';

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date_local: string;
  elapsed_time: number;
  distance: number;
  description?: string;
  map?: {
    summary_polyline: string;
  };
}

export interface StravaActivityStream {
  latlng: {
    data: [number, number][];
  };
}

export const getStravaActivities = async (perPage: number = 30) => {
  try {
    const response = await fetch(
      `${STRAVA_API_BASE_URL}/athlete/activities?per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${STRAVA_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Strava API error: ${errorData.message || response.statusText}`);
    }

    return await response.json() as StravaActivity[];
  } catch (error) {
    console.error('Failed to fetch Strava activities:', error);
    throw error;
  }
};

export const getActivityStream = async (activityId: number) => {
  try {
    const response = await fetch(
      `${STRAVA_API_BASE_URL}/activities/${activityId}/streams?keys=latlng&key_by_type=true`,
      {
        headers: {
          'Authorization': `Bearer ${STRAVA_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Strava API error: ${errorData.message || response.statusText}`);
    }

    return await response.json() as StravaActivityStream;
  } catch (error) {
    console.error('Failed to fetch activity stream:', error);
    throw error;
  }
};

export const uploadActivityToStrava = async (activity: Omit<StravaActivity, 'id'>) => {
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
