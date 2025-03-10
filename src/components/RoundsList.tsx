
import { Round, RoundSummary, VC } from "@/types";
import { Droppable, Draggable, DroppableProvided, DroppableStateSnapshot } from "react-beautiful-dnd";
import { RoundHeader } from "./RoundHeader";
import { DroppableVCList } from "./DroppableVCList";

interface RoundsListProps {
  rounds: Round[];
  getRoundSummary: (roundId: string) => RoundSummary;
  onAddVC: (roundId: string) => void;
  getVC: (id: string) => VC | undefined;
  sortVCsByStatus: (vcIds: string[]) => string[];
}

export function RoundsList({
  rounds,
  getRoundSummary,
  onAddVC,
  getVC,
  sortVCsByStatus
}: RoundsListProps) {
  // Helper function for droppable styling
  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? 'rgba(240, 240, 240, 0.8)' : '#f3f3f3',
    padding: '8px',
    borderRadius: '8px'
  });

  // Filter VCs for each round based on visibility state
  const getFilteredVCs = (roundId: string, vcs: string[], visibility: string): string[] => {
    switch (visibility) {
      case 'expanded':
        return sortVCsByStatus(vcs);
      case 'collapsedShowFinalized':
        // When in middle state, only show VCs with finalized or closeToBuying status
        return sortVCsByStatus(vcs.filter(vcId => {
          const vc = getVC(vcId);
          return vc && (vc.status === 'finalized' || vc.status === 'closeToBuying');
        }));
      case 'collapsedHideAll':
        // When fully collapsed, show no VCs
        return [];
      default:
        return sortVCsByStatus(vcs);
    }
  };

  // Fix for overlapping issue - provide clear visual distinction and spacing
  const getDraggableStyles = (isDragging: boolean, draggableStyle: any) => ({
    // Base styles
    userSelect: 'none',
    padding: 0,
    margin: '0 0 16px 0',
    background: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    
    // Dragging styles
    ...draggableStyle,
    
    // Provide clear visual feedback when dragging
    ...(isDragging && {
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      transform: draggableStyle?.transform ? `${draggableStyle.transform} scale(1.02)` : 'scale(1.02)',
      zIndex: 9999, // Ensure dragged item is on top
    }),
  });
  
  return (
    <Droppable droppableId="rounds" type="ROUND">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
        <div 
          {...provided.droppableProps} 
          ref={provided.innerRef} 
          className="space-y-4" 
          style={getListStyle(snapshot.isDraggingOver)}
        >
          {rounds.sort((a, b) => a.order - b.order).map((round, index) => {
            const summary = getRoundSummary(round.id);
            const filteredVCs = getFilteredVCs(round.id, round.vcs, round.visibility);
            const showVCList = round.visibility !== 'collapsedHideAll';
            
            return (
              <Draggable key={round.id} draggableId={round.id} index={index}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.draggableProps}
                    className="bg-white rounded-lg"
                    style={getDraggableStyles(snapshot.isDragging, provided.draggableProps.style)}
                  >
                    {/* Droppable area for the round header to accept VCs */}
                    <Droppable droppableId={`round-${round.id}`} type="VC">
                      {(dropProvided, dropSnapshot) => (
                        <div 
                          ref={dropProvided.innerRef} 
                          {...dropProvided.droppableProps} 
                          className={`${dropSnapshot.isDraggingOver ? 'bg-blue-50' : ''} rounded-md transition-colors p-4`}
                        >
                          <RoundHeader round={round} summary={summary} onAddVC={onAddVC} dragHandleProps={provided.dragHandleProps} />
                          {dropProvided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    
                    {showVCList && filteredVCs.length > 0 && (
                      <DroppableVCList 
                        droppableId={round.id} 
                        vcs={filteredVCs} 
                        getVC={getVC} 
                        roundId={round.id} 
                      />
                    )}
                    
                    {round.visibility === 'expanded' && filteredVCs.length === 0 && (
                      <p className="text-center text-muted-foreground p-4">
                        No VCs in this round yet. Add some!
                      </p>
                    )}
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
