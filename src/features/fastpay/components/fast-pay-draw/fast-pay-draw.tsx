import { Close } from "@mui/icons-material";
import useListDrawStore from "../../stores/listDrawStore.tsx";
import PlusIcon from "../../../../components/icons/PlusIcon.tsx";
import { useNavigate } from "react-router-dom";
import OfferCard from "../offer-card/offer-card.tsx";
//import useProposalStore from "../../stores/proposalStore.tsx";

const FastPayDraw = () => {
  const navigate = useNavigate();



  const { openListDraw, setOpenListDraw } = useListDrawStore();
  //const {order, loading, setPaymentData} = useProposalStore()

  return (
    <aside
      className={`${
        openListDraw ? "" : "translate-y-full md:translate-y-0 md:translate-x-full"
      } py-6 payment-draw fixed w-full z-50 rounded-t-3xl bottom-0 h-4/5 bg-white transition-all  md:rounded-s-3xl md:rounded-tr-none md:overflow-y-hidden md:top-0 md:right-0 md:h-screen  md:max-w-sm`}>
      <div className={"fixed bg-white px-8 w-full max-w-md md:pe-24"}>
        <div className={"w-full h-12 mb-4"}>
          <button
            className={" cursor-pointer bg-gray-100 rounded-full p-3 float-right"}
            onClick={() => setOpenListDraw({ openListDraw: false })}>
            <Close />
          </button>
        </div>
        <div className={"flex items-center justify-between"}>
          <div className={"space-y-2"}>
            <h3 className={"text-2xl leading-6"}>Lista offerte</h3>
            <h3 className={"text-secondary leading-6"}>Offerte inviate</h3>
          </div>
          <button
            className={"bg-primary rounded-full p-3"}
            onClick={() => {
              setOpenListDraw({ openListDraw: false });
              navigate('/vendor/fastpay/crea-offerta')
            }}>
            <PlusIcon color="inherit" style={{ fontSize: "1.5rem", cursor: "pointer", fill: "white" }} />
          </button>
        </div>
      </div>
      <section className={"mt-40 overflow-y-scroll pb-60 h-full"}>
        <ul className={"flex flex-col gap-6 mt-4 px-8"}>
          <OfferCard />
        </ul>
      </section>
    </aside>
  );
};

export default FastPayDraw;
