import Link from "next/link";
import getTopics from "@/utils/getTopics";
import getPages from "@/utils/getPages";

type Params = { subject: "biology" | "physics" | "chemistry"; classYear: string };

// export const dynamicParams = false;
// export async function generateStaticParams({ params }: { params: Params }) {
//   const { subject, class } = params;
//   const classs = getPages({ subject });
//   return classs.map((class) => {
//     return {
//       subject: "biology",
//       class: class.name,
//     };
//   });
// }

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
