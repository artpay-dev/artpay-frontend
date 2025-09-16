import Navbar from "../../cdspayments/components/ui/navbar/Navbar.tsx";
import SkeletonOrderDetails from "../../cdspayments/components/paymentmethodslist/SkeletonOrderDetails.tsx";
import PaymentProviderCard from "../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import BillingDataForm from "../../../components/BillingDataForm.tsx";
import BillingDataPreview from "../../../components/BillingDataPreview.tsx";
import { Link, NavLink } from "react-router-dom";
import { ReactNode, useState } from "react";
import { useDirectPurchase } from "../contexts/DirectPurchaseContext.tsx";
import { Box, Typography } from "@mui/material";
import DisplayImage from "../../../components/DisplayImage.tsx";
import ShippingDataForm from "../../../components/ShippingDataForm.tsx";
import ShippingDataPreview from "../../../components/BillingDataPreview.tsx";
import ShoppingBagIcon from "../../../components/icons/ShoppingBagIcon.tsx";
import UserIcon from "../../../components/icons/UserIcon.tsx";

const DirectPurchaseLayout = ({children}: {children: ReactNode}) => {
  const {pendingOrder, loading, subtotal, artworks, orderMode, requireInvoice, handleRequireInvoice, isSaving, userProfile, handleProfileDataSubmit} = useDirectPurchase()
  const [shippingDataEditing, setShippingDataEditing] = useState<boolean>(false)
  /*const [showBillingSection, setShowBillingSection] = useState(true)

  if (!requireInvoice) {
    setShowBillingSection(true)
  }*/

  const showBillingSection = userProfile && (requireInvoice || orderMode === "loan")

  console.log(loading)


  return (
    <div className="min-h-screen flex flex-col pt-35">
      <div className="mx-auto container max-w-2xl">
        <Navbar />
        <section className="px-8 mb-6 container lg:px-2">
          <h2 className="text-4xl font-normal flex flex-col mb-13">
            {pendingOrder ? (
              <>
                <span className={' leading-[125%] text-primary font-light'}>Acquista</span>
                <span className={'leading-[125%]  text-2xl'}>Ordine N.{pendingOrder.id}</span>
              </>
            ) : (
              <span className="size-12 my-5 block border-2 border-white border-b-transparent rounded-full animate-spin"></span>
            )}
          </h2>
        </section>
        <main className="flex-1 bg-white rounded-t-3xl pb-24 shadow-custom-variant p-8 md:p-8">
          {loading ? <SkeletonOrderDetails /> : (
            <>
              <div className={'flex flex-col space-y-8 pb-12 border-b border-[#CDCFD3] '}>
                <div className={'flex space-x-2 items-center'}>
                  <ShoppingBagIcon className={'size-4'} />
                  <Typography className={`flex-1 text-secondary`}>
                    Riassunto dell'ordine
                  </Typography></div>
                {pendingOrder?.line_items.map((item: any, i: number) => (
                  <Box key={item.id} className={"flex items-center w-full gap-4 mb-8"}>
                    <DisplayImage
                      src={item.image.src}
                      width="64px"
                      height="64px"
                      objectFit={"cover"}
                      borderRadius={"5px"}
                    />
                    <div className={"space-y-1"}>
                      <div className={"flex gap-2"}>
                        <Typography variant="h4" fontWeight={500}>
                          {item.name}
                        </Typography>
                        <Typography variant="h4" fontWeight={500} color="textSecondary">
                          {artworks[i]?.artistName}
                        </Typography>
                      </div>
                      <div className={"flex gap-2 text-xs text-secondary"}>
                        <Typography variant="body1" color="textSecondary">
                          {artworks[i]?.technique}
                        </Typography>
                        {artworks[i].technique && artworks[i].dimensions && "|"}
                        <Typography variant="body1" color="textSecondary">
                          {artworks[i]?.dimensions}
                        </Typography>
                      </div>
                    </div>

                  </Box>
                ))}
                <div className={"flex flex-col space-y-4"}>
                  <div>
                    <Typography variant="body1" color="textSecondary" className={'block'} mb={0.5}>
                      Venditore
                    </Typography>
                    <Typography variant="body1">
                      {artworks[0]?.galleryName}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body1" color="textSecondary" className={'block'} mb={0.5}>
                      Prezzo
                    </Typography>
                    <Typography variant="body1">
                      € {subtotal.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className={'flex flex-col space-y-8 mb-6'}>
                <div className={'flex space-x-2 items-center pt-4'}>
                  <UserIcon className={'size-4'} />
                  <Typography className={`flex-1 text-secondary`}>
                   Informazioni di contatto
                  </Typography></div>
                <div className={"flex flex-col space-y-4"}>
                  <div className={"flex flex-col gap-2 p-6 bg-[#FAFAFB] rounded-lg "}>
                    <Typography variant="body1">
                      Informazioni personali
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {userProfile?.first_name || "Nome e Cognome"} {userProfile?.last_name || ""}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {userProfile?.email || "Email"}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {userProfile?.shipping?.phone || "Telefono"}
                    </Typography>
                    <Link to={"/profile/settings-profile"} className={'text-primary underline block font-light mt-4'}>Modifica</Link>
                  </div>
                </div>
              </div>
            </>
          )}
          <PaymentProviderCard className={'w-full mb-6'} backgroundColor={"bg-[#FAFAFB]"}>
            <p className={"flex gap-2"}>
              <button
                className={`${
                  requireInvoice ? "bg-primary" : "bg-gray-300"
                } rounded-full border border-gray-300 px-3 cursor-pointer relative`}
                onClick={() => handleRequireInvoice(!requireInvoice)}
                disabled={isSaving}>
                  <span
                    className={`block absolute rounded-full size-3 bg-white top-1/2 -translate-y-1/2 transition-all ${
                      requireInvoice ? "right-0 -translate-x-full" : "left-0 translate-x-full"
                    }`}
                  />
              </button>
              Hai bisogno di una fattura?
            </p>
          </PaymentProviderCard>

          {children}

          {showBillingSection && (
            <>
              {orderMode !== "loan" && (
                <div className={"bg-[#FAFAFB] p-4 rounded-lg"}>
                  <Typography variant="h6" sx={{ mb: 4 }} color="textSecondary">
                    Dati di spedizione
                  </Typography>
                  {userProfile &&
                    (shippingDataEditing ? (
                      <ShippingDataForm
                        defaultValues={userProfile.shipping}
                        onSubmit={(formData) => handleProfileDataSubmit(formData, false)}
                      />
                    ) : (
                      <ShippingDataPreview value={userProfile.shipping} />
                    ))}
                </div>
              )}
              <PaymentProviderCard
                backgroundColor={"bg-[#FAFAFB]"}
                className={"mt-6"}
                cardTitle={"Dati fatturazione"}
                disabled={!requireInvoice}
                button={
                  <button
                    onClick={() => setShippingDataEditing(!shippingDataEditing)}
                    disabled={!requireInvoice}
                    className={"font-normal text-primary underline cursor-pointer disabled:cursor-not-allowed"}>
                    {shippingDataEditing ? "Annulla" : "Modifica"}
                  </button>
                }>
                {shippingDataEditing ? (
                  <BillingDataForm
                    disabled={isSaving}
                    defaultValues={userProfile?.billing}
                    shippingData={userProfile?.shipping}
                    isOnlyCDS={true}
                    onSubmit={(formData) => handleProfileDataSubmit({ ...formData, email: userProfile?.email })}
                  />
                ) : (
                  <BillingDataPreview value={userProfile?.billing} />
                )}
              </PaymentProviderCard>
            </>
          )}
        </main>
      </div>
      <footer className={"p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary"}>
        <section className={"md:max-w-xl lg:max-w-4xl mx-auto"}>
          <p>© artpay srl 2024 - Tutti i diritti riservati</p>
          <div className={"flex items-center gap-4 border-b border-gray-300 py-8 flex-wrap"}>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Privacy Policy">
              Privacy Policy
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
              title="Cookie Policy">
              Cookie Policy
            </a>
            <NavLink to="/termini-e-condizioni" className={"underline-none text-primary"}>
              Termini e condizioni
            </NavLink>
            <NavLink to="/condizioni-generali-di-acquisto" className={"underline-none text-primary"}>
              Condizioni generali di acquisto
            </NavLink>
          </div>
          <div className={"pt-8"}>
            <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default DirectPurchaseLayout;