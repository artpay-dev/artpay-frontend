const Anchor = ({title = "Compila il form per essere ricontattato" } : {title?: string}) => {
  return (
    <a href={"/landing-campaign/#brevo-form"} className={'text-[#6576EE] text-2xl my-12 block font-medium hover:text-[#4950e2] transition-all lg:hidden'}>
      {title}
    </a>
  );
};

export default Anchor;