import { Close } from "@mui/icons-material";
import useArticleStore from "../../../stores/articleDrawStore.ts";
import { Link, useNavigate } from "react-router-dom";

const ArticleDraw = () => {
  const { openArticleDraw, setOpenArticleDraw } = useArticleStore();
  const navigate = useNavigate();

  return (
    <aside
      className={`${
        openArticleDraw ? "" : "translate-y-full "
      } py-6 payment-draw shadow-custom-top fixed w-full z-50 rounded-t-3xl bottom-0 h-7/8 bg-white transition-all  max-w-md`}>
      <div className={"flex items-center justify-end bg-white  w-full pe-8"}>
        <button
          className={" cursor-pointer bg-gray-100 rounded-full p-1 "}
          onClick={() => setOpenArticleDraw({ openArticleDraw: false })}>
          <Close />
        </button>
      </div>
      <section className={"mt-12 h-full pb-33 px-8 overflow-y-scroll"}>
        <article className={"leading-[125%] pb-50"}>
          <header className={"space-y-4 flex flex-col mb-10"}>
            <span className={"text-primary uppercase"}>Category</span>
            <h1 className={"text-balance text-3xl"}>Artpay per Sant'Agostino</h1>
          </header>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          <p className={"text-secondary text-sm mt-10 mb-16"}>By Author - 15 Aprile 2024 - 5 minuti di lettura</p>
          <main>
            <img
              src="/images/cover-sa.svg"
              width={600}
              height={400}
              alt="Artpay per Sant'Agostino"
              className="border border-gray-200 w-full h-full aspect-video object-cover"
            />
            <h2 className={"text-balance text-2xl mt-16 mb-10"}>Sottotitolo di due righe</h2>
            <section className={"space-y-4"}>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad aspernatur dolorem dolorum error explicabo
                facere incidunt magni maxime nemo nihil nulla numquam odio, officia quasi qui quibusdam quidem quis
                quisquam tempora veniam voluptas voluptate voluptatem!
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad aspernatur dolorem dolorum error explicabo
                facere incidunt magni maxime nemo nihil nulla numquam odio, officia quasi qui quibusdam quidem quis
                quisquam tempora veniam voluptas voluptate voluptatem!
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad aspernatur dolorem dolorum error explicabo
                facere incidunt magni maxime nemo nihil nulla numquam odio, officia quasi qui quibusdam quidem quis
                quisquam tempora veniam voluptas voluptate voluptatem!
              </p>
            </section>
          </main>
        </article>
      </section>
      <section className="fixed bottom-0 w-full shadow-custom-top  bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-md max-w-full">
        <button
          className={"artpay-button-style bg-primary hover:bg-primary-hover text-white"}
          onClick={() => {
            if (openArticleDraw) {
              document.body.classList.remove("overflow-hidden");
            }
            if (!document.body.classList.contains("overflow-hidden")) {
              navigate("/acquisto-esterno");
            }

          }}>
          Paga a rate
        </button>
        <Link to={"https://www.santagostinoaste.it/"} className={"text-secondary artpay-button-style"}>
          Torna su Sant'Agostino
        </Link>
      </section>
    </aside>
  );
};

export default ArticleDraw;
