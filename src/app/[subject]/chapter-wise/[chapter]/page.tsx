import getTopics from "@/utils/getTopics";
import getChapters from "@/utils/getChapters";
import { Card } from "@/components/card";

type Params = { subject: "biology" | "physics" | "chemistry"; chapter: string };

export const dynamicParams = false;
export async function generateStaticParams() {
  const subjects = ["biology", "chemistry", "physics"] as const;

  const routes: Params[] = [];
  subjects.forEach((subject) => {
    const chapters = getChapters({ subject });
    chapters.forEach((chapter) =>
      routes.push({
        subject,
        chapter: encodeURIComponent(chapter.name),
      })
    );
  });
  return routes;
}

export default async function Home({ params }: { params: Params }) {
  const { subject, chapter } = params;
  const topics = getTopics({ subject, chapter });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3 md:grid-2 xl:grid-3">
        {topics.map((topic) => {
          return (
            <Card
              key={topic.name}
              href={`/${subject}/chapter-wise/${chapter}/${topic.name}`}
              data={topic}
            />
          );
        })}
      </div>
    </div>
  );
}
