import { Close } from "@mui/icons-material";
import useListDrawStore from "../../stores/listDrawStore.tsx";
import PlusIcon from "../../../../components/icons/PlusIcon.tsx";
//import useProposalStore from "../../stores/proposalStore.tsx";

const FastPayDraw = () => {
  const { openListDraw, setOpenListDraw } = useListDrawStore();
  //const {order, loading, setPaymentData} = useProposalStore()

  return (
    <aside
      className={`${
        openListDraw ? "" : "translate-y-full md:translate-y-0 md:translate-x-full"
      } py-6 payment-draw fixed w-full z-50 rounded-t-3xl bottom-0 h-4/5 bg-white transition-all  md:rounded-s-3xl md:rounded-tr-none md:overflow-y-hidden md:top-0 md:right-0 md:h-screen  md:max-w-sm`}>
      <div className={"fixed bg-white px-8 w-full max-w-md"}>
        <div className={'w-full h-12 mb-4'}>
          <button className={" cursor-pointer bg-gray-100 rounded-full p-3 float-right"} onClick={() => setOpenListDraw({ openListDraw: false })}>
            <Close />
          </button>
        </div>
        <div className={'flex items-center justify-between'}>
          <div className={'space-y-2'}>
            <h3 className={"text-2xl leading-6"}>Lista offerte</h3>
            <h3 className={"text-secondary leading-6"}>Offerte inviate</h3>
          </div>
          <button className={'bg-primary rounded-full p-3'}>
            <PlusIcon color="inherit" style={{ fontSize: "1.5rem", cursor: "pointer", fill: "white" }} />
          </button>
        </div>
      </div>
      <section className={"mt-40 overflow-y-scroll h-full pb-33"}>
        <ul className={"flex flex-col gap-6 mt-4 px-8"}>
          <li className={"border border-[#E2E6FC] p-4 rounded-lg space-y-4 max-w-sm"}>
            <span>Offerta N.0000</span>
            <div className="flex items-center gap-3 my-4">
              <img src="/images/immagine--galleria.png" alt="" width={400} height={400} className="rounded-sm object-cover h-8 w-8 aspect-square" />
              <div className={'flex flex-col'}>
                <span>Divinity, 2020</span>
                <span className={'text-secondary text-xs'}>Trudy Benson</span>
              </div>
            </div>
            <span className={'text-secondary'}>L'offerta scade tra:</span>

          </li>
        </ul>
      </section>
    </aside>
  );
};

export default FastPayDraw;
