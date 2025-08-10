'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_type: string;
  project_description: string;
  location: string;
  timeframe: string;
  budget_range: string;
  status: string;
  admin_approved: boolean;
  tradesperson_quoted: boolean;
  client_approved: boolean;
  created_at: string;
  tradespersonName: string;
  tradespersonTrade: string;
  latestQuoteAmount?: number | null;
  latestQuoteDescription?: string | null;
  latestQuoteId?: string | null;
}

interface ClientQuoteRequestsProps {
  clientEmail: string;
  clientId?: string;
}

export default function ClientQuoteRequests({ clientEmail, clientId }: ClientQuoteRequestsProps) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (clientEmail) {
      fetchQuoteRequests();
    }
  }, [clientEmail]);

  const fetchQuoteRequests = async () => {
    try {
      const response = await fetch(`/api/client/quote-requests?email=${encodeURIComponent(clientEmail)}&ts=${Date.now()}`, { cache: 'no-store' } as RequestInit);
      const data = await response.json();

      if (data.success) {
        setQuoteRequests(data.quoteRequests);
      } else {
        setError('Failed to fetch quote requests');
      }
    } catch (err) {
      setError('Error fetching quote requests');
    } finally {
      setLoading(false);
    }
  };

  const approveOrReject = async (quoteId: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await fetch('/api/client/approve-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action, clientId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Failed to ${action} quote`);
      } else {
        if (action === 'approve') {
          setSuccessMsg('Approved. Chat is now enabled with the tradesperson.');
        } else {
          setSuccessMsg('Quote rejected.');
        }
        await fetchQuoteRequests();
      }
    } catch (e) {
      setError(`Error trying to ${action} quote`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const getStatusBadge = (request: QuoteRequest) => {
    if (request.admin_approved === false && request.status === 'admin_rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    } else if (request.admin_approved === true && !request.tradesperson_quoted) {
      return <Badge variant="default">Approved - Awaiting Quote</Badge>;
    } else if (request.tradesperson_quoted && !request.client_approved) {
      return <Badge variant="secondary">Quote Received</Badge>;
    } else if (request.client_approved) {
      return <Badge variant="default">Approved by You</Badge>;
    } else {
      return <Badge variant="outline">Pending Admin Review</Badge>;
    }
  };

  const getStatusMessage = (request: QuoteRequest) => {
    if (request.admin_approved === false && request.status === 'admin_rejected') {
      return "Your quote request was not approved. You can submit a new request or contact us for assistance.";
    } else if (request.admin_approved === true && !request.tradesperson_quoted) {
      return `${request.tradespersonName} has been notified and will provide a quote within 24-48 hours.`;
    } else if (request.tradesperson_quoted && !request.client_approved) {
      return "A quote has been provided. Please review and approve or reject the quote.";
    } else if (request.client_approved) {
      return "You have approved this quote. The tradesperson will contact you to arrange the work.";
    } else {
      return "Your quote request is being reviewed by our admin team.";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Quote Requests</h2>
        <button 
          onClick={fetchQuoteRequests}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {quoteRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quote requests found</p>
            <p className="text-sm text-gray-500 mt-2">
              Start by requesting a quote from a tradesperson
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {quoteRequests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Quote Request for {request.project_type || 'Project'}
                  </CardTitle>
                  {getStatusBadge(request)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Project Details</h4>
                    <p><strong>Type:</strong> {request.project_type || 'Not specified'}</p>
                    <p><strong>Location:</strong> {request.location}</p>
                    <p><strong>Timeframe:</strong> {request.timeframe || 'Not specified'}</p>
                    <p><strong>Budget:</strong> {request.budget_range || 'Not specified'}</p>
                    <p><strong>Description:</strong></p>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{request.project_description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Tradesperson</h4>
                    <p><strong>Name:</strong> {request.tradespersonName}</p>
                    <p><strong>Trade:</strong> {request.tradespersonTrade}</p>
                    {request.latestQuoteAmount != null && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800"><strong>Quote Amount:</strong> £{request.latestQuoteAmount}</p>
                        {request.latestQuoteDescription && (
                          <p className="text-xs text-green-700 mt-1">{request.latestQuoteDescription}</p>
                        )}
                        {!request.client_approved && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => request.latestQuoteId && approveOrReject(request.latestQuoteId, 'approve')}
                              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => request.latestQuoteId && approveOrReject(request.latestQuoteId, 'reject')}
                              className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{getStatusMessage(request)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Requested on {formatDate(request.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 