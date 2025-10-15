import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Progress } from "./ui/progress";
import { MessageSquare, ThumbsUp, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { feedbacksApi, pollsApi } from "../utils/api";

export interface Poll {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; votes: number }>;
  totalVotes: number;
  endsAt: string;
}

export interface Feedback {
  id: string;
  name: string;
  message: string;
  date: string;
  category: string;
}

interface CommunityEngagementProps {
  polls: Poll[];
  feedbacks: Feedback[];
  onDataUpdate?: () => void;
}

export function CommunityEngagement({ polls, feedbacks, onDataUpdate }: CommunityEngagementProps) {
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedPollOption, setSelectedPollOption] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackMessage) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      await feedbacksApi.create({
        name: feedbackName,
        message: feedbackMessage,
        date: new Date().toISOString(),
        category: "General"
      });

      toast.success("Thank you for your feedback!");
      setFeedbackName("");
      setFeedbackMessage("");

      // Refresh data
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleVote = async (pollId: string) => {
    if (!selectedPollOption) {
      toast.error("Please select an option");
      return;
    }

    setIsVoting(true);

    try {
      // Find the poll and option
      const poll = polls.find(p => p.id === pollId);
      if (!poll) {
        toast.error("Poll not found");
        return;
      }

      // Update the poll with the new vote
      const updatedOptions = poll.options.map(option => {
        if (option.id === selectedPollOption) {
          return { ...option, votes: option.votes + 1 };
        }
        return option;
      });

      const updatedPoll = {
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + 1
      };

      await pollsApi.update(pollId, updatedPoll);

      toast.success("Your vote has been recorded!");
      setSelectedPollOption("");

      // Refresh data
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Polls */}
      <Card>
        <CardHeader>
          <CardTitle>Community Polls</CardTitle>
          <CardDescription>Vote on what we should plant next</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {polls.map((poll) => (
            <div key={poll.id} className="space-y-4">
              <div>
                <h4 className="mb-2">{poll.question}</h4>
                <p className="text-sm text-muted-foreground">
                  {poll.totalVotes} votes • Ends {new Date(poll.endsAt).toLocaleDateString()}
                </p>
              </div>

              <RadioGroup value={selectedPollOption} onValueChange={setSelectedPollOption}>
                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes > 0 
                      ? (option.votes / poll.totalVotes) * 100 
                      : 0;
                    
                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            {option.votes} votes ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>

              <Button 
                onClick={() => handleVote(poll.id)} 
                className="w-full"
                disabled={isVoting || !selectedPollOption}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {isVoting ? "Submitting..." : "Submit Vote"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback or Suggestion</CardTitle>
          <CardDescription>Help us improve the community garden</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Share your thoughts, suggestions, or feedback..."
                rows={4}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmittingFeedback || !feedbackName || !feedbackMessage}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Community Feedback</CardTitle>
          <CardDescription>What our community members are saying</CardDescription>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No feedback yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4>{feedback.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(feedback.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{feedback.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
