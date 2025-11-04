import { useDroppable } from '@dnd-kit/core';
import { TableCell, Typography } from '@mui/material';

import { Event } from '../../types';
import { DraggableEvent } from './DraggableEvent';
import { calendarCellStyles } from './shared/styles';

interface DateCellProps {
  date: Date;
  dateString: string;
  filteredEvents: Event[];
  notifiedEvents: string[];
  onDateCellClick: (dateString: string) => void;
  onEditEvent: (event: Event) => void;
}

/**
 * 주간 뷰용 날짜 셀 컴포넌트 (드롭 가능)
 */
export const DateCell = ({
  date,
  dateString,
  filteredEvents,
  notifiedEvents,
  onDateCellClick,
  onEditEvent,
}: DateCellProps) => {
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
        ...calendarCellStyles,
        backgroundColor: isOver ? '#e3f2fd' : 'transparent',
      }}
    >
      <Typography variant="body2" fontWeight="bold" className="date-number">
        {date.getDate()}
      </Typography>
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
