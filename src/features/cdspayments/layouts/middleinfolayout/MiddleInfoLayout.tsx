import { ReactNode, useEffect, useState } from "react";
import Logo from "../../../../components/icons/Logo.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../../../../hoc/DataProvider.tsx";
import { Gallery } from "../../../../types/gallery.ts";
import ArticleDraw from "../../components/ui/articledraw/ArticleDraw.tsx";
import useArticleStore from "../../stores/articleDrawStore.ts";

const MiddleInfoLayout = ({ children }: { children: ReactNode }) => {
  const {setOpenArticleDraw, openArticleDraw} = useArticleStore();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Gallery | null>(null);
  const data = useData();

  const getVendor = async () => {
    try {
      const vendorResp: Gallery = await data.getGallery("21");
      if (!vendorResp) throw new Error("Vendor not found");
      setVendor(vendorResp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!vendor) getVendor();

    if (openArticleDraw) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

  }, [openArticleDraw]);

  return (
    <section >
      {openArticleDraw && <div className={"overlay fixed z-50 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"}></div>}
      <div className={` min-h-screen flex flex-col bg-primary`}>
        <div className={` mx-auto container max-w-md relative bg-white`}>
          <ArticleDraw />
          <header className={"fixed w-full z-30 top-6 px-2 max-w-md "}>
            <nav className={"p-4 custom-navbar flex justify-center items-center w-full bg-white "}>
              <Logo />
            </nav>
          </header>
          <section className="px-8  bg-white pt-35 ">
            {!vendor ? (
              <div className="space-y-4 animate-pulse pb-12">
                <div className="flex items-center gap-2.5">
                  <div className="size-12 overflow-hidden border border-gray-200 rounded-sm p-1 bg-white">
                    <div className="w-full h-full bg-gray-300"></div>
                  </div>
                  <div className="h-6 w-2/3 bg-gray-300 rounded"></div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="h-4 w-2/4 bg-gray-300 rounded"></span>
                  <span className="h-4 w-2/2 bg-gray-300 rounded"></span>
                  <span className="h-4 w-2/4 bg-gray-300 rounded"></span>
                  <span className="h-4 w-2/4 bg-gray-300 rounded"></span>
                  <span className="h-4 w-1/3 bg-gray-300 rounded"></span>
                </div>
              </div>
            ) : (
              <article className="border-b border-[#E2E6FC] space-y-3 pb-12">
                <div className={"flex items-start space-x-2"}>
                  <div className="min-h-12 h-full min-w-12 max-w-16 aspect-square overflow-hidden p-1 border border-gray-200 rounded-md">
                    <img
                      src={vendor?.shop.image}
                      alt={vendor?.name}
                      width={100}
                      height={100}
                      className="border border-gray-200 w-full h-full aspect-square object-cover"
                    />
                  </div>
                  <h4 className={"text-2xl text-balance"}>Artpay per {vendor?.display_name}</h4>
                </div>
                <p className={'mt-8 mb-4 leading-[125%] line-clamp-4 text-balance'}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos error eum laboriosam maxime optio perspiciatis quaerat qui similique. Lorem ipsum dolor.
                </p>
                <button onClick={()=> {
                  setOpenArticleDraw({openArticleDraw: true})
                }}
                  className={'underline text-secondary cursor-pointer'}>Leggi tutto</button>
              </article>
            )}
          </section>
          <main className="flex-1 bg-white px-8 pb-50 ">{children}</main>
          <section className="fixed bottom-0 w-full shadow-custom-top  bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-md max-w-full">
            <button
              className={"artpay-button-style bg-primary hover:bg-primary-hover text-white"}
              onClick={() => {
                navigate("/acquisto-esterno");
              }}>
              Paga a rate
            </button>
            <Link to={"https://www.santagostinoaste.it/"} className={"text-secondary artpay-button-style"}>
              Torna su Sant'Agostino
            </Link>
          </section>
        </div>
      </div>
    </section>
  );
};

export default MiddleInfoLayout;
