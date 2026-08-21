import Calendar from "./components/Calendar";
import KakaoLoginButton from "./components/KakaoLoginButton";

export default function Home() {
  return (
    <div
      className="flex flex-1 flex-col items-center bg-cover bg-center bg-fixed px-4 py-10 sm:px-8"
      style={{ backgroundImage: "url(/images/bg.png)" }}
    >
      <KakaoLoginButton />
      <Calendar />
    </div>
  );
}
