export default function UserPage({ params }: any) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      This is the user page for {params.id}
    </main>
  );
}
