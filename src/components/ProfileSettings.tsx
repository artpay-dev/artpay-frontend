import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { UserProfile } from "../types/user.ts";
import { Button, } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProfileSettings: React.FC = ({}) => {
  const data = useData();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile>();
  const [requireInvoice, setRequireInvoice] = useState(false);




  useEffect(() => {

      data.getUserProfile().then((resp) => {
        setProfile(resp);
        setRequireInvoice(resp.billing?.invoice_type !== "");
      })
  }, [data]);
  

  return (
    <section className="space-y-6 mb-24">
      <div className="pb-6 flex flex-col md:flex-row justify-between md:items-center border-b border-[#CDCFD3] items-start gap-6 mt-24">
        <div className="space-y-4">
          <h5 className={'text-secondary'}>
            Impostazioni personali
          </h5>
          <div>
            <ul className={'space-y-1'}>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Nome:</span>
                <span>{profile?.first_name || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Cognome:</span>
                <span>{profile?.last_name || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Password:</span>
                <span>*******</span>
              </li>
            </ul>
          </div>
        </div>
        <Button variant={'outlined'} onClick={() => navigate("/profile/personal-settings")}>Modifica</Button>
      </div>
      <div className="pb-6 flex flex-col md:flex-row justify-between md:items-center border-b border-[#CDCFD3] items-start gap-6 ">
        <div className="space-y-4">
          <h5 className={'text-secondary'}>
            Dati di spedizione
          </h5>
          <div>
            <ul className={'space-y-1'}>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Nome:</span>
                <span>{profile?.first_name || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Cognome:</span>
                <span>{profile?.last_name || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Telefono:</span>
                <span>{profile?.shipping.phone || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Indirizzo:</span>
                <span>{profile?.shipping.address_1 || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Città:</span>
                <span>{profile?.shipping.city || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>CAP:</span>
                <span>{profile?.shipping.postcode || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Provincia:</span>
                <span>{profile?.shipping.state || ""}</span>
              </li>
              <li className={'flex gap-2 leading-[125%]'}>
                <span>Paese:</span>
                <span>{profile?.shipping.country || ""}</span>
              </li>
            </ul>
          </div>
        </div>
        <Button variant={'outlined'} onClick={() => navigate("/profile/shipping-invoice-settings")}>Modifica</Button>
      </div>


      {requireInvoice && (
        <div className="pb-6 flex flex-col md:flex-row justify-between md:items-center border-b border-[#CDCFD3] items-start gap-6 ">
          <div className="space-y-4">
            <h5 className={'text-secondary'}>
              Dati di fatturazione
            </h5>
            <div>
              <ul className={'space-y-1'}>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>Ragione Sociale/ Nome e Cognome:</span>
                  <span>{profile?.billing.company || (profile?.first_name + " " + profile?.last_name) || ""}</span>
                </li>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>P.iva/Codice fiscale:</span>
                  <span>{profile?.billing.cf || ""}</span>
                </li>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>Telefono:</span>
                  <span>{profile?.billing.phone || ""}</span>
                </li>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>Indirizzo:</span>
                  <span>{profile?.billing.address_1 || ""}</span>
                </li>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>Città:</span>
                  <span>{profile?.billing.city || ""}</span>
                </li>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>CAP:</span>
                  <span>{profile?.billing.postcode || ""}</span>
                </li>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>Provincia:</span>
                  <span>{profile?.billing.state || ""}</span>
                </li>
                <li className={'flex gap-2 leading-[125%]'}>
                  <span>Paese:</span>
                  <span>{profile?.billing.country || ""}</span>
                </li>
              </ul>
            </div>
          </div>
          <Button variant={'outlined'} onClick={() => navigate("/profile/shipping-invoice-settings")}>Modifica</Button>
        </div>
      )}
    </section>
  );
};

export default ProfileSettings;
