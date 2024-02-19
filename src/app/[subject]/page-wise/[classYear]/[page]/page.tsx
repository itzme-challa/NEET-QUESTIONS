import getPageQuestions from "@/utils/getPageQuestions"
import { Questions } from "@/components/questions";
import { auth } from "@/lib/auth";

type Params = {
  subject: "biology" | "physics" | "chemistry";
  classYear: string;
  page: string;
};

// export const dynamicParams = false;
// export async function generateStaticParams({ params }: { params: Params }) {
//   const { subject, chapter } = params;
//   const chapters = getChapters({ subject });
//   return chapters.map((chapter) => {
//     return {
//       subject: "biology",
//       chapter: chapter.name,
//     };
//   });
// }

export default async function Home({ params }: { params: Params }) {
  const sesion = await auth();
  const { subject, classYear, page } = params;
  const questions = getPageQuestions({ subject, classYear, page });

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
