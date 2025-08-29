import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreatePollPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
        <p className="text-gray-600 mt-2">Design and publish your own poll for the community</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>Fill in the information below to create your poll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title</Label>
            <Input 
              id="title" 
              placeholder="Enter your poll question or title"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input 
              id="description" 
              placeholder="Add more context about your poll"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="options">Poll Options</Label>
            <div className="space-y-2">
              <Input 
                placeholder="Option 1"
                disabled
              />
              <Input 
                placeholder="Option 2"
                disabled
              />
              <Input 
                placeholder="Option 3"
                disabled
              />
            </div>
            <p className="text-sm text-gray-500">Add at least 2 options for your poll</p>
          </div>

          <div className="flex gap-4">
            <Button disabled className="flex-1">
              Create Poll
            </Button>
            <Button variant="outline" disabled>
              Save Draft
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Form functionality will be implemented in the next phase</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
