import Link from "next/link";
import getTopics from "@/utils/getTopics";
import getPages from "@/utils/getPages";

type Params = { subject: "biology" | "physics" | "chemistry"; classYear: string };

export const dynamicParams = false;
export async function generateStaticParams() {
  const subjects = ['biology', 'chemistry', 'physics'] as const
  const classYears = ['11-22', '11-23', '12-22', '12-23']
  const routes:Params[] = []
  subjects.forEach(subject => {
    classYears.forEach(classYear => routes.push({
      subject,
      classYear
    }))
  })  
  return routes
}


export default async function Home({ params }: { params: Params }) {
  const { subject, classYear } = params;
  const pages = getPages({ subject, classYear });

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid gap-3">
      {pages.map(({ name, total }) => {
        return (
          <Link key={name} href={`/${subject}/page-wise/${classYear}/${name}`}>
            <div className="w-full space-y-2 p-4 rounded capitalize bg-accent hover:outline hover:outline-slate-400 ">
              <p className="text-lg">Page {name}</p>
              <p className="text-sm">Total: {total}</p>
            </div>
          </Link>
        );
      })}
    </div>
    </div>
  );
}
