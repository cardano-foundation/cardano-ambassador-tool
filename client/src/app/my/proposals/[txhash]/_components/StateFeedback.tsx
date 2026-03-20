"use client";

import Button from "../../../../../components/atoms/Button";
import Paragraph from "../../../../../components/atoms/Paragraph";
import Title from "../../../../../components/atoms/Title";
import { useRouter } from "next/navigation";

interface StateFeedbackProps {
  type: "not-found" | "access-denied" | "loading";
  txHash?: string;
}

export const StateFeedback = ({ type, txHash }: StateFeedbackProps) => {
  const router = useRouter();
  if (type === "loading") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base"></div>
      </div>
    );
  }

  if (type === "not-found") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Proposal Not Found
          </Title>
          <Paragraph className="text-muted-foreground mb-4">
            The proposal with hash {txHash} could not be found.
          </Paragraph>
          <Button variant="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Title level="3" className="text-foreground mb-2">
          Access Denied
        </Title>
        <Paragraph className="text-muted-foreground mb-4">
          You can only view and edit your own proposals.
        </Paragraph>
        <Button variant="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
};
