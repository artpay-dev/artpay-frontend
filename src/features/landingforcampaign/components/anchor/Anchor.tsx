const Anchor = ({ title = "Compila il form per essere ricontattato" }: { title?: string }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const target = document.getElementById("brevo-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href="#brevo-form"
      onClick={handleClick}
      className="text-[#6576EE] text-2xl my-12 block font-medium hover:text-[#4950e2] transition-all lg:hidden"
    >
      {title}
    </a>
  );
};

export default Anchor;
