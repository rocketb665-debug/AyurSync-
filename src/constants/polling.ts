export const POLLING_CATEGORIES = {
  DAILY: {
    metrics: ['hydration', 'sleep', 'steps', 'mood', 'oxygen', 'heartRate'],
    standardIntervalHours: 24,
  },
  CHRONIC: {
    metrics: ['bloodSugar', 'bloodPressure'],
    standardIntervalHours: 72, // 3 days
  },
  STRUCTURAL: {
    metrics: ['weight', 'symptoms', 'stress'],
    standardIntervalHours: 168, // 7 days
  },
};
