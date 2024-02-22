import getPages from "@/utils/getPages";
import { Card } from "@/components/card";

type Params = {
  subject: "biology" | "physics" | "chemistry";
  classYear: string;
};

export const dynamicParams = false;
export async function generateStaticParams() {
  const subjects = ["biology", "chemistry", "physics"] as const;
  const classYears = ["11-22", "11-23", "12-22", "12-23"];
  const routes: Params[] = [];
  subjects.forEach((subject) => {
    classYears.forEach((classYear) =>
      routes.push({
        subject,
        classYear,
      })
    );
  });
  return routes;
}

export default async function Home({ params }: { params: Params }) {
  const { subject, classYear } = params;
  const pages = getPages({ subject, classYear });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3">
        {pages.map((page) => {
          return (
            <Card
              key={page.name}
              href={`/${subject}/page-wise/${classYear}/${page.name}`}
              data={page}
            />
          );
        })}
      </div>
    </div>
  );
}
