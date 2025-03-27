import { useState } from "react";
import FormSkeleton from "../../../../components/FormSkeleton.tsx";

const BrevoForm = () => {

  const [isLoad, setIsLoad] = useState<boolean>(false)

  const handleLoad = () => {
    setIsLoad(true)
  }

  return (
    <>
      {!isLoad && <FormSkeleton />}
      <div id={'brevo-form'} className={`${isLoad ? "" : "hidden"} lg:min-w-md xl:w-xl sticky top-37.5 mb-12`}>
        <iframe
          onLoad={handleLoad}
          className={'border border-[#CDCFD3] rounded-3xl w-full shadow-custom'}
          width={400}
          height={580}
          src="https://51f5628d.sibforms.com/serve/MUIFACNgGrBHfoqFH4d5pJ9R0sh4e7hFHxBzQ7y-72qTA_B8J0DdMck17CtI56ZykRrxOkluPkoEHjZc6hBFnp0mnrg8ydermGZ8Wd4lJa799Zz2bn86ppow-s_fvPq0dcvYIwt_mf5yWsEMinQr6YC87MPzBN-SFG7NUqjaoopymMIDP6KUQ2nUdLlRvJCAA6EJTr7dl85Jn0qz"
          style={{
            display: "block",
            padding: 0,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "100%",
            maxHeight: "100%",
          }}></iframe>
      </div>
    </>
  );
};

export default BrevoForm;