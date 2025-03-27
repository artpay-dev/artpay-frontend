import { NavLink } from "react-router-dom";


const FocusButton = () => {
  return (
    <NavLink to={"/landing-campaign/#brevo-form"} className={'text-[#6576EE] text-2xl my-12 block font-medium hover:text-[#4950e2] transition-all'}>
      Compila il form per essere ricontattato
    </NavLink>
  );
};

export default FocusButton;