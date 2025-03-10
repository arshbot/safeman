
import { useState } from "react";
import { resetServerContext } from "react-beautiful-dnd";
import { useCRM } from "@/context/CRMContext";
import { PageHeader } from "@/components/PageHeader";
import { RoundsList } from "@/components/RoundsList";
import { EmptyRoundsPrompt } from "@/components/EmptyRoundsPrompt";
import { UnsortedVCSection } from "@/components/UnsortedVCSection";
import { useVCSorting } from "@/hooks/useVCSorting";
import { useDragEndHandler } from "@/hooks/useDragEndHandler";
import { DnDProvider } from "@/context/DnDContext";

// Reset server context for SSR compatibility
resetServerContext();

const Index = () => {
  const { state, getRoundSummary } = useCRM();
  const [selectedRoundId, setSelectedRoundId] = useState<string | undefined>(undefined);
  const { sortVCsByStatus } = useVCSorting();
  const { handleDragEnd } = useDragEndHandler();

  const handleAddVCToRound = (roundId: string) => {
    setSelectedRoundId(roundId);
  };

  // Sort unsorted VCs by status
  const sortedUnsortedVCs = sortVCsByStatus(state.unsortedVCs);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader onAddVC={() => setSelectedRoundId(undefined)} />
      
      <DnDProvider onDragEnd={handleDragEnd}>
        {state.rounds.length > 0 ? (
          <>
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Funding Rounds</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop to reorder rounds or move VCs between rounds.
              </p>
            </div>

            <RoundsList
              rounds={state.rounds}
              getRoundSummary={getRoundSummary}
              onAddVC={handleAddVCToRound}
              getVC={(id) => state.vcs[id]}
              sortVCsByStatus={sortVCsByStatus}
            />
          </>
        ) : (
          <EmptyRoundsPrompt />
        )}

        <UnsortedVCSection 
          vcs={sortedUnsortedVCs}
          getVC={(id) => state.vcs[id]}
        />
      </DnDProvider>
    </div>
  );
};

export default Index;
