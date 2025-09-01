'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthProvider';

interface CreatePollFormData {
  title: string;
  description: string;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  allowAnonymousVotes: boolean;
  expiresAt: string;
  options: string[];
}

export default function CreatePollForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePollFormData>({
    title: '',
    description: '',
    isPublic: true,
    allowMultipleVotes: false,
    allowAnonymousVotes: true,
    expiresAt: '',
    options: ['', '']
  });

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Poll title is required');
      return;
    }

    const validOptions = formData.options.filter(option => option.trim().length > 0);
    if (validOptions.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is logged in
      if (!user) {
        toast.error('You must be logged in to create a poll');
        return;
      }

      // Create the poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          is_public: formData.isPublic,
          allow_multiple_votes: formData.allowMultipleVotes,
          allow_anonymous_votes: formData.allowAnonymousVotes,
          expires_at: formData.expiresAt || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (pollError) {
        console.error('Error creating poll:', pollError);
        toast.error('Failed to create poll');
        return;
      }

      // Create poll options
      const pollOptions = validOptions.map((text, index) => ({
        poll_id: poll.id,
        text: text.trim(),
        order_index: index,
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(pollOptions);

      if (optionsError) {
        console.error('Error creating options:', optionsError);
        toast.error('Failed to create poll options');
        return;
      }

      toast.success('Poll created successfully!');
      router.push('/polls');
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>Fill in the information below to create your poll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input 
              id="title" 
              placeholder="Enter your poll question or title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              maxLength={200}
            />
            <p className="text-sm text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Add more context about your poll"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={1000}
              rows={3}
            />
            <p className="text-sm text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Poll Options */}
          <div className="space-y-2">
            <Label>Poll Options *</Label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                    maxLength={200}
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {formData.options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
            <p className="text-sm text-gray-500">
              Add at least 2 options (max 10)
            </p>
          </div>

          {/* Poll Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Poll Settings</Label>
            
            {/* Public/Private */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Public Poll</Label>
                <p className="text-sm text-gray-500">
                  Anyone can view and vote on this poll
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>

            {/* Multiple Votes */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowMultipleVotes">Allow Multiple Votes</Label>
                <p className="text-sm text-gray-500">
                  Users can vote for multiple options
                </p>
              </div>
              <Switch
                id="allowMultipleVotes"
                checked={formData.allowMultipleVotes}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowMultipleVotes: checked }))}
              />
            </div>

            {/* Anonymous Votes */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowAnonymousVotes">Allow Anonymous Votes</Label>
                <p className="text-sm text-gray-500">
                  Users can vote without logging in
                </p>
              </div>
              <Switch
                id="allowAnonymousVotes"
                checked={formData.allowAnonymousVotes}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowAnonymousVotes: checked }))}
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-sm text-gray-500">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Poll'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
