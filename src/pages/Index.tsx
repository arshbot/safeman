
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
import { EquityGraph } from "@/components/EquityGraph";

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
      
      {/* Equity Graph Component */}
      <EquityGraph />

      <DnDProvider onDragEnd={handleDragEnd}>
        {state.rounds.length > 0 ? (
          <RoundsList
            rounds={state.rounds}
            getRoundSummary={getRoundSummary}
            onAddVC={handleAddVCToRound}
            getVC={(id) => state.vcs[id]}
            sortVCsByStatus={sortVCsByStatus}
          />
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
