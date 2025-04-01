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
      <div id={'brevo-form'} className={`${isLoad ? "" : "hidden"} lg:min-w-md xl:w-xl sticky top-37.5 mb-12`}>
        <iframe
          ref={inputRef}
          onLoad={handleLoad}
          className={'border border-[#CDCFD3] rounded-3xl w-full shadow-custom'}
          width={400}
          height={isMobile ? 720 : 600}
          src="https://51f5628d.sibforms.com/serve/MUIFACzH81fN_G8Cl_THyAULRJHiaBK_jrc8_OvjUx27o-a3_2As6Mo-CXjqb1bVmzFHuXHCRu4K80zq-g8zydPteSosFAuMdgBhGHilcM5QhkOmAdyOxzKVWylqlt2GW5LNO1Oxz4IHnVcfx5zH0iCfTKEdszqwDQgwFa3derhqxsan4BcfhGsSf1wZjXrffqallgyHAPn3jVDw"
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