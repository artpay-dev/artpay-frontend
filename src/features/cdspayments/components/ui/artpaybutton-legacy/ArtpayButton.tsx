type ArtpayButtonProps = {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}

const ArtpayButton = ({onClick, disabled = false, title} : ArtpayButtonProps) => {
  const buttonTitle = title || 'Avvia richiesta prestito';



  return (
    <button onClick={onClick} disabled={disabled} className={`disabled:cursor-not-allowed bg-primary text-white w-full max-w-md rounded-[28px] py-3.5 px-6 flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-primary-hover`  }>
      {buttonTitle}
    </button>
  );
};

export default ArtpayButton;