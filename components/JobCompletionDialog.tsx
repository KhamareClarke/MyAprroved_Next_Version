'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, StarOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
  onComplete: (ratings: { [tradespersonId: string]: { rating: number, review: string } }) => void;
  loading?: boolean;
}

export default function JobCompletionDialog({
  open,
  onOpenChange,
  job,
  onComplete,
  loading = false
}: JobCompletionDialogProps) {
  const [ratings, setRatings] = useState<{ [tradespersonId: string]: { rating: number, review: string } }>({});
  const [hoveredRatings, setHoveredRatings] = useState<{ [tradespersonId: string]: number }>({});

  const handleComplete = () => {
    // Check if all accepted tradespeople have ratings
    const acceptedTradespeople = job?.acceptedApplications || [];
    const allRated = acceptedTradespeople.every((app: any) => 
      ratings[app.tradesperson_id]?.rating > 0
    );

    if (!allRated) {
      alert('Please provide a rating for all tradespeople before completing the job');
      return;
    }
    onComplete(ratings);
  };

  const handleStarClick = (tradespersonId: string, starRating: number) => {
    setRatings(prev => ({
      ...prev,
      [tradespersonId]: {
        ...prev[tradespersonId],
        rating: starRating
      }
    }));
  };

  const handleStarHover = (tradespersonId: string, starRating: number) => {
    setHoveredRatings(prev => ({
      ...prev,
      [tradespersonId]: starRating
    }));
  };

  const handleStarLeave = (tradespersonId: string) => {
    setHoveredRatings(prev => ({
      ...prev,
      [tradespersonId]: 0
    }));
  };

  const handleReviewChange = (tradespersonId: string, review: string) => {
    setRatings(prev => ({
      ...prev,
      [tradespersonId]: {
        ...prev[tradespersonId],
        review: review
      }
    }));
  };

  const renderStars = (tradespersonId: string) => {
    const stars = [];
    const currentRating = ratings[tradespersonId]?.rating || 0;
    const displayRating = hoveredRatings[tradespersonId] || currentRating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(tradespersonId, i)}
          onMouseEnter={() => handleStarHover(tradespersonId, i)}
          onMouseLeave={() => handleStarLeave(tradespersonId)}
          className="focus:outline-none"
        >
          {i <= displayRating ? (
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
          ) : (
            <Star className="w-6 h-6 text-gray-300" />
          )}
        </button>
      );
    }
    return stars;
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'Select a rating';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return '';
  };

  const acceptedTradespeople = job?.acceptedApplications || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Job</DialogTitle>
          <DialogDescription>
            Mark this job as completed and provide ratings and reviews for all tradespeople who worked on this job.
          </DialogDescription>
        </DialogHeader>
        
        {job && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Job Details:</h4>
              <p className="text-sm text-gray-600">{job.job_description}</p>
              <p className="text-sm text-gray-600">Trade: {job.trade}</p>
              <p className="text-sm text-gray-600">Location: {job.postcode}</p>
            </div>
            
            {acceptedTradespeople.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tradespeople found for this job.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h4 className="font-semibold">Rate Tradespeople:</h4>
                {acceptedTradespeople.map((application: any) => (
                  <div key={application.tradesperson_id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">
                          {application.tradespeople.first_name} {application.tradespeople.last_name}
                        </h5>
                        <p className="text-sm text-gray-600">{application.tradespeople.trade}</p>
                        <p className="text-sm text-gray-500">{application.tradespeople.years_experience} years experience</p>
                        <p className="text-sm text-gray-500">£{application.quotation_amount} - {application.quotation_notes || 'No notes'}</p>
                      </div>
                      <Badge variant="default">Accepted</Badge>
                    </div>
                    
                    <div>
                      <Label>Rating *</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {renderStars(application.tradesperson_id)}
                      </div>
                      {ratings[application.tradesperson_id]?.rating > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          {getRatingText(ratings[application.tradesperson_id].rating)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Review (Optional)</Label>
                      <Textarea
                        value={ratings[application.tradesperson_id]?.review || ''}
                        onChange={(e) => handleReviewChange(application.tradesperson_id, e.target.value)}
                        placeholder={`Share your experience with ${application.tradespeople.first_name}...`}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={loading || acceptedTradespeople.length === 0 || !acceptedTradespeople.every((app: any) => 
                  ratings[app.tradesperson_id]?.rating > 0
                )}
                className="flex-1"
              >
                {loading ? 'Completing...' : 'Complete Job'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 