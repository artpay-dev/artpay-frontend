import LogoFastArtpay from "../../../../../components/icons/LogoFastArtpay.tsx";
import { useNavigate } from "../../../../../utils.ts";



const Navbar = () => {
  const navigate = useNavigate();
  return (
    <header className={"fixed w-full z-50 top-6 px-2 max-w-md md:px-0"}>
      <nav className={"p-4 custom-navbar flex justify-between items-center w-full bg-white "}>
        <button className={"text-tertiary cursor-pointer underline underline-offset-3 leading-[125%]"} onClick={() => navigate('back')}>
          Torna indietro
        </button>

        <LogoFastArtpay />
      </nav>
    </header>
  );
};

export default Navbar;