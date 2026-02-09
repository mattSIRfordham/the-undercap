import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function PollWidget() {
  const { isAuthenticated } = useAuth();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVotedLocally, setHasVotedLocally] = useState(false);

  const { data: poll, refetch } = trpc.polls.getActive.useQuery();
  const { data: hasVoted } = trpc.polls.hasVoted.useQuery(
    { pollId: poll?.id || 0 },
    { enabled: !!poll }
  );

  const voteMutation = trpc.polls.vote.useMutation({
    onSuccess: () => {
      toast.success("Vote recorded successfully!");
      setHasVotedLocally(true);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record vote");
    }
  });

  const handleVote = () => {
    if (selectedOption === null || !poll) {
      toast.error("Please select an option");
      return;
    }

    voteMutation.mutate({
      pollId: poll.id,
      optionIndex: selectedOption
    });
  };

  if (!poll) {
    return null;
  }

  const showResults = hasVoted || hasVotedLocally;
  const options = poll.options as string[];
  const voteCounts = poll.voteCounts as number[];
  const totalVotes = poll.totalVotes as number;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Community Poll</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-base">{poll.question}</h3>

        {showResults ? (
          <div className="space-y-3">
            {options.map((option, index) => {
              const votes = voteCounts[index] || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const isSelected = selectedOption === index;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      {option}
                    </span>
                    <span className="text-muted-foreground">
                      {votes.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground text-center pt-2">
              Total votes: {totalVotes.toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => setSelectedOption(parseInt(value))}
            >
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleVote}
              disabled={selectedOption === null || voteMutation.isPending}
              className="w-full"
            >
              {voteMutation.isPending ? "Submitting..." : "Vote"}
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground text-center">
                Your vote is anonymous
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
