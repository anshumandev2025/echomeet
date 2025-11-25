import logo from "../assets/logo.png";
export const LOGO = ({ textColor }: { textColor: string }) => (
  <div className="flex gap-4 items-center">
    <img src={logo} alt="logo" className="" />
    <h1
      className={`font-semibold text-4xl text-black text-${
        textColor || "black"
      }`}
    >
      EchoMeet
    </h1>
  </div>
);
