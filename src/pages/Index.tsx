
import { Button } from "@/components/ui/button";
import { CRMProvider, useCRM } from "@/context/CRMContext";
import { Plus, Users, Layers } from "lucide-react";
import { useState } from "react";
import { AddRoundModal } from "@/components/AddRoundModal";
import { AddVCModal } from "@/components/AddVCModal";
import { RoundHeader } from "@/components/RoundHeader";
import { VCRow } from "@/components/VCRow";
import { StatusBadge } from "@/components/StatusBadge";
import { VC } from "@/types";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Import uuid library for this component
import { v4 as uuidv4 } from 'uuid';

const CRMDashboard = () => {
  const { state, getRoundSummary, reorderRounds } = useCRM();
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string | undefined>(undefined);

  const handleAddVCToRound = (roundId: string) => {
    setSelectedRoundId(roundId);
    setIsAddVCModalOpen(true);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(state.rounds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order property for each round
    const updatedRounds = items.map((round, index) => ({
      ...round,
      order: index,
    }));
    
    reorderRounds(updatedRounds);
  };

  // Filter VCs for each round based on expansion state
  const getFilteredVCs = (roundId: string, vcs: string[], isExpanded: boolean): string[] => {
    if (isExpanded) return vcs;
    
    // When collapsed, only show VCs with sold or closeToBuying status
    return vcs.filter(vcId => {
      const vc = state.vcs[vcId];
      return vc && (vc.status === 'sold' || vc.status === 'closeToBuying');
    });
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
        <Droppable droppableId="rounds">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {state.rounds
                .sort((a, b) => a.order - b.order)
                .map((round, index) => {
                  const summary = getRoundSummary(round.id);
                  const filteredVCs = getFilteredVCs(round.id, round.vcs, round.isExpanded);
                  
                  return (
                    <Draggable key={round.id} draggableId={round.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-secondary/50 p-4 rounded-lg"
                        >
                          <RoundHeader
                            round={round}
                            summary={summary}
                            onAddVC={handleAddVCToRound}
                          />
                          
                          {filteredVCs.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ 
                                opacity: 1, 
                                height: 'auto',
                                transition: { duration: 0.3 }
                              }}
                              className="pl-6 mt-2"
                            >
                              {filteredVCs.map((vcId) => (
                                <VCRow
                                  key={`${round.id}-${vcId}`}
                                  vc={state.vcs[vcId]}
                                  roundId={round.id}
                                />
                              ))}
                            </motion.div>
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
      </DragDropContext>

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

        {state.unsortedVCs.length > 0 ? (
          <div className="space-y-1">
            {state.unsortedVCs.map((vcId) => (
              <VCRow key={vcId} vc={state.vcs[vcId]} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground p-4">
            No unsorted VCs. All your VCs are organized in rounds!
          </p>
        )}
      </div>
    </div>
  );
};

// Wrap the dashboard with the CRM Provider
const Index = () => (
  <CRMProvider>
    <CRMDashboard />
  </CRMProvider>
);

export default Index;
