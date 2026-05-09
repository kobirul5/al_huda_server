import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';

const getPrayerTimes = async (city: string = 'Dhaka', country: string = 'Bangladesh') => {
  try {
    // Fetch Prayer Times
    const prayerResponse = await axios.get(
      `http://api.aladhan.com/v1/timingsByCity`,
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
    try {
      const weatherResponse = await axios.get(`https://wttr.in/${city}?format=j1`);
      weatherData = weatherResponse.data;
    } catch (err) {
      console.error('Weather fetch failed:', err);
      // Fallback or null
    }

    return {
      prayer: prayerResponse.data.data,
      weather: weatherData,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Error fetching data');
  }
};

export const PrayerTimeService = {
  getPrayerTimes,
};
