import { Button } from "@/components/ui/button";
import { useCRM } from "@/context/CRMContext";
import { Plus, Users, Layers } from "lucide-react";
import { useState } from "react";
import { AddRoundModal } from "@/components/AddRoundModal";
import { AddVCModal } from "@/components/AddVCModal";
import { RoundHeader } from "@/components/RoundHeader";
import { VCRow } from "@/components/VCRow";
import { 
  Droppable,
  Draggable,
  DropResult,
  resetServerContext
} from "react-beautiful-dnd";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Reset server context for SSR compatibility
resetServerContext();

// Helper function for droppable styling
const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'rgba(var(--secondary), 0.7)' : 'rgba(var(--secondary), 0.5)',
  padding: '8px',
  borderRadius: '8px'
});

const Index = () => {
  const { state, getRoundSummary, reorderRounds, reorderVCs, addVCToRound } = useCRM();
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string | undefined>(undefined);

  const handleAddVCToRound = (roundId: string) => {
    setSelectedRoundId(roundId);
    setIsAddVCModalOpen(true);
  };

  // Handle drag end for rounds and VCs
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;
    
    // Handle round reordering
    if (type === 'ROUND') {
      const items = Array.from(state.rounds);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      // Update the order property for each round
      const updatedRounds = items.map((round, index) => ({
        ...round,
        order: index,
      }));
      
      reorderRounds(updatedRounds);
      return;
    }
    
    // Handle VC reordering within a round or moving VCs between containers
    if (type === 'VC') {
      const sourceRoundId = source.droppableId;
      const destRoundId = destination.droppableId;
      
      // If the VC is dragged over a round header (droppable with "round-" prefix)
      if (destRoundId.startsWith('round-')) {
        const actualRoundId = destRoundId.replace('round-', '');
        
        // If dragging from unsorted to a round header
        if (sourceRoundId === 'unsorted') {
          // Extract the VC ID from the draggableId (format is "unsorted-{vcId}")
          const vcId = draggableId.replace('unsorted-', '');
          addVCToRound(vcId, actualRoundId);
          toast.success(`VC moved to round successfully`);
          return;
        }
        
        return;
      }
      
      // Regular reordering within the same container
      if (sourceRoundId === destRoundId) {
        // Reordering within the same round
        const round = state.rounds.find(r => r.id === sourceRoundId);
        if (!round) return;
        
        const newVcIds = Array.from(round.vcs);
        const [movedVcId] = newVcIds.splice(source.index, 1);
        newVcIds.splice(destination.index, 0, movedVcId);
        
        reorderVCs(sourceRoundId, newVcIds);
      } else if (sourceRoundId === 'unsorted' && destRoundId !== 'unsorted') {
        // Moving VC from unsorted to a round
        const vcId = state.unsortedVCs[source.index];
        addVCToRound(vcId, destRoundId);
        toast.success(`VC moved to round successfully`);
      }
    }
  };

  // Sort VCs by status: sold -> closeToBuying -> others
  const sortVCsByStatus = (vcIds: string[]): string[] => {
    return [...vcIds].sort((aId, bId) => {
      const vcA = state.vcs[aId];
      const vcB = state.vcs[bId];
      
      if (!vcA || !vcB) return 0;
      
      // Sold VCs come first
      if (vcA.status === 'sold' && vcB.status !== 'sold') return -1;
      if (vcA.status !== 'sold' && vcB.status === 'sold') return 1;
      
      // Close to buying VCs come second
      if (vcA.status === 'closeToBuying' && vcB.status !== 'closeToBuying') return -1;
      if (vcA.status !== 'closeToBuying' && vcB.status === 'closeToBuying') return 1;
      
      // All other statuses maintain their order
      return 0;
    });
  };
  
  // Sort unsorted VCs by status
  const sortedUnsortedVCs = sortVCsByStatus(state.unsortedVCs);

  // Filter VCs for each round based on expansion state
  const getFilteredVCs = (roundId: string, vcs: string[], isExpanded: boolean): string[] => {
    if (isExpanded) return sortVCsByStatus(vcs);
    
    // When collapsed, only show VCs with sold or closeToBuying status
    return sortVCsByStatus(vcs.filter(vcId => {
      const vc = state.vcs[vcId];
      return vc && (vc.status === 'sold' || vc.status === 'closeToBuying');
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VC Round Manager</h1>
          <p className="text-muted-foreground mt-1">
            Organize your investor relationships by funding rounds
          </p>
        </div>
        <div className="flex space-x-2">
          <AddVCModal
            open={isAddVCModalOpen}
            onOpenChange={setIsAddVCModalOpen}
            roundId={selectedRoundId}
            trigger={
              <Button variant="outline" onClick={() => {
                setSelectedRoundId(undefined);
                setIsAddVCModalOpen(true);
              }}>
                <Users className="mr-2 h-4 w-4" />
                Add VC
              </Button>
            }
          />
          <AddRoundModal
            trigger={
              <Button>
                <Layers className="mr-2 h-4 w-4" />
                Add Round
              </Button>
            }
          />
        </div>
      </motion.div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="rounds" type="ROUND">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {state.rounds
                .sort((a, b) => a.order - b.order)
                .map((round, index) => {
                  const summary = getRoundSummary(round.id);
                  const filteredVCs = getFilteredVCs(round.id, round.vcs, round.isExpanded);
                  
                  return (
                    <Draggable key={round.id} draggableId={round.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-secondary/50 p-4 rounded-lg"
                        >
                          {/* Add droppable area for the round header to accept VCs */}
                          <Droppable droppableId={`round-${round.id}`} type="VC">
                            {(dropProvided, dropSnapshot) => (
                              <div
                                ref={dropProvided.innerRef}
                                {...dropProvided.droppableProps}
                                className={`${dropSnapshot.isDraggingOver ? 'bg-primary/10' : ''} rounded-md transition-colors`}
                              >
                                <RoundHeader
                                  round={round}
                                  summary={summary}
                                  onAddVC={handleAddVCToRound}
                                />
                                {dropProvided.placeholder}
                              </div>
                            )}
                          </Droppable>
                          
                          {filteredVCs.length > 0 && (
                            <Droppable droppableId={round.id} type="VC">
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ 
                                    opacity: 1, 
                                    height: 'auto',
                                    transition: { duration: 0.3 }
                                  }}
                                  className="pl-6 mt-2"
                                  style={{
                                    background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {filteredVCs.map((vcId, vcIndex) => (
                                    <Draggable 
                                      key={vcId} 
                                      draggableId={`${round.id}-${vcId}`} 
                                      index={vcIndex}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <VCRow
                                            vc={state.vcs[vcId]}
                                            roundId={round.id}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </motion.div>
                              )}
                            </Droppable>
                          )}
                          
                          {round.isExpanded && filteredVCs.length === 0 && (
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

        {state.rounds.length === 0 && (
          <div className="text-center py-12 bg-secondary/30 rounded-lg border border-dashed border-muted">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No rounds yet</h3>
            <p className="mt-1 text-muted-foreground">
              Create a round to start organizing your VCs
            </p>
            <AddRoundModal
              trigger={
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Round
                </Button>
              }
            />
          </div>
        )}

        <div className="mt-8 bg-secondary/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Unsorted VCs</h2>
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedRoundId(undefined);
              setIsAddVCModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add VC
            </Button>
          </div>

          {sortedUnsortedVCs.length > 0 ? (
            <Droppable droppableId="unsorted" type="VC">
              {(provided, snapshot) => (
                <div 
                  className={`space-y-1 ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    padding: '4px',
                    borderRadius: '4px',
                    minHeight: '50px', // Ensure there's always a drop area even if empty
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {sortedUnsortedVCs.map((vcId, index) => (
                    <Draggable 
                      key={vcId} 
                      draggableId={`unsorted-${vcId}`} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <VCRow key={vcId} vc={state.vcs[vcId]} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            <p className="text-center text-muted-foreground p-4">
              No unsorted VCs. All your VCs are organized in rounds!
            </p>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Index;
