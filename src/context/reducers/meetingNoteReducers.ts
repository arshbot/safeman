
import { CRMState } from '@/types';
import { CRMAction } from '../types';
import { toast } from '@/components/ui/use-toast';

// Reducers for meeting note-related actions
export const meetingNoteReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'ADD_MEETING_NOTE': {
      const { vcId, note } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc) return state;
      
      const updatedVC = {
        ...vc,
        meetingNotes: [...(vc.meetingNotes || []), note],
      };
      
      toast({
        title: "Meeting Note Added",
        description: `Added new meeting note for ${vc.name}`
      });
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: updatedVC,
        },
      };
    }

    case 'UPDATE_MEETING_NOTE': {
      const { vcId, note } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc || !vc.meetingNotes) return state;
      
      const updatedNotes = vc.meetingNotes.map(n => 
        n.id === note.id ? note : n
      );
      
      toast({
        title: "Meeting Note Updated",
        description: `Updated meeting note for ${vc.name}`
      });
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: {
            ...vc,
            meetingNotes: updatedNotes,
          },
        },
      };
    }

    case 'DELETE_MEETING_NOTE': {
      const { vcId, noteId } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc || !vc.meetingNotes) return state;
      
      const updatedNotes = vc.meetingNotes.filter(n => n.id !== noteId);
      
      toast({
        title: "Meeting Note Deleted",
        description: `Deleted meeting note for ${vc.name}`
      });
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: {
            ...vc,
            meetingNotes: updatedNotes,
          },
        },
      };
    }

    default:
      return state;
  }
};
