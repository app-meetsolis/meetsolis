export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to MeetSolis
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Professional video conferencing platform for freelancers and small agencies
        </p>
        <div className="text-center">
          <a
            href="/admin/services"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View Service Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}