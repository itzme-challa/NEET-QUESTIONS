import Link from "next/link";

type Params = { subject: "biology" | "physics" | "chemistry" };

// export const dynamicParams = false;
// export async function generateStaticParams() {
//   return [
//     { subject: "biology" },
//     { subject: "physics" },
//     { subject: "chemistry" },
//   ];
// }

export default async function Home({ params }: { params: Params }) {
    const { subject } = params;
    const slugs = ['11-22', '11-23', '12-22', '12-23']
  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid  gap-3">
        {slugs.map(slug => (
          <Link key={slug} href={`/${subject}/page-wise/${slug}`}>
            <div className="w-full p-4 rounded text text-center font-bold capitalize bg-accent hover:outline hover:outline-slate-400 ">Class {slug.split('-')[0]} NCERT-{slug.split('-')[1]}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
