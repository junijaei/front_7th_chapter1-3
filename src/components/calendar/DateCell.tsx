import { useDroppable } from '@dnd-kit/core';
import { TableCell, Typography } from '@mui/material';

import { DraggableEvent } from './DraggableEvent';
import { Event } from '../../types';
import { calendarCellStyles } from './shared/styles';

interface DateCellProps {
  date: Date;
  dateString: string;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holiday?: string;
  onDateCellClick: (dateString: string) => void;
  onEditEvent: (event: Event) => void;
}

/**
 * 캘린더 날짜 셀 컴포넌트 (주간 뷰 & 월간 뷰 공통)
 * - 드래그앤드롭 지원
 * - 공휴일 표시
 */
export const DateCell = ({
  date,
  dateString,
  filteredEvents,
  notifiedEvents,
  holiday,
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
      data-date={dateString}
      onClick={(e) => {
        // 일정 박스가 아닌 빈 영역 클릭 시에만 처리
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
        {date.getDate()}
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
