import { Question } from "../../type";
import biology from "../../data/biology.json";
import chemistry from "../../data/chemistry.json";
import physics from "../../data/physics.json";

const getQuestions = ({
  subject,
  chapter,
  topic,
  part,
}: {
  subject: "biology" | "physics" | "chemistry";
  chapter: string;
  topic: string;
  part: string;
}) => {
  const data =
    subject === "biology"
      ? (biology as Question[])
      : subject === "chemistry"
      ? (chemistry as Question[])
      : (physics as Question[]);
  const onlyMcq = data.filter((qn) => qn.quiz_type === "mcq");

  const questions: Question[] = [];

  for (const qn of onlyMcq) {
    const slices = qn.topic_name.split(">>");

    if (
      slices[0].trim() === decodeURIComponent(chapter) &&
      slices[1].trim() === decodeURIComponent(topic) &&
      slices[2].trim() === decodeURIComponent(part)
    ) {
      questions.push(qn);
    }
  }
  return questions;
};

export default getQuestions;
