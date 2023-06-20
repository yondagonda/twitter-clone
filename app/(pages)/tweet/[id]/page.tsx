export default function TweetPage({ params }: any) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      This is the page for Tweet: {params.id}
    </main>
  );
}
