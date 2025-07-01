import logo from "../assets/logo.png";
export const LOGO = ({ textColor }: { textColor: string }) => (
  <div className="flex gap-4 items-center">
    <img src={logo} alt="logo" className="" />
    <h1 className={`font-semibold text-4xl text-${textColor || "black"}`}>
      Echommet
    </h1>
  </div>
);
