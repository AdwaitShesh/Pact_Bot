"use client";

import ContractResults from "./_components/contract-results";

interface IContractResultsProps {
  params: { id: string };
}

export default function ContractPage({
  params: { id },
}: IContractResultsProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ContractResults contractId={id} />
    </div>
  );
}
