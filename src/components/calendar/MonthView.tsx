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

import { Event } from '../../types';
import { formatDate, formatMonth, getWeeksAtMonth } from '../../utils/dateUtils';
import { MonthDateCell } from './MonthDateCell';
import { calendarCellStyles } from './shared/styles';
import { WEEK_DAYS } from './shared/constants';

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
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const holiday = holidays[dateString];

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

                  return (
                    <MonthDateCell
                      key={dayIndex}
                      day={day}
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
