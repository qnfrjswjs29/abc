"use client";

import { useEffect, useMemo, useState } from "react";
import { HOLIDAYS } from "../lib/holidays";

type EventItem = {
  id: string;
  title: string;
  time?: string;
};

type EventsMap = Record<string, EventItem[]>;

const STORAGE_KEY = "calendar-events";
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(monthAnchor: Date) {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  });
}

export default function Calendar() {
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<EventsMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [timeInput, setTimeInput] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setEvents(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, isLoaded]);

  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const selectedKey = toDateKey(selectedDate);
  const selectedEvents = events[selectedKey] ?? [];

  function goToMonth(offset: number) {
    setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  function goToday() {
    const now = new Date();
    setMonthAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }

  function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    const title = titleInput.trim();
    if (!title) return;

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      title,
      time: timeInput || undefined,
    };

    setEvents((prev) => {
      const dayEvents = prev[selectedKey] ?? [];
      const updated = [...dayEvents, newEvent].sort((a, b) =>
        (a.time ?? "").localeCompare(b.time ?? "")
      );
      return { ...prev, [selectedKey]: updated };
    });

    setTitleInput("");
    setTimeInput("");
  }

  function handleDeleteEvent(id: string) {
    setEvents((prev) => {
      const dayEvents = (prev[selectedKey] ?? []).filter((ev) => ev.id !== id);
      const next = { ...prev };
      if (dayEvents.length > 0) {
        next[selectedKey] = dayEvents;
      } else {
        delete next[selectedKey];
      }
      return next;
    });
  }

  return (
    <div className="w-full max-w-3xl rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:bg-black/85 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          {monthAnchor.getFullYear()}년 {monthAnchor.getMonth() + 1}월
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="이전 달"
            className="h-8 w-8 rounded-md border border-black/10 text-sm hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToday}
            className="h-8 rounded-md border border-black/10 px-3 text-sm hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="다음 달"
            className="h-8 w-8 rounded-md border border-black/10 text-sm hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`border-b border-black/10 bg-black/[.02] py-2 text-center text-xs font-medium dark:border-white/15 dark:bg-white/5 ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-zinc-500"
            }`}
          >
            {label}
          </div>
        ))}

        {days.map((date, i) => {
          const key = toDateKey(date);
          const dayEvents = events[key] ?? [];
          const holidayName = HOLIDAYS[key];
          const isCurrentMonth = date.getMonth() === monthAnchor.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const weekday = date.getDay();
          const isRedDay = weekday === 0 || Boolean(holidayName);

          return (
            <button
              type="button"
              key={key + i}
              onClick={() => setSelectedDate(date)}
              className={`flex min-h-20 flex-col items-start gap-1 border-b border-r border-black/5 p-1.5 text-left align-top last:border-r-0 dark:border-white/10 sm:min-h-24 ${
                isCurrentMonth ? "" : "opacity-40"
              } ${isSelected ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-black/[.03] dark:hover:bg-white/5"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday ? "bg-blue-600 font-semibold text-white" : ""
                } ${
                  !isToday && isRedDay
                    ? "text-red-500"
                    : !isToday && weekday === 6
                      ? "text-blue-500"
                      : !isToday
                        ? "text-zinc-700 dark:text-zinc-300"
                        : ""
                }`}
              >
                {date.getDate()}
              </span>
              {holidayName && (
                <span className="block w-full truncate text-[9px] font-medium text-red-500">
                  {holidayName}
                </span>
              )}
              <div className="flex w-full flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <span
                    key={ev.id}
                    className="w-full truncate rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-800 dark:bg-blue-500/20 dark:text-blue-200"
                  >
                    {ev.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-zinc-500">+{dayEvents.length - 2}개 더보기</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-black/10 p-4 dark:border-white/15">
        <h2 className="mb-3 text-sm font-semibold text-black dark:text-zinc-50">
          {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
          {HOLIDAYS[selectedKey] && (
            <span className="ml-2 text-red-500">· {HOLIDAYS[selectedKey]}</span>
          )}
        </h2>

        <form onSubmit={handleAddEvent} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="일정 제목을 입력하세요"
            className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
          />
          <input
            type="time"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            추가
          </button>
        </form>

        {selectedEvents.length === 0 ? (
          <p className="text-sm text-zinc-500">등록된 일정이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedEvents.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center justify-between rounded-md bg-black/[.03] px-3 py-2 text-sm dark:bg-white/5"
              >
                <span>
                  {ev.time && <span className="mr-2 font-mono text-xs text-zinc-500">{ev.time}</span>}
                  {ev.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(ev.id)}
                  aria-label="일정 삭제"
                  className="text-xs text-zinc-500 hover:text-red-500"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
