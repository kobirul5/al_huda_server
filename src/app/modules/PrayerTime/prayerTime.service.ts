import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';

const getPrayerTimes = async (city: string = 'Dhaka', country: string = 'Bangladesh') => {
  try {
    const response = await axios.get(
      `http://api.aladhan.com/v1/timingsByCity`,
      {
        params: {
          city,
          country,
          method: 1, // University of Islamic Sciences, Karachi
        },
      }
    );

    if (response.data.code !== 200) {
      throw new ApiError(httpStatus.BAD_GATEWAY, 'Failed to fetch prayer times');
    }

    return response.data.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Error fetching prayer times');
  }
};

export const PrayerTimeService = {
  getPrayerTimes,
};
