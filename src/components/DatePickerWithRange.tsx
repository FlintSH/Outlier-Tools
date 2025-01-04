import * as React from "react";
import { addDays, format, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date: DateRange;
  setDate: (date: DateRange) => void;
}

export function DatePickerWithRange({
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const handlePreviousWeek = () => {
    if (date?.from && date?.to) {
      setDate({
        from: subDays(date.from, 7),
        to: subDays(date.to, 7),
      });
    }
  };

  const handleNextWeek = () => {
    if (date?.from && date?.to) {
      setDate({
        from: addDays(date.from, 7),
        to: addDays(date.to, 7),
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousWeek}
        disabled={!date?.from || !date?.to}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextWeek}
        disabled={!date?.from || !date?.to}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}