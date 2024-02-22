import getPages from "@/utils/getPages";
import { Card } from "@/components/card";
import { useRef } from 'react';
import { ViewportList } from 'react-viewport-list';
import CardList from "@/components/card-list";

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
        <CardList lists={pages.map(page => {
          return {
          ...page,
          href: `/${subject}/page-wise/${classYear}/${page.name}`
        }
      })}/>

    </div>
  );
}
