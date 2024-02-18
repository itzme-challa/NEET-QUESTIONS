import { Question } from "../../type";
import biology from "../../data/biology.json";
import chemistry from "../../data/chemistry.json";
import physics from "../../data/physics.json";

const getChapters = ({
  subject,
}: {
  subject: "biology" | "physics" | "chemistry";
}) => {
  const data =
    subject === "biology"
      ? (biology as Question[])
      : subject === "chemistry"
      ? (chemistry as Question[])
      : (physics as Question[]);

  const onlyMcq = data.filter((qn) => qn.quiz_type === "mcq");
  const chaptersMap = new Map<string, number>();

  for (const qn of onlyMcq) {
    const slices = qn.topic_name.split(">>");

    const name = slices[0].trim();
    chaptersMap.set(name, (chaptersMap.get(name) || 0) + 1);
  }

  return [...chaptersMap].map(([name, total]) => {
    return { name, total };
  });
};

export default getChapters;
