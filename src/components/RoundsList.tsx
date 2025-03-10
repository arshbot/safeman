
import { Round, RoundSummary, VC } from "@/types";
import { Droppable, Draggable } from "react-beautiful-dnd";
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
    background: isDraggingOver ? 'rgba(var(--secondary), 0.7)' : 'rgba(var(--secondary), 0.5)',
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
  
  return (
    <Droppable droppableId="rounds" type="ROUND">
      {(provided, snapshot) => (
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
                  <div ref={provided.innerRef} className="bg-secondary/50 p-4 rounded-lg py-px">
                    {/* Droppable area for the round header to accept VCs */}
                    <Droppable droppableId={`round-${round.id}`} type="VC">
                      {(dropProvided, dropSnapshot) => (
                        <div 
                          ref={dropProvided.innerRef} 
                          {...dropProvided.droppableProps} 
                          className={`${dropSnapshot.isDraggingOver ? 'bg-primary/10' : ''} rounded-md transition-colors`}
                        >
                          <RoundHeader round={round} summary={summary} onAddVC={onAddVC} />
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
