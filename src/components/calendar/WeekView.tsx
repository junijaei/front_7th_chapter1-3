import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { DateCell } from './DateCell';
import { Event } from '../../types';
import { WEEK_DAYS } from './shared/constants';
import { formatDate, formatWeek, getWeekDates } from '../../utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateCellClick: (dateString: string) => void;
  onEditEvent: (event: Event) => void;
}

/**
 * 주간 뷰 컴포넌트
 */
export const WeekView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onDateCellClick,
  onEditEvent,
}: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatWeek(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {WEEK_DAYS.map((day) => (
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
                const holiday = holidays[dateString];
                return (
                  <DateCell
                    key={date.toISOString()}
                    date={date}
                    dateString={dateString}
                    holiday={holiday}
                    filteredEvents={filteredEvents}
                    notifiedEvents={notifiedEvents}
                    onDateCellClick={onDateCellClick}
                    onEditEvent={onEditEvent}
                  />
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
