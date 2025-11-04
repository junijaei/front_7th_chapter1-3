import { Event, RepeatType } from '../types';

export const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

export const isRecurringEvent = (event: Event): boolean => {
  return event.repeat.type !== 'none' && event.repeat.interval > 0;
};
