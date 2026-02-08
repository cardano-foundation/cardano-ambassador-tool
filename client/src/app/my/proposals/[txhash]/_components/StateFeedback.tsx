import Link from "next/link";
import Button from "@/components/atoms/Button";
import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";

interface StateFeedbackProps {
  type: "not-found" | "access-denied" | "loading";
  txhash?: string;
}

export const StateFeedback = ({ type, txhash }: StateFeedbackProps) => {
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
            The proposal with hash {txhash} could not be found.
          </Paragraph>
          <Button variant="primary" onClick={() => window.history.back()}>
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
        <Button variant="primary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
};
