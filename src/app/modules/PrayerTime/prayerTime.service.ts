import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';

const PRAYER_API_TIMEOUT = 10000; // 10 seconds
const WEATHER_API_TIMEOUT = 8000; // 8 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Utility function to implement retry logic with exponential backoff
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<any> => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  throw lastError;
};

const getPrayerTimes = async (city: string = 'Dhaka', country: string = 'Bangladesh') => {
  try {
    // Fetch Prayer Times with retry logic
    let prayerResponse;
    try {
      prayerResponse = await retryWithBackoff(async () => {
        return await axios.get(
          `https://api.aladhan.com/v1/timingsByCity`,
          {
            params: {
              city,
              country,
              method: 1,
            },
            timeout: PRAYER_API_TIMEOUT,
          }
        );
      });
    } catch (err: any) {
      console.error('Prayer API Error:', {
        city,
        country,
        error: err?.message || err,
        code: err?.code,
        status: err?.response?.status,
      });
      throw new ApiError(
        httpStatus.BAD_GATEWAY,
        'Unable to fetch prayer times from external service. Please try again later.'
      );
    }

    if (!prayerResponse || prayerResponse.data.code !== 200) {
      throw new ApiError(
        httpStatus.BAD_GATEWAY,
        'Invalid response from prayer times service'
      );
    }

    // Fetch Weather Data (wttr.in provides JSON format with ?format=j1)
    // Weather is non-critical, so we don't fail if it's unavailable
    let weatherData = null;
    try {
      weatherData = await retryWithBackoff(
        async () => {
          const response = await axios.get(`https://wttr.in/${city}?format=j1`, {
            timeout: WEATHER_API_TIMEOUT,
          });
          return response.data;
        },
        1 // Only retry once for weather
      );
    } catch (err: any) {
      console.warn('Weather API failed (non-critical):', {
        city,
        error: err?.message || err,
      });
      // Don't throw - weather data is optional
      weatherData = null;
    }

    return {
      prayer: prayerResponse.data.data,
      weather: weatherData,
    };
  } catch (error: any) {
    console.error('PrayerTime Service Error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error?.response?.status || httpStatus.BAD_GATEWAY,
      error?.message || 'An unexpected error occurred while fetching prayer times'
    );
  }
};

export const PrayerTimeService = {
  getPrayerTimes,
};
