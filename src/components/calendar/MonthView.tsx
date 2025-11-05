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
import { calendarCellStyles } from './shared/styles';
import { formatDate, formatMonth, getWeeksAtMonth } from '../../utils/dateUtils';

interface MonthViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateCellClick: (dateString: string) => void;
  onEditEvent: (event: Event) => void;
}

/**
 * 월간 뷰 컴포넌트
 */
export const MonthView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onDateCellClick,
  onEditEvent,
}: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatMonth(currentDate)}</Typography>
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
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <TableCell
                        key={dayIndex}
                        sx={{
                          ...calendarCellStyles,
                          position: 'relative',
                        }}
                      />
                    );
                  }

                  const date = new Date(currentDate);
                  date.setDate(day);
                  const dateString = formatDate(currentDate, day);
                  const holiday = holidays[dateString];

                  return (
                    <DateCell
                      key={dayIndex}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
