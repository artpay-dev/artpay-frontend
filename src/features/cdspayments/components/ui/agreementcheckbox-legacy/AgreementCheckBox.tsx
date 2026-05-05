import { NavLink } from "react-router-dom";

const AgreementCheckBox = ({isChecked, handleChange}: {isChecked: boolean; handleChange: React.ChangeEventHandler<HTMLInputElement>}) => {
  return (
    <label htmlFor="agreement" className={'flex my-6 items-center gap-2'}>
      <input type="checkbox" name="agreement" id="agreement" checked={isChecked} onChange={handleChange} className={'size-4'}/>
      <span className={'text-sm'}>Accetto le <NavLink className={'text-primary underline'} to={'/condizioni-generali-di-acquisto'}>condizioni generali di acquisto</NavLink><span className={'text-red-500'}>&nbsp;*</span></span>
    </label>
  );
};

export default AgreementCheckBox;