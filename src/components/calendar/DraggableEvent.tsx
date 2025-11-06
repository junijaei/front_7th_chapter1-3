import { useDraggable } from '@dnd-kit/core';
import { Notifications, Repeat } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { Event } from '../../types';
import { eventBoxStyles } from './shared/styles';
import { getRepeatTypeLabel } from '../../utils/repeatTypeUtils';

interface DraggableEventProps {
  event: Event;
  notifiedEvents: string[];
  onEditEvent: (event: Event) => void;
}

/**
 * 드래그 가능한 일정 컴포넌트
 */
export const DraggableEvent = ({ event, notifiedEvents, onEditEvent }: DraggableEventProps) => {
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
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {isNotified && <Notifications fontSize="small" sx={{ flexShrink: 0 }} />}
      {isRepeating && (
        <Tooltip
          title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
            event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
          }`}
        >
          <Repeat fontSize="small" sx={{ flexShrink: 0 }} />
        </Tooltip>
      )}
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.75rem',
          lineHeight: 1.2,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {event.title}
      </Typography>
    </Box>
  );
};
