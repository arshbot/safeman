
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
  if (vcs.length === 0) return null;
  
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
            background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent',
            borderRadius: '4px',
            minHeight: '50px',
            transition: 'background-color 0.2s ease'
          }}
        >
          {vcs.map((vcId, vcIndex) => {
            const vc = getVC(vcId);
            if (!vc) return null;
            
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
        </motion.div>
      )}
    </Droppable>
  );
}
