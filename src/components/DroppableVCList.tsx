
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
}

export function DroppableVCList({ 
  droppableId, 
  vcs, 
  getVC, 
  roundId,
  className = "pl-6 mt-2"
}: DroppableVCListProps) {
  console.log(`Rendering droppable list: ${droppableId} with ${vcs.length} VCs and roundId: ${roundId || 'none'}`);
  
  return (
    <Droppable droppableId={droppableId} type="VC" isDropDisabled={false}>
      {(provided, snapshot) => {
        console.log(`Droppable ${droppableId} - isDraggingOver: ${snapshot.isDraggingOver}`);
        
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
            className={`${className} ${snapshot.isDraggingOver ? 'bg-secondary/30 border-2 border-dashed border-primary/50' : ''}`}
            style={{
              minHeight: '50px',
              transition: 'all 0.2s ease',
              padding: snapshot.isDraggingOver ? '8px 4px' : '4px 0',
              borderRadius: '8px',
            }}
            data-droppable-id={droppableId}
            data-is-dragging-over={snapshot.isDraggingOver}
            data-round-id={roundId || 'none'}
          >
            {vcs.map((vcId, vcIndex) => {
              const vc = getVC(vcId);
              if (!vc) {
                console.error(`VC not found: ${vcId}`);
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
            {snapshot.isDraggingOver && (
              <div className="text-xs text-primary font-semibold text-center py-2 bg-secondary/40 rounded-md">
                Drop here to add VC
              </div>
            )}
          </motion.div>
        );
      }}
    </Droppable>
  );
}
