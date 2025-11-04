import { useDroppable } from '@dnd-kit/core';
import { TableCell, Typography } from '@mui/material';

import { Event } from '../../types';
import { getEventsForDay } from '../../utils/dateUtils';
import { DraggableEvent } from './DraggableEvent';
import { calendarCellStyles } from './shared/styles';

interface MonthDateCellProps {
  day: number;
  dateString: string;
  holiday?: string;
  filteredEvents: Event[];
  notifiedEvents: string[];
  onDateCellClick: (dateString: string) => void;
  onEditEvent: (event: Event) => void;
}

/**
 * 월간 뷰용 날짜 셀 컴포넌트
 */
export const MonthDateCell = ({
  day,
  dateString,
  holiday,
  filteredEvents,
  notifiedEvents,
  onDateCellClick,
  onEditEvent,
}: MonthDateCellProps) => {
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
        ...calendarCellStyles,
        position: 'relative',
        backgroundColor: isOver ? '#e3f2fd' : 'transparent',
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
        <DraggableEvent
          key={event.id}
          event={event}
          notifiedEvents={notifiedEvents}
          onEditEvent={onEditEvent}
        />
      ))}
    </TableCell>
  );
};
