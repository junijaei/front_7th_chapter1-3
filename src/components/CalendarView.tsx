import { DragOverlay } from '@dnd-kit/core';
import { Repeat } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { Event } from '../types';
import { getRepeatTypeLabel } from '../utils/repeatTypeUtils';
import { MonthView } from './calendar/MonthView';
import { WeekView } from './calendar/WeekView';

interface CalendarViewProps {
  view: 'week' | 'month';
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateCellClick: (dateString: string) => void;
  onEditEvent: (event: Event) => void;
  activeEvent: Event | null;
}

export const CalendarView = ({
  view,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onDateCellClick,
  onEditEvent,
  activeEvent,
}: CalendarViewProps) => {
  return (
    <>
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          onDateCellClick={onDateCellClick}
          onEditEvent={onEditEvent}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          onDateCellClick={onDateCellClick}
          onEditEvent={onEditEvent}
        />
      )}

      {/* 드래그 중 시각적 피드백 */}
      <DragOverlay>
        {activeEvent ? (
          <Box
            sx={{
              p: 0.5,
              my: 0.5,
              borderRadius: 1,
              minHeight: '18px',
              width: '100%',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              fontWeight: 'normal',
              color: 'inherit',
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
    </>
  );
};
