import getTopics from "@/utils/getTopics";
import getChapters from "@/utils/getChapters";
import getParts from "@/utils/getParts";
import { Card } from "@/components/card";

type Params = {
  subject: "biology" | "physics" | "chemistry";
  chapter: string;
  topic: string;
};

export const dynamicParams = false;
export async function generateStaticParams() {
  const subjects = ["biology", "chemistry", "physics"] as const;

  const routes: Params[] = [];
  subjects.forEach((subject) => {
    const chapters = getChapters({ subject });
    chapters.forEach((chapter) => {
      const topics = getTopics({ subject, chapter: chapter.name });
      topics.forEach((topic) =>
        routes.push({
          subject,
          chapter: encodeURIComponent(chapter.name),
          topic: encodeURIComponent(topic.name),
        })
      );
    });
  });
  return routes;
}

export default async function Home({ params }: { params: Params }) {
  const { subject, chapter, topic } = params;
  const parts = getParts({ subject, chapter, topic });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3">
        {parts.map((part) => {
          return (
            <Card
              key={part.name}
              href={`/${subject}/chapter-wise/${chapter}/${topic}/${part.name}`}
              data={part}
            />
          );
        })}
      </div>
    </div>
  );
}
