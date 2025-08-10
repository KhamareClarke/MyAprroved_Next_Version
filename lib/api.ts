import { JobEstimateResponse, LeadFormData } from '@/types';

export const getJobEstimate = async (description: string): Promise<JobEstimateResponse> => {
  const response = await fetch('/api/estimate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    throw new Error('Failed to get estimate');
  }

  return response.json();
};

export const submitLead = async (data: LeadFormData): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit lead');
  }

  return response.json();
};
