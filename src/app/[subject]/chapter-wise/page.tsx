import Link from "next/link";
import getChapters from "@/utils/getChapters";

type Params = { subject: "biology" | "physics" | "chemistry" };

export default async function Home({ params }: { params: Params }) {
  const { subject } = params;
  const chapters = getChapters({ subject });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3">
        {chapters.map(({ name, total }) => {
          return (
            <Link key={subject} href={`/${subject}/chapter-wise/${name}`}>
              <div className="w-full space-y-2 p-4 rounded capitalize bg-accent hover:outline hover:outline-slate-400 ">
                <p className="text-lg">{name}</p>
                <p className="text-sm">Total: {total}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
