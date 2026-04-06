export default function AdminReviewPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Exercise Review Queue</h1>
        <p className="text-muted-foreground">
          Draft exercises awaiting approval will appear here. Content generation pipeline coming in Phase 1.
        </p>
      </div>
    </main>
  );
}
