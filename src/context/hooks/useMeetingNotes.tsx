
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MeetingNote } from '@/types';

export const useMeetingNotes = (
  dispatch: React.Dispatch<any>,
  isReadOnly: boolean,
) => {
  const addMeetingNote = useCallback((vcId: string, content: string) => {
    if (isReadOnly) return;
    
    const note: MeetingNote = {
      id: uuidv4(),
      date: new Date().toISOString(),
      content,
    };
    
    dispatch({ type: 'ADD_MEETING_NOTE', payload: { vcId, note } });
  }, [dispatch, isReadOnly]);
  
  const updateMeetingNote = useCallback((vcId: string, note: MeetingNote) => {
    if (isReadOnly) return;
    
    dispatch({ type: 'UPDATE_MEETING_NOTE', payload: { vcId, note } });
  }, [dispatch, isReadOnly]);
  
  const deleteMeetingNote = useCallback((vcId: string, noteId: string) => {
    if (isReadOnly) return;
    
    dispatch({ type: 'DELETE_MEETING_NOTE', payload: { vcId, noteId } });
  }, [dispatch, isReadOnly]);

  return {
    addMeetingNote,
    updateMeetingNote,
    deleteMeetingNote,
  };
};
