import { useRef, useState } from "react";
import FormSkeleton from "../../../../components/FormSkeleton.tsx";
import { useMediaQuery, useTheme } from "@mui/material";

const BrevoForm = () => {
  const inputRef = useRef<HTMLIFrameElement>(null);
  const [isLoad, setIsLoad] = useState<boolean>(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleLoad = () => {
    setIsLoad(true)
  }

  return (
    <>
      {!isLoad && <FormSkeleton />}
      <div id={'brevo-form'} className={`${isLoad ? "" : "hidden"} lg:min-w-md xl:w-xl sticky top-37.5 mb-12 max-w-lg`}>
        <iframe
          ref={inputRef}
          onLoad={handleLoad}
          className={'border border-[#CDCFD3] rounded-3xl w-full shadow-custom'}
          width={400}
          height={isMobile ? 720 : 600}
          src="https://51f5628d.sibforms.com/serve/MUIFAB6QSxF0CrGWDiuqxTMnXL1j0-Y0w15NePddNu7kui2e3cMT-uAIQ99vvSFlL3hHuXlmEfzI-V9ORKOjHA_79mw34tfUThoLdxsXLIyfA8UmuuuS5gO6Y1cjbsJli97VMbUjFZEKYy4UZCh5TUPrENmS7Lf4EOS0LciA8J_NU3_LLfB2SVbMIH1DXtm47aUwhjIE6Tf_baTp"
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