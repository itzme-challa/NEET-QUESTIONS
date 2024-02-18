import Link from "next/link";

export default async function Home() {
  const subjects = ['biology', 'chemistry', 'physics']
  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid  gap-3">
        {subjects.map(subject => (
          <Link key={subject} href={subject}>
            <div className="w-full p-4 rounded text text-center font-bold capitalize bg-accent hover:outline hover:outline-slate-400 ">{subject}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
