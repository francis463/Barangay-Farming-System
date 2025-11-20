import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Progress } from "./ui/progress";
import { MessageSquare, ThumbsUp, Send, Edit2, Trash2, Shield, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { feedbacksApi, pollsApi } from "../utils/api";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

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
  isAdmin?: boolean;
}

export function CommunityEngagement({ polls, feedbacks, onDataUpdate, isAdmin = false }: CommunityEngagementProps) {
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedPollOption, setSelectedPollOption] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  
  // Admin edit/delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'poll' | 'feedback'; id: string } | null>(null);
  const [editPollDialogOpen, setEditPollDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [editPollQuestion, setEditPollQuestion] = useState("");
  const [editFeedbackDialogOpen, setEditFeedbackDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editFeedbackMessage, setEditFeedbackMessage] = useState("");
  
  // Create new poll states
  const [createPollDialogOpen, setCreatePollDialogOpen] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState<string[]>(["", ""]);
  const [newPollEndDate, setNewPollEndDate] = useState<Date | undefined>(undefined);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

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

  // Admin: Edit poll
  const handleEditPoll = (poll: Poll) => {
    setEditingPoll(poll);
    setEditPollQuestion(poll.question);
    setEditPollDialogOpen(true);
  };

  const handleSaveEditedPoll = async () => {
    if (!editingPoll || !editPollQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      await pollsApi.update(editingPoll.id, {
        ...editingPoll,
        question: editPollQuestion
      });

      toast.success("Poll updated successfully!");
      setEditPollDialogOpen(false);
      setEditingPoll(null);
      setEditPollQuestion("");

      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error("Error updating poll:", error);
      toast.error("Failed to update poll");
    }
  };

  // Admin: Delete poll or feedback
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'poll') {
        await pollsApi.delete(itemToDelete.id);
        toast.success("Poll deleted successfully!");
      } else {
        await feedbacksApi.delete(itemToDelete.id);
        toast.success("Feedback deleted successfully!");
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);

      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  // Admin: Edit feedback
  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setEditFeedbackMessage(feedback.message);
    setEditFeedbackDialogOpen(true);
  };

  const handleSaveEditedFeedback = async () => {
    if (!editingFeedback || !editFeedbackMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await feedbacksApi.update(editingFeedback.id, {
        ...editingFeedback,
        message: editFeedbackMessage
      });

      toast.success("Feedback updated successfully!");
      setEditFeedbackDialogOpen(false);
      setEditingFeedback(null);
      setEditFeedbackMessage("");

      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback");
    }
  };

  // Admin: Create new poll
  const handleAddPollOption = () => {
    setNewPollOptions([...newPollOptions, ""]);
  };

  const handleRemovePollOption = (index: number) => {
    if (newPollOptions.length > 2) {
      const updated = newPollOptions.filter((_, i) => i !== index);
      setNewPollOptions(updated);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  const handleCreatePoll = async () => {
    // Validation
    if (!newPollQuestion.trim()) {
      toast.error("Please enter a poll question");
      return;
    }

    const validOptions = newPollOptions.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 poll options");
      return;
    }

    if (!newPollEndDate) {
      toast.error("Please select an end date");
      return;
    }

    setIsCreatingPoll(true);

    try {
      // Create poll object
      const newPoll = {
        id: `poll-${Date.now()}`,
        question: newPollQuestion.trim(),
        options: validOptions.map((text, index) => ({
          id: `option-${Date.now()}-${index}`,
          text: text.trim(),
          votes: 0
        })),
        totalVotes: 0,
        endsAt: newPollEndDate.toISOString()
      };

      await pollsApi.create(newPoll);

      toast.success("Poll created successfully!");
      
      // Reset form
      setNewPollQuestion("");
      setNewPollOptions(["", ""]);
      setNewPollEndDate(undefined);
      setCreatePollDialogOpen(false);

      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
    } finally {
      setIsCreatingPoll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Polls */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Community Polls
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Shield className="h-3 w-3" />
                    Admin: Can Edit/Delete
                  </span>
                )}
              </CardTitle>
              <CardDescription>Vote on what we should plant next</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setCreatePollDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New Poll
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {polls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ThumbsUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active polls at the moment. Check back soon!</p>
            </div>
          ) : (
            polls.map((poll) => (
            <div key={poll.id} className="space-y-4 border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="mb-2">{poll.question}</h4>
                  <p className="text-sm text-muted-foreground">
                    {poll.totalVotes} votes • Ends {new Date(poll.endsAt).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPoll(poll)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setItemToDelete({ type: 'poll', id: poll.id });
                        setDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
          ))
          )}
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
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Community Feedback
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Shield className="h-3 w-3" />
                    Admin: Can Edit/Delete
                  </span>
                )}
              </CardTitle>
              <CardDescription>What our community members are saying</CardDescription>
            </div>
          </div>
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(feedback.date).toLocaleDateString()}
                          </span>
                          {isAdmin && (
                            <>
                              <Shield className="h-3 w-3 text-amber-500" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFeedback(feedback)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setItemToDelete({ type: 'feedback', id: feedback.id });
                                  setDeleteDialogOpen(true);
                                }}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {itemToDelete?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Poll Dialog */}
      <Dialog open={editPollDialogOpen} onOpenChange={setEditPollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Poll Question</DialogTitle>
            <DialogDescription>
              Update the poll question. Vote counts will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-poll-question">Poll Question</Label>
              <Input
                id="edit-poll-question"
                value={editPollQuestion}
                onChange={(e) => setEditPollQuestion(e.target.value)}
                placeholder="Enter poll question"
              />
            </div>
            {editingPoll && (
              <div className="space-y-2">
                <Label>Current Options (cannot be edited)</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  {editingPoll.options.map((option) => (
                    <div key={option.id}>• {option.text} ({option.votes} votes)</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPollDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedPoll}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Feedback Dialog */}
      <Dialog open={editFeedbackDialogOpen} onOpenChange={setEditFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>
              Update the feedback message. The name and date will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-feedback-message">Feedback Message</Label>
              <Textarea
                id="edit-feedback-message"
                value={editFeedbackMessage}
                onChange={(e) => setEditFeedbackMessage(e.target.value)}
                placeholder="Enter feedback message"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedFeedback}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Poll Dialog */}
      <Dialog open={createPollDialogOpen} onOpenChange={setCreatePollDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Community Poll</DialogTitle>
            <DialogDescription>
              Create a poll for the community to vote on. Add at least 2 options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Poll Question */}
            <div className="space-y-2">
              <Label htmlFor="new-poll-question">Poll Question</Label>
              <Input
                id="new-poll-question"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                placeholder="E.g., What should we plant this season?"
              />
            </div>

            {/* Poll Options */}
            <div className="space-y-2">
              <Label>Poll Options (minimum 2)</Label>
              <div className="space-y-2">
                {newPollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {newPollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePollOption(index)}
                        className="h-9 w-9 p-0 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPollOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    {newPollEndDate ? (
                      format(newPollEndDate, "PPP")
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newPollEndDate}
                    onSelect={setNewPollEndDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePollDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePoll} disabled={isCreatingPoll}>
              {isCreatingPoll ? "Creating..." : "Create Poll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
