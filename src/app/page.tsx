export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <h1 className="text-2xl font-bold">Byteblaze</h1>
        <button className="rounded-xl bg-indigo-600 px-5 py-2 text-white transition hover:bg-indigo-500">
          Join the Waitlist
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="mb-6 text-5xl font-extrabold">
          AI-Powered Onboarding for Software Engineers
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-300">
          Byteblaze helps new engineers onboard faster by letting them query
          your codebase like they would ask a teammate. No more “where is this
          function defined?” — just ask.
        </p>
        <button className="rounded-xl bg-indigo-600 px-8 py-4 text-lg text-white transition hover:bg-indigo-500">
          Get Early Access
        </button>

        <section className="mt-20 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
          {[
            {
              title: "Understand Any Codebase",
              desc: "AI answers code-specific questions to help devs learn architecture and patterns quickly.",
            },
            {
              title: "Boost Autonomy",
              desc: "Reduces the need for constant guidance, freeing up senior devs to focus on building.",
            },
            {
              title: "Faster Ramp-Up",
              desc: "Cut down onboarding time from weeks to days with natural language support.",
            },
          ].map((f, idx) => (
            <div key={idx} className="rounded-xl bg-gray-800 p-6 shadow">
              <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-24 space-x-4 p-6 text-center text-sm text-gray-500">
        <a href="pages/terms" className="hover:underline">
          Terms
        </a>
        <a href="pages/cancellation" className="hover:underline">
          Cancellation and Refund Policy 
        </a>
        <a href="pages/contact" className="hover:underline">
          Contact Us 
        </a>
        <a href="pages/privacy" className="hover:underline">
          Privacy Policy 
        </a>
        <span>
          © {new Date().getFullYear()} Byteblaze. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
