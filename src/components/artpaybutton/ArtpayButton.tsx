import LogoButton from "../icons/LogoButton.tsx";

type ArtpayButtonProps = {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}

const ArtpayButton = ({onClick, disabled = false, title} : ArtpayButtonProps) => {
  const buttonTitle = title || 'Paga ora con ';



  return (
    <button onClick={onClick} disabled={disabled} className={`disabled:cursor-not-allowed bg-primary text-white w-full max-w-md rounded-[28px] py-2 px-6 flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-primary-hover`  }>
      {buttonTitle}<span><LogoButton /></span>
    </button>
  );
};

export default ArtpayButton;