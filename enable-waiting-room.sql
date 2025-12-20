-- Enable waiting room for the most recent meeting
UPDATE meetings
SET waiting_room_enabled = true
WHERE id = (
  SELECT id FROM meetings
  ORDER BY created_at DESC
  LIMIT 1
)
RETURNING id, title, meeting_code, waiting_room_enabled;
