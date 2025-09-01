'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

interface PollOption {
  id: string;
  text: string;
  order_index: number;
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  allow_multiple_votes: boolean;
  allow_anonymous_votes: boolean;
  expires_at: string | null;
  created_by: string;
  poll_options: PollOption[];
}

export default function EditPollPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    allowMultipleVotes: false,
    allowAnonymousVotes: false,
    expiresAt: '',
    options: ['', '']
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchPoll();
  }, [user, router]);

  const fetchPoll = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(*)
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching poll:', error);
        toast.error('Failed to load poll');
        router.push('/polls');
        return;
      }

      // Check if user owns this poll
      if (data.created_by !== user?.id) {
        toast.error('You can only edit your own polls');
        router.push('/polls');
        return;
      }

      setPoll(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        isPublic: data.is_public,
        allowMultipleVotes: data.allow_multiple_votes,
        allowAnonymousVotes: data.allow_anonymous_votes,
        expiresAt: data.expires_at ? new Date(data.expires_at).toISOString().slice(0, 16) : '',
        options: data.poll_options?.map((opt: PollOption) => opt.text) || ['', '']
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load poll');
      router.push('/polls');
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast.error('Poll must have at least 2 options');
      return;
    }
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poll) return;

    // Validation
    if (!formData.title.trim()) {
      toast.error('Poll title is required');
      return;
    }

    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      toast.error('Poll must have at least 2 options');
      return;
    }

    setSaving(true);

    try {
      // Update poll
      const { error: pollError } = await supabase
        .from('polls')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          is_public: formData.isPublic,
          allow_multiple_votes: formData.allowMultipleVotes,
          allow_anonymous_votes: formData.allowAnonymousVotes,
          expires_at: formData.expiresAt || null,
        })
        .eq('id', poll.id);

      if (pollError) {
        console.error('Error updating poll:', pollError);
        toast.error('Failed to update poll');
        return;
      }

      // Delete existing options
      const { error: deleteError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', poll.id);

      if (deleteError) {
        console.error('Error deleting options:', deleteError);
        toast.error('Failed to update poll options');
        return;
      }

      // Insert new options
      const pollOptions = validOptions.map((text, index) => ({
        poll_id: poll.id,
        text: text.trim(),
        order_index: index,
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(pollOptions);

      if (optionsError) {
        console.error('Error inserting options:', optionsError);
        toast.error('Failed to update poll options');
        return;
      }

      toast.success('Poll updated successfully!');
      router.push(`/polls/${poll.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update poll');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-600">Poll not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href={`/polls/${poll.id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Poll
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Poll</h1>
        <p className="text-gray-600 mt-2">Update your poll settings and options</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Poll Details</CardTitle>
            <CardDescription>
              Update your poll information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your poll question"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide additional context for your poll"
                rows={3}
              />
            </div>

            {/* Poll Options */}
            <div className="space-y-4">
              <Label>Poll Options *</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Poll Settings</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Poll</Label>
                  <p className="text-sm text-gray-500">Anyone can view and vote on this poll</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Multiple Votes</Label>
                  <p className="text-sm text-gray-500">Users can vote for multiple options</p>
                </div>
                <Switch
                  checked={formData.allowMultipleVotes}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowMultipleVotes: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Anonymous Votes</Label>
                  <p className="text-sm text-gray-500">Users can vote without being logged in</p>
                </div>
                <Switch
                  checked={formData.allowAnonymousVotes}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowAnonymousVotes: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
                <p className="text-sm text-gray-500">Leave empty for no expiration</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href={`/polls/${poll.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Poll'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      <Toaster position="top-right" />
    </div>
  );
}
