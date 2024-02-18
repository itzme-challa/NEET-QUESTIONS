import Link from "next/link";
import getTopics from "@/utils/getTopics";
import getChapters from "@/utils/getChapters";

type Params = { subject: "biology" | "physics" | "chemistry"; chapter: string };

// export const dynamicParams = false;
// export async function generateStaticParams({ params }: { params: Params }) {
//   const { subject, chapter } = params;
//   const chapters = getChapters({ subject });
//   return chapters.map((chapter) => {
//     return {
//       subject: "biology",
//       chapter: chapter.name,
//     };
//   });
// }

export default async function Home({ params }: { params: Params }) {
  const { subject, chapter } = params;
  const topics = getTopics({ subject, chapter });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3">
      {topics.map(({ name, total }) => {
        return (
          <Link key={name} href={`/${subject}/${chapter}/${name}`}>
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
