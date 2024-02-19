import getTopics from "@/utils/getTopics";
import getChapters from "@/utils/getChapters";
import getParts from "@/utils/getParts";
import getQuestions from "@/utils/getQuestions";
import { Questions } from "@/components/questions";
import { auth } from "@/lib/auth";

type Params = {
  subject: "biology" | "physics" | "chemistry";
  chapter: string;
  topic: string;
  part: string;
};

export const dynamicParams = false;
export async function generateStaticParams() {
  const subjects = ['biology', 'chemistry', 'physics'] as const
  
  const routes:Params[] = []
  subjects.forEach(subject => {
    const chapters = getChapters({ subject });
    chapters.forEach(chapter => {
      const topics = getTopics({subject, chapter: chapter.name})
      topics.forEach(topic => {
        const parts = getParts({subject,chapter: chapter.name, topic: topic.name })
        parts.forEach(part => routes.push({
          subject,
          chapter: encodeURIComponent(chapter.name),
          topic: encodeURIComponent(topic.name),
          part: encodeURIComponent(part.name)
        }))
      })
    })
  })  
  return routes
}

export default async function Home({ params }: { params: Params }) {
  const sesion = await auth();
  const { subject, chapter, topic, part } = params;
  const questions = getQuestions({ subject, chapter, topic, part });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      {sesion?.user ? (
        <Questions questions={questions} />
      ) : (
        <center className="text-lg">First signin to get the access</center>
      )}
    </div>
  );
}
