
import { VC } from "@/types";
import { Draggable } from "react-beautiful-dnd";
import { VCRow } from "./VCRow";

interface VCDraggableProps {
  vcId: string;
  index: number;
  vc: VC;
  roundId?: string;
}

export function VCDraggable({ vcId, index, vc, roundId }: VCDraggableProps) {
  // Generate a consistent draggableId that works both for round VCs and unsorted VCs
  // The format is: either "round-{roundId}-{vcId}" or "unsorted-{vcId}"
  const draggableId = roundId 
    ? `round-${roundId}-${vcId}` 
    : `unsorted-${vcId}`;
  
  console.log(`Rendering draggable: ${draggableId}, in container: ${roundId || 'unsorted'}, index: ${index}, vcId: ${vcId}`);
    
  return (
    <Draggable 
      draggableId={draggableId} 
      index={index}
    >
      {(provided, snapshot) => {
        console.log(`Draggable state for ${draggableId}: isDragging=${snapshot.isDragging}`);
        
        if (snapshot.isDragging) {
          console.log(`Currently dragging: ${draggableId}, vcId: ${vcId}, roundId: ${roundId || 'unsorted'}`);
        }
        
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
              ${snapshot.isDragging ? 'opacity-80 shadow-xl scale-[1.02] z-50 bg-background' : 'opacity-100'} 
              transition-all duration-150 mb-3
            `}
            data-vc-id={vcId}
            data-round-id={roundId || 'unsorted'}
            data-draggable-id={draggableId}
            data-is-dragging={snapshot.isDragging}
          >
            <VCRow 
              vc={vc} 
              roundId={roundId}
            />
          </div>
        );
      }}
    </Draggable>
  );
}
