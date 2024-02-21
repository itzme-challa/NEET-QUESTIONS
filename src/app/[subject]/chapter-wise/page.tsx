import getChapters from "@/utils/getChapters";
import { Card } from "@/components/card";

type Params = { subject: "biology" | "physics" | "chemistry" };

export default async function Home({ params }: { params: Params }) {
  const { subject } = params;
  const chapters = getChapters({ subject });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3">
        {chapters.map((chapter) => {
          return (
            <Card
              key={subject}
              href={`/${subject}/chapter-wise/${chapter.name}`}
              data={chapter}
            />
          );
        })}
      </div>
    </div>
  );
}
