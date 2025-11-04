import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { createNonRepeatingRepeatWithEndDate } from '../constants/eventDefaults';
import { SNACKBAR_VARIANT } from '../constants/snackbar';
import { Event, EventForm } from '../types';
import { generateRepeatEvents } from '../utils/generateRepeatEvents';

// 에러 메시지 상수
const ERROR_MESSAGES = {
  FETCH_FAILED: '이벤트 로딩 실패',
  SAVE_FAILED: '일정 저장 실패',
  DELETE_FAILED: '일정 삭제 실패',
} as const;

// 성공 메시지 상수
const SUCCESS_MESSAGES = {
  EVENT_ADDED: '일정이 추가되었습니다',
  EVENT_UPDATED: '일정이 수정되었습니다',
  EVENT_DELETED: '일정이 삭제되었습니다',
  EVENTS_LOADED: '일정 로딩 완료!',
} as const;

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar(ERROR_MESSAGES.FETCH_FAILED, { variant: SNACKBAR_VARIANT.ERROR });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
        const editingEvent = {
          ...eventData,
          // ! TEST CASE
          repeat: eventData.repeat ?? createNonRepeatingRepeatWithEndDate(),
        };

        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingEvent),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? SUCCESS_MESSAGES.EVENT_UPDATED : SUCCESS_MESSAGES.EVENT_ADDED, {
        variant: SNACKBAR_VARIANT.SUCCESS,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: SNACKBAR_VARIANT.ERROR });
    }
  };

  // 드래그 앤 드롭 등에서 사용할 별도의 업데이트 함수
  const updateEvent = async (eventData: Event) => {
    try {
      const response = await fetch(`/api/events/${eventData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          repeat: eventData.repeat ?? createNonRepeatingRepeatWithEndDate(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      await fetchEvents();
      enqueueSnackbar(SUCCESS_MESSAGES.EVENT_UPDATED, { variant: 'success' });
    } catch (error) {
      console.error('Error updating event:', error);
      enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar(SUCCESS_MESSAGES.EVENT_DELETED, { variant: SNACKBAR_VARIANT.INFO });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar(ERROR_MESSAGES.DELETE_FAILED, { variant: SNACKBAR_VARIANT.ERROR });
    }
  };

  const createRepeatEvent = async (eventData: EventForm) => {
    try {
      const newEvents = generateRepeatEvents(eventData);
      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: newEvents }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(SUCCESS_MESSAGES.EVENT_ADDED, { variant: 'success' });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar(SUCCESS_MESSAGES.EVENTS_LOADED, { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, updateEvent, deleteEvent, createRepeatEvent };
};
