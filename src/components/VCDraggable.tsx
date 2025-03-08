
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
  const draggableId = roundId 
    ? `${roundId}-${vcId}` 
    : `unsorted-${vcId}`;
    
  return (
    <Draggable 
      key={vcId} 
      draggableId={draggableId} 
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <VCRow 
            vc={vc} 
            roundId={roundId}
          />
        </div>
      )}
    </Draggable>
  );
}
