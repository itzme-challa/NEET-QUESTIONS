import Link from "next/link";

type Params = { subject: "biology" | "physics" | "chemistry" };

export const dynamicParams = false;
export async function generateStaticParams() {
  return [
    { subject: "biology" },
    { subject: "physics" },
    { subject: "chemistry" },
  ];
}

export default async function Home({ params }: { params: Params }) {
    const { subject } = params;
    const slugs = ['chapter-wise', 'page-wise']
  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="grid  gap-3">
        {slugs.map(slug => (
          <Link key={slug} href={`/${subject}/${slug}`}>
            <div className="w-full p-4 rounded text text-center font-bold capitalize bg-accent hover:outline hover:outline-slate-400 ">{slug.replace('-',' ')}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
