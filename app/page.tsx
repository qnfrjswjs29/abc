import Calendar from "./components/Calendar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black sm:px-8">
      <Calendar />
    </div>
  );
}
