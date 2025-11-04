import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Close } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarView } from './components/CalendarView.tsx';
import { EventForm } from './components/EventForm.tsx';
import { EventList } from './components/EventList.tsx';
import RecurringEventDialog from './components/RecurringEventDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useDateClick } from './hooks/useDateClick.ts';
import { useDragAndDrop } from './hooks/useDragAndDrop.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType } from './types.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';
import { isRecurringEvent } from './utils/repeatTypeUtils.ts';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const formState = useEventForm();
  const {
    title,
    setDate,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = formState;

  const { events, saveEvent, updateEvent, deleteEvent, createRepeatEvent, fetchEvents } =
    useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));

  const { handleRecurringEdit, handleRecurringDelete } = useRecurringEventOperations(
    events,
    async () => {
      // After recurring edit, refresh events from server
      await fetchEvents();
    }
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null); // true = single, false = all
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete'>('edit');

  const { enqueueSnackbar } = useSnackbar();

  // 드래그 앤 드롭 상태
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  // 날짜 클릭 훅
  const { handleDateCellClick } = useDateClick(
    setDate,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm
  );

  // 드래그 앤 드롭 훅
  const { handleDragStart, handleDragEnd } = useDragAndDrop(
    events,
    updateEvent,
    (overlaps) => {
      setOverlappingEvents(overlaps);
      setIsOverlapDialogOpen(true);
    }
  );

  // dnd-kit 드래그 이벤트 핸들러
  const onDragStart = (event: DragStartEvent) => {
    const eventId = event.active.id as string;
    const draggedEvent = events.find((e) => e.id === eventId);
    if (draggedEvent) {
      setActiveEvent(draggedEvent);
      handleDragStart(draggedEvent);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const eventId = active.id as string;
      const newDate = over.id as string;
      const draggedEvent = events.find((e) => e.id === eventId);

      if (draggedEvent) {
        handleDragEnd(draggedEvent, newDate);
      }
    }

    setActiveEvent(null);
  };

  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      // 편집 모드 저장하고 편집 폼으로 이동
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
    } else if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      // 반복 일정 삭제 처리
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    }
  };

  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  // 이벤트 데이터 빌드
  const buildEventData = (): Event | EventFormType => {
    return {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? editingEvent.repeat // Keep original repeat settings for recurring event detection
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };
  };

  // 필수 입력값 검증
  const validateEventInput = (): boolean => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return false;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return false;
    }

    return true;
  };

  // 이벤트 수정 처리
  const handleEventUpdate = async (eventData: Event | EventFormType) => {
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    if (
      editingEvent &&
      editingEvent.repeat.type !== 'none' &&
      editingEvent.repeat.interval > 0 &&
      recurringEditMode !== null
    ) {
      await handleRecurringEdit(eventData as Event, recurringEditMode);
      setRecurringEditMode(null);
    } else {
      await saveEvent(eventData);
    }

    resetForm();
  };

  // 이벤트 생성 처리
  const handleEventCreate = async (eventData: Event | EventFormType) => {
    // 반복 일정 생성
    if (isRepeating) {
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    // 단일 일정 생성
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  // 일정 추가/수정 메인 함수
  const addOrUpdateEvent = async () => {
    if (!validateEventInput()) {
      return;
    }

    const eventData = buildEventData();

    if (editingEvent) {
      await handleEventUpdate(eventData);
    } else {
      await handleEventCreate(eventData);
    }
  };


  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
        <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
          <EventForm
            formState={formState}
            categories={categories}
            notificationOptions={notificationOptions}
            onSubmit={addOrUpdateEvent}
          />

          <Stack flex={1} spacing={5}>
            <Typography variant="h4">일정 보기</Typography>

            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
                <ChevronLeft />
              </IconButton>
              <Select
                size="small"
                aria-label="뷰 타입 선택"
                value={view}
                onChange={(e) => setView(e.target.value as 'week' | 'month')}
              >
                <MenuItem value="week" aria-label="week-option">
                  Week
                </MenuItem>
                <MenuItem value="month" aria-label="month-option">
                  Month
                </MenuItem>
              </Select>
              <IconButton aria-label="Next" onClick={() => navigate('next')}>
                <ChevronRight />
              </IconButton>
            </Stack>

            <CalendarView
              view={view}
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
              onDateCellClick={handleDateCellClick}
              onEditEvent={handleEditEvent}
              activeEvent={activeEvent}
            />
          </Stack>

          <EventList
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
            notificationOptions={notificationOptions}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </Stack>

        <Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
          <DialogTitle>일정 겹침 경고</DialogTitle>
          <DialogContent>
            <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
            {overlappingEvents.map((event) => (
              <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Typography>
            ))}
            <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
            <Button
              color="error"
              onClick={() => {
                setIsOverlapDialogOpen(false);
                saveEvent(buildEventData());
              }}
            >
              계속 진행
            </Button>
          </DialogActions>
        </Dialog>

        <RecurringEventDialog
          open={isRecurringDialogOpen}
          onClose={() => {
            setIsRecurringDialogOpen(false);
            setPendingRecurringEdit(null);
            setPendingRecurringDelete(null);
          }}
          onConfirm={handleRecurringConfirm}
          event={recurringDialogMode === 'edit' ? pendingRecurringEdit : pendingRecurringDelete}
          mode={recurringDialogMode}
        />

        {notifications.length > 0 && (
          <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
            {notifications.map((notification, index) => (
              <Alert
                key={index}
                severity="info"
                sx={{ width: 'auto' }}
                action={
                  <IconButton
                    size="small"
                    onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Close />
                  </IconButton>
                }
              >
                <AlertTitle>{notification.message}</AlertTitle>
              </Alert>
            ))}
          </Stack>
        )}
      </Box>
    </DndContext>
  );
}

export default App;
