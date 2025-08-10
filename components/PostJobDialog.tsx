'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostJobDialogProps {
  onJobPosted: () => void;
}

const TRADES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Roofing',
  'HVAC',
  'Landscaping',
  'Cleaning',
  'Moving',
  'Other'
];

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'negotiable', label: 'Negotiable' }
];

export default function PostJobDialog({ onJobPosted }: PostJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    trade: '',
    job_description: '',
    postcode: '',
    budget: '',
    budget_type: 'fixed',
    preferred_date: '',
    images: [] as File[]
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered:', event.target.files);
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    setSelectedFiles(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trade || !formData.job_description || !formData.postcode || !formData.budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not logged in');
      }
      const user = JSON.parse(userData);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('trade', formData.trade);
      submitData.append('job_description', formData.job_description);
      submitData.append('postcode', formData.postcode);
      submitData.append('budget', formData.budget);
      submitData.append('budget_type', formData.budget_type);
      submitData.append('preferred_date', formData.preferred_date);
      submitData.append('client_id', user.id);

      // Append images
      formData.images.forEach((file, index) => {
        submitData.append(`images`, file);
      });

      const response = await fetch('/api/jobs/post', {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Job Posted Successfully!",
          description: "Your job has been posted and is pending admin approval.",
        });
        
        // Reset form
        setFormData({
          trade: '',
          job_description: '',
          postcode: '',
          budget: '',
          budget_type: 'fixed',
          preferred_date: '',
          images: []
        });
        setSelectedFiles([]);
        setOpen(false);
        
        // Notify parent component
        onJobPosted();
      } else {
        throw new Error(data.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trade Selection */}
          <div className="space-y-2">
            <Label htmlFor="trade">Trade *</Label>
            <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trade" />
              </SelectTrigger>
              <SelectContent>
                {TRADES.map((trade) => (
                  <SelectItem key={trade} value={trade}>
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description *</Label>
            <Textarea
              id="job_description"
              placeholder="Describe the work you need done..."
              value={formData.job_description}
              onChange={(e) => handleInputChange('job_description', e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Location and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postal Code *</Label>
              <Input
                id="postcode"
                placeholder="Enter your postal code"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Enter your postal code for job location
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget *</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 500"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Budget Type and Preferred Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_type">Budget Type</Label>
              <Select value={formData.budget_type} onValueChange={(value) => handleInputChange('budget_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_date">Preferred Date</Label>
              <Input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => handleInputChange('preferred_date', e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Job Images (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload images to help tradespeople understand the job
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  ref={(input) => {
                    // Store reference to input element
                    if (input) {
                      (window as any).fileInputRef = input;
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    console.log('Button clicked, triggering file input...');
                    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    } else {
                      console.error('File input not found!');
                    }
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </div>
            
            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Images ({selectedFiles.length}):</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-2">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {file.name}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 