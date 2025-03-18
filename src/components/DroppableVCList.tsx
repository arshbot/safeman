
import { VC } from "@/types";
import { Droppable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { VCDraggable } from "./VCDraggable";

interface DroppableVCListProps {
  droppableId: string;
  vcs: string[];
  getVC: (id: string) => VC | undefined;
  roundId?: string;
  className?: string;
  enableDropping?: boolean;
}

export function DroppableVCList({ 
  droppableId, 
  vcs, 
  getVC, 
  roundId,
  className = "pl-6 mt-4 pb-4", // Increased top and bottom padding
  enableDropping = true
}: DroppableVCListProps) {
  console.log(`[DEBUG] Rendering droppable list: ${droppableId} with ${vcs.length} VCs and roundId: ${roundId || 'none'}`);
  
  if (!enableDropping && droppableId === "unsorted") {
    // For non-droppable lists (used within unsorted), just render the items
    return (
      <div className={className}>
        {vcs.map((vcId, vcIndex) => {
          const vc = getVC(vcId);
          if (!vc) {
            console.error(`[DEBUG] VC not found: ${vcId}`);
            return null;
          }
          
          return (
            <VCDraggable 
              key={vcId} 
              vcId={vcId} 
              index={vcIndex} 
              vc={vc} 
              roundId={roundId}
            />
          );
        })}
      </div>
    );
  }
  
  // Get a friendly display name for the drop area
  const getDropAreaName = (id: string): string => {
    if (id === 'unsorted') return 'Unsorted';
    if (roundId) return 'this round';
    return 'this section';
  };
  
  return (
    <Droppable droppableId={droppableId} type="VC" isDropDisabled={!enableDropping}>
      {(provided, snapshot) => {
        console.log(`[DEBUG] Droppable ${droppableId} - isDraggingOver: ${snapshot.isDraggingOver}`);
        
        return (
          <motion.div
            ref={provided.innerRef}
            {...provided.droppableProps}
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: 'auto',
              transition: { duration: 0.3 }
            }}
            className={`${className} ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-200' : ''}`}
            style={{
              minHeight: vcs.length > 0 ? '140px' : '0', // Increased minimum height
              transition: 'all 0.2s ease',
              padding: snapshot.isDraggingOver ? '12px 8px' : '8px 4px', // Increased padding
              borderRadius: '8px',
              position: 'relative',
              backgroundColor: snapshot.isDraggingOver ? 'rgba(239, 246, 255, 0.8)' : 'transparent',
              marginTop: '16px', // Added more top margin
            }}
            data-droppable-id={droppableId}
            data-is-dragging-over={snapshot.isDraggingOver}
            data-round-id={roundId || 'none'}
          >
            {vcs.map((vcId, vcIndex) => {
              const vc = getVC(vcId);
              if (!vc) {
                console.error(`[DEBUG] VC not found: ${vcId}`);
                return null;
              }
              
              return (
                <VCDraggable 
                  key={vcId} 
                  vcId={vcId} 
                  index={vcIndex} 
                  vc={vc} 
                  roundId={roundId}
                />
              );
            })}
            {provided.placeholder}
            
            {/* Enhanced drop indicator with user-friendly message */}
            {snapshot.isDraggingOver && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-sm text-primary font-semibold text-center py-2 px-4 bg-primary/10 rounded-md shadow-sm border border-primary/30">
                  Drop here to add to {getDropAreaName(droppableId)}
                </div>
              </div>
            )}
          </motion.div>
        );
      }}
    </Droppable>
  );
}
