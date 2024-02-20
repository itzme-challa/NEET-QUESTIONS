"use client";

import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Question } from "../../type";
import { Mcq } from "./mcq";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import useLocalStorage from "use-local-storage";

export function Questions({ questions }: { questions: Question[] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [paginationQnNums, setPaginationQnNums] = React.useState<number[]>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [completedQns, setCompletedQns] = useLocalStorage<{
    [kek: string]: boolean;
  }>("completedQn", {});

  const getPaginationQnNums = (current: number) => {
    const qns: number[] = [];
    for (
      let index = current - (current == questions.length ? 2 : 1);
      qns.length < 3 && index <= questions.length;
      index++
    ) {
      if (questions[index - 1]) {
        qns.push(index);
      }
    }
    return qns;
  };

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    setPaginationQnNums(
      getPaginationQnNums(api.selectedScrollSnap() + 1) || []
    );

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setPaginationQnNums(
        getPaginationQnNums(api.selectedScrollSnap() + 1) || []
      );
    });
  }, [api]);

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div>
        <div className="">{}</div>
      </div>

      <Carousel
        setApi={setApi}
        className="w-auto mx-[-1rem] overflow-hidden md:mx-4 md:overflow-visible"
      >
        <CarouselContent>
          {questions.map((qn, index) => (
            <CarouselItem key={qn.unique_id}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex p-6">
                    {qn.quiz_type === "mcq" ? (
                      <Mcq question={qn} index={index} />
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="h-14"></div>
      <div className="select-none fixed bottom-0 left-0 min-w-full px-4 py-2 bg-secondary flex justify-between items-center">
        <Button onClick={() => api?.scrollPrev()} variant="outline">
          Prev
        </Button>
        <div onClick={() => setIsOpen(true)} className="flex items-center gap-1 ">
          {current > 3 ? <div>...</div> : null}
          {paginationQnNums.map((qnNum, index) => {
            return (
              <div
                key={qnNum}
                className={`font-semibold w-12 h-12 grid place-items-center rounded-full border border-dotted ${
                  qnNum === current
                    ? "bg-primary text-primary-foreground"
                    : completedQns[questions[qnNum - 1].unique_id] === true
                    ? "bg-green-500"
                    : completedQns[questions[qnNum - 1].unique_id] === false
                    ? "bg-red-500"
                    : "bg-primary-foreground"
                } ${qnNum === current && completedQns[questions[qnNum - 1].unique_id] === true
                  ? "outline outline-green-500"
                  : qnNum === current && completedQns[questions[qnNum - 1].unique_id] === false
                  ? "outline outline-red-500" : ""}`}
              >
                {qnNum}
              </div>
            );
          })}
          {count - current >= 3 ? <div className="pb-2">...</div> : null}
        </div>
        <Button onClick={() => api?.scrollNext()} variant="outline">
          Next
        </Button>
      </div>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="select-none mx-auto w-full max-w-2xl p-4">
          <div className="flex flex-wrap gap-4 py-6">
            {questions.map((qn, index) => (
              <div
                key={qn.unique_id}
                onClick={() => {
                  api?.scrollTo(index);
                  setIsOpen(false);
                }}
                className={`font-semibold w-12 h-12 grid place-items-center rounded-full border border-dotted ${
                  index + 1 === current
                    ? "bg-primary text-primary-foreground"
                    : completedQns[qn.unique_id] === true
                    ? "bg-green-500"
                    : completedQns[qn.unique_id] === false
                    ? "bg-red-500"
                    : "bg-primary-foreground"
                } ${index + 1 === current && completedQns[qn.unique_id] === true
                  ? "outline outline-green-500"
                  : index + 1 === current && completedQns[qn.unique_id] === false
                  ? "outline outline-red-500" : ""}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
