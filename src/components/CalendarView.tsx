import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
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

import { Event, RepeatType } from '../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

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

interface CalendarViewProps {
  view: 'week' | 'month';
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateCellClick: (dateString: string) => void;
  onEditEvent: (event: Event) => void;
}

export const CalendarView = ({
  view,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onDateCellClick,
  onEditEvent,
}: CalendarViewProps) => {
  // 날짜 셀 컴포넌트 (드롭 가능) - 주간 뷰용
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
            onDateCellClick(dateString);
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
          onEditEvent(event);
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
            onDateCellClick(dateString);
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

  return (
    <>
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
    </>
  );
};
