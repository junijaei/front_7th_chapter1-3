import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Close, Notifications, Repeat } from '@mui/icons-material';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

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
import { Event, EventForm as EventFormType, RepeatType } from './types.ts';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from './utils/dateUtils.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';

const categories = ['업무', '개인', '가족', '기타'];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

// 스타일 상수
const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

const getRepeatTypeLabel = (type: RepeatType): string => {
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

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
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

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventFormType = {
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

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    // 수정
    if (editingEvent) {
      if (hasOverlapEvent) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }

      if (
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
      return;
    }

    // 생성
    if (isRepeating) {
      // 반복 생성은 반복 일정을 고려하지 않는다.
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    if (hasOverlapEvent) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => {
                  const dateString = formatDate(date, date.getDate());
                  return <DateCell key={date.toISOString()} date={date} dateString={dateString} />;
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  // 날짜 셀 컴포넌트 (드롭 가능)
  const DateCell = ({ date, dateString }: { date: Date; dateString: string }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: dateString,
    });

    const eventsForDay = filteredEvents.filter(
      (event) => new Date(event.date).toDateString() === date.toDateString()
    );

    return (
      <TableCell
        ref={setNodeRef}
        onClick={(e) => {
          // 일정 박스가 아닌 빈 영역 클릭 시에만 처리
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.date-number')) {
            handleDateCellClick(dateString);
          }
        }}
        sx={{
          height: '120px',
          verticalAlign: 'top',
          width: '14.28%',
          padding: 1,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          backgroundColor: isOver ? '#e3f2fd' : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        <Typography variant="body2" fontWeight="bold" className="date-number">
          {date.getDate()}
        </Typography>
        {eventsForDay.map((event) => (
          <DraggableEvent key={event.id} event={event} />
        ))}
      </TableCell>
    );
  };

  // 드래그 가능한 일정 컴포넌트
  const DraggableEvent = ({ event }: { event: Event }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: event.id,
    });

    const isNotified = notifiedEvents.includes(event.id);
    const isRepeating = event.repeat.type !== 'none';

    return (
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={(e) => {
          e.stopPropagation(); // 날짜 셀 클릭 방지
          handleEditEvent(event);
        }}
        sx={{
          ...eventBoxStyles.common,
          ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
          opacity: isDragging ? 0.5 : 1,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {isNotified && <Notifications fontSize="small" />}
          {isRepeating && (
            <Tooltip
              title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
              }`}
            >
              <Repeat fontSize="small" />
            </Tooltip>
          )}
          <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
            {event.title}
          </Typography>
        </Stack>
      </Box>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];

                    if (!day) {
                      return (
                        <TableCell
                          key={dayIndex}
                          sx={{
                            height: '120px',
                            verticalAlign: 'top',
                            width: '14.28%',
                            padding: 1,
                            border: '1px solid #e0e0e0',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        />
                      );
                    }

                    return (
                      <MonthDateCell
                        key={dayIndex}
                        day={day}
                        dateString={dateString}
                        holiday={holiday}
                      />
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  // 월간 뷰 날짜 셀 컴포넌트
  const MonthDateCell = ({
    day,
    dateString,
    holiday,
  }: {
    day: number;
    dateString: string;
    holiday?: string;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: dateString,
    });

    const eventsForDay = getEventsForDay(filteredEvents, day);

    return (
      <TableCell
        ref={setNodeRef}
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.date-number')) {
            handleDateCellClick(dateString);
          }
        }}
        sx={{
          height: '120px',
          verticalAlign: 'top',
          width: '14.28%',
          padding: 1,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: isOver ? '#e3f2fd' : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        <Typography variant="body2" fontWeight="bold" className="date-number">
          {day}
        </Typography>
        {holiday && (
          <Typography variant="body2" color="error">
            {holiday}
          </Typography>
        )}
        {eventsForDay.map((event) => (
          <DraggableEvent key={event.id} event={event} />
        ))}
      </TableCell>
    );
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

            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
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
                saveEvent({
                  id: editingEvent ? editingEvent.id : undefined,
                  title,
                  date,
                  startTime,
                  endTime,
                  description,
                  location,
                  category,
                  repeat: {
                    type: isRepeating ? repeatType : 'none',
                    interval: repeatInterval,
                    endDate: repeatEndDate || undefined,
                  },
                  notificationTime,
                });
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

      {/* 드래그 중 시각적 피드백 */}
      <DragOverlay>
        {activeEvent ? (
          <Box
            sx={{
              ...eventBoxStyles.common,
              ...eventBoxStyles.normal,
              opacity: 0.8,
              boxShadow: 3,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {activeEvent.repeat.type !== 'none' && (
                <Tooltip
                  title={`${activeEvent.repeat.interval}${getRepeatTypeLabel(activeEvent.repeat.type)}마다 반복${
                    activeEvent.repeat.endDate ? ` (종료: ${activeEvent.repeat.endDate})` : ''
                  }`}
                >
                  <Repeat fontSize="small" />
                </Tooltip>
              )}
              <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                {activeEvent.title}
              </Typography>
            </Stack>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
