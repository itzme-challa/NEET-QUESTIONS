"use client";

import * as React from "react";

import { Question } from "../../type";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function Mcq({
  question,
  index,
}: {
  question: Question;
  index: number;
}) {
  const [selected, setSelected] = React.useState<string>("");
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);

  return (
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-[auto_1fr] items-center gap-2 font-semibold">
        <div className="w-8 h-8 grid place-items-center bg-primary text-primary-foreground rounded-full">
          {index + 1}
        </div>{" "}
        {question.question}
      </div>
      <div className="space-y-2">
        {question.option_a ? (
          <Option
            option={question.option_a}
            answer={question.answer}
            isSubmitted={isSubmitted}
            active={selected === question.option_a}
            setSelected={setSelected}
          />
        ) : null}
        {question.option_b ? (
          <Option
            option={question.option_b}
            answer={question.answer}
            isSubmitted={isSubmitted}
            active={selected === question.option_b}
            setSelected={setSelected}
          />
        ) : null}
        {question.option_c ? (
          <Option
            option={question.option_c}
            answer={question.answer}
            isSubmitted={isSubmitted}
            active={selected === question.option_c}
            setSelected={setSelected}
          />
        ) : null}
        {question.option_d ? (
          <Option
            option={question.option_d}
            answer={question.answer}
            isSubmitted={isSubmitted}
            active={selected === question.option_d}
            setSelected={setSelected}
          />
        ) : null}
      </div>
      <div className="space-y-2">
        <Button
          onClick={() => {
            if (selected) {
              setIsSubmitted(true);
            }
          }}
          disabled={selected && !isSubmitted ? false : true}
          className="w-full"
        >
          Submit
        </Button>
        <Drawer>
          <DrawerTrigger className="w-full" disabled={!isSubmitted}>
            <Button disabled={!isSubmitted} className="w-full">Show Explanation</Button>
          </DrawerTrigger>
          <DrawerContent className="mx-auto w-full max-w-2xl p-4">
            <DrawerHeader>
              <DrawerTitle>Explanation:</DrawerTitle>
            </DrawerHeader>
            <p className="p-4">{question.explanation}</p>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

const Option = ({
  option,
  answer,
  active,
  isSubmitted,
  setSelected,
}: {
  option: string;
  answer: string;
  active: boolean;
  isSubmitted: boolean;
  setSelected: (option: string) => void;
}) => {
  return (
    <div
      onClick={() => (!isSubmitted ? setSelected(option) : null)}
      className={`${
        isSubmitted
          ? option !== answer && active
            ? "bg-red-400 dark:bg-red-500"
            : option === answer
            ? "bg-green-400 dark:bg-green-500"
            : "bg-accent"
          : active
          ? "bg-primary text-primary-foreground"
          : "bg-accent hover:text-accent-foreground"
      }
     px-4 py-3 hover:outline hover:outline-input rounded`}
    >
      {option}
    </div>
  );
};
