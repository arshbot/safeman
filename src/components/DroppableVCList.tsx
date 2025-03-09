
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
  console.log(`Rendering droppable list: ${droppableId} with ${vcs.length} VCs`);
  
  return (
    <Droppable droppableId={droppableId} type="VC">
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
          className={className}
          style={{
            background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
            borderRadius: '4px',
            minHeight: '50px',
            transition: 'background-color 0.2s ease',
            padding: snapshot.isDraggingOver ? '8px 4px' : '4px 0'
          }}
          data-droppable-id={droppableId}
          data-is-dragging-over={snapshot.isDraggingOver}
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
            <div className="text-xs text-muted-foreground text-center py-1">
              Drop here
            </div>
          )}
        </motion.div>
      )}
    </Droppable>
  );
}
