import { Question } from "../../type";
import biology from "../../data/biology.json";
import chemistry from "../../data/chemistry.json";
import physics from "../../data/physics.json";

const getPages = ({
  subject,
  classYear,
}: {
  subject: "biology" | "physics" | "chemistry";
  classYear: string;
}) => {
  const data =
    subject === "biology"
      ? (biology as Question[])
      : subject === "chemistry"
      ? (chemistry as Question[])
      : (physics as Question[]);

  const filteredData = data.filter(qn => {
    if (classYear.split('-')[1] == "22") {
      return qn.ncert22_page.split('-')[0] ==  classYear.split('-')[0]
    }
    if (classYear.split('-')[1] == "23") {
      return qn.ncert23_page.split('-')[0] ==  classYear.split('-')[0]
    }
  })
  
  const onlyMcq = filteredData.filter((qn) => qn.quiz_type === "mcq");
  const pagesMap = new Map<string, { total: number; ids: string[] }>();

  for (const qn of onlyMcq) {
    if (classYear.split('-')[1] == "22") {
      const page = qn.ncert22_page.split('-')[1]
      if (page && qn.ncert22_page.split("-")[0] == classYear.split('-')[0]) {
        const currentIds = pagesMap.get(qn.unique_id)?.ids || [];
        pagesMap.set(page, {
          total: (pagesMap.get(page)?.total || 0) + 1,
          ids: [...currentIds, qn.unique_id],
        });
      }
    }
    if (classYear.split('-')[1] == "23") {
      const page = qn.ncert23_page.split('-')[1]
      if (page && qn.ncert23_page.split("-")[0] == classYear.split('-')[0]) {
        const currentIds = pagesMap.get(qn.unique_id)?.ids || [];
        pagesMap.set(page, {
          total: (pagesMap.get(page)?.total || 0) + 1,
          ids: [...currentIds, qn.unique_id],
        });
      }
    }  
  }

  return [...pagesMap].map(([name, value]) => {
    return { name: parseInt(name).toString(), total: value.total, ids: value.ids };
  }).sort((a,b) => parseInt(a.name) - parseInt(b.name));
};

export default getPages;
