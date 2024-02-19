import Link from "next/link";
import getTopics from "@/utils/getTopics";
import getChapters from "@/utils/getChapters";
import getParts from "@/utils/getParts";

type Params = { subject: "biology" | "physics" | "chemistry"; chapter: string; topic: string };

export const dynamicParams = false;
export async function generateStaticParams() {
  const subjects = ['biology', 'chemistry', 'physics'] as const
  
  const routes:Params[] = []
  subjects.forEach(subject => {
    const chapters = getChapters({ subject });
    chapters.forEach(chapter => {
      const topics = getTopics({subject, chapter: chapter.name})
      topics.forEach(topic => routes.push({
        subject,
        chapter: encodeURIComponent(chapter.name),
        topic: encodeURIComponent(topic.name),
      }))
    })
  })  
  return routes
}

export default async function Home({ params }: { params: Params }) {
  const { subject, chapter, topic } = params;
  const parts = getParts({ subject, chapter, topic });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3">
      {parts.map(({ name, total }) => {
        return (
          <Link key={name} href={`/${subject}/chapter-wise/${chapter}/${topic}/${name}`}>
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
