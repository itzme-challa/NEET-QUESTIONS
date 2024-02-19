import getPageQuestions from "@/utils/getPageQuestions"
import { Questions } from "@/components/questions";
import { auth } from "@/lib/auth";
import getPages from "@/utils/getPages";

type Params = {
  subject: "biology" | "physics" | "chemistry";
  classYear: string;
  page: string;
};

export const dynamicParams = false;
export async function generateStaticParams() {
  const subjects = ['biology', 'chemistry', 'physics'] as const
  const classYears = ['11-22', '11-23', '12-22', '12-23']
  const routes:Params[] = []
  subjects.forEach(subject => {
    classYears.forEach(classYear => {
      const pages = getPages({subject,classYear})
      pages.forEach(page => routes.push({
        subject,
        classYear,
        page: page.name
      }))
    })
  })  
  return routes
}

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
