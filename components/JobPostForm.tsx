'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase-client';

interface JobPostFormProps {
  onJobPosted?: () => void;
}

export default function JobPostForm({ onJobPosted }: JobPostFormProps) {
  const [formData, setFormData] = useState({
    trade: '',
    jobDescription: '',
    postcode: '',
    budget: '',
    budgetType: 'fixed',
    preferredDate: '',
    preferredTime: 'any',
    images: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');



  const tradeOptions = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting & Decorating',
    'Roofing',
    'Heating & Ventilation',
    'Garden & Landscaping',
    'Cleaning',
    'Carpet & Flooring',
    'Kitchen & Bathroom',
    'General Handyman',
    'Other'
  ];

  const budgetTypeOptions = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  const timeOptions = [
    { value: 'any', label: 'Any Time' },
    { value: 'morning', label: 'Morning (8AM-12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM-5PM)' },
    { value: 'evening', label: 'Evening (5PM-8PM)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsSubmitting(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `job-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-images')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('job-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Get user email from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('You must be logged in to post a job');
      }

      const user = JSON.parse(userData);
      const clientEmail = user.email;

      // Create job posting via API
      const response = await fetch('/api/jobs/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail,
          trade: formData.trade,
          jobDescription: formData.jobDescription,
          postcode: formData.postcode,
          budget: formData.budget,
          budgetType: formData.budgetType,
          images: formData.images,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post job');
      }

      setSuccess('Job posted successfully!');
      
      // Reset form
      setFormData({
        trade: '',
        jobDescription: '',
        postcode: '',
        budget: '',
        budgetType: 'fixed',
        preferredDate: '',
        preferredTime: 'any',
        images: []
      });

      // Call callback if provided
      if (onJobPosted) {
        onJobPosted();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>
          Fill in the details below to post your job and find the right tradesperson
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="trade">Trade Required *</Label>
            <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trade" />
              </SelectTrigger>
              <SelectContent>
                {tradeOptions.map((trade) => (
                  <SelectItem key={trade} value={trade}>
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Describe the work you need done in detail..."
              value={formData.jobDescription}
              onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode *</Label>
            <Input
              id="postcode"
              type="text"
              placeholder="e.g., SW1A 1AA"
              value={formData.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 500"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetType">Budget Type</Label>
              <Select value={formData.budgetType} onValueChange={(value) => handleInputChange('budgetType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images (Optional)</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Upload images to help tradespeople understand the job better
            </p>
          </div>

          {formData.images.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Images</Label>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Job image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Posting Job...' : 'Post Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 