import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PollDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Poll Details</h1>
        <p className="text-gray-600 mt-2">Poll ID: {params.id}</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Sample Poll Question</CardTitle>
          <CardDescription>This is a placeholder for the actual poll content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Poll Options:</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Option 1</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">0 votes</span>
                    <Button size="sm" disabled>Vote</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Option 2</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">0 votes</span>
                    <Button size="sm" disabled>Vote</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Option 3</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">0 votes</span>
                    <Button size="sm" disabled>Vote</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Voting functionality and real-time results will be implemented in the next phase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
