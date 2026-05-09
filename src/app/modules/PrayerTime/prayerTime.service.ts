import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';

const getPrayerTimes = async (city: string = 'Dhaka', country: string = 'Bangladesh') => {
  try {
    // Fetch Prayer Times
    const prayerResponse = await axios.get(
      `https://api.aladhan.com/v1/timingsByCity`,
      {
        params: {
          city,
          country,
          method: 1, 
        },
      }
    );

    if (prayerResponse.data.code !== 200) {
      throw new ApiError(httpStatus.BAD_GATEWAY, 'Failed to fetch prayer times');
    }

    // Fetch Weather Data (wttr.in provides JSON format with ?format=j1)
    let weatherData = null;
    const fetchWeather = async (retryCount = 0): Promise<any> => {
      try {
        const response = await axios.get(`https://wttr.in/${city}?format=j1`, {
          timeout: 5000, // 5 seconds timeout
        });
        return response.data;
      } catch (err) {
        if (retryCount < 1) {
          return fetchWeather(retryCount + 1);
        }
        console.error('Weather fetch failed after retry:', err instanceof Error ? err.message : err);
        return null;
      }
    };

    weatherData = await fetchWeather();

    return {
      prayer: prayerResponse.data.data,
      weather: weatherData,
    };
  } catch (error: any) {
    console.error('PrayerTime Service Error:', error?.message || error);
    throw new ApiError(
      error?.response?.status || httpStatus.BAD_GATEWAY,
      `Error fetching prayer data: ${error?.message || 'Unknown error'}`
    );
  }
};

export const PrayerTimeService = {
  getPrayerTimes,
};
