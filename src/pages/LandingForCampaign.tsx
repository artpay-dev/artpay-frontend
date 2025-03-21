import React, {useState } from "react";
import Logo from "../components/icons/Logo.tsx";
import {useMediaQuery, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";
import FormSkeleton from "../components/FormSkeleton.tsx";
import LandingCampaignCopy from "../features/landingcampaign/LandingCampaignCopy.tsx";


const LandingForCampaign: React.FC = () => {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const [isLoad, setIsLoad] = useState<boolean>(false)

  const handleLoad = () => {
    setIsLoad(true)
  }

  return (
    <div className={"min-h-screen flex flex-col "}>
      <header className={"fixed w-full z-50 top-6 px-6"}>
        <nav className={"p-4 custom-navbar flex justify-center w-full mx-auto bg-white "}>
          <Logo />
        </nav>
      </header>
      <main className={"flex-1 flex flex-col w-full mx-auto justify-center items-center pt-32 pb-12 px-6 md:px-12"}>
        <LandingCampaignCopy />
        <section className={"relative flex flex-col items-center w-full lg:flex-row lg:items-start lg:mt-12"}>
          <aside className={"space-y-12 flex-1 flex flex-col justify-center px-6 py-12 relative"}>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scopri il potenziale di <span className="text-primary">ArtPay</span> per la tua galleria
              </h2>
              <p className="text-gray-700 mb-6">
                Unisciti alle gallerie che stanno già aumentando le vendite grazie a ArtPay.
              </p>
              <p className=" px-6 py-3 rounded-lg text-lg font-semibold shadow-md ">
                🔹 Prenota ora una demo gratuita di 30 minuti
              </p>
            </div>
          </aside>
          <aside>
            {!isLoad && <FormSkeleton />}
            <div className={`${isLoad ? '' : 'hidden'}`}>
              <iframe
                onLoad={handleLoad}
                width={isTablet ? '380' : '640'}
                height={isDesktop ? "680" : "800"}
                src="https://51f5628d.sibforms.com/serve/MUIFAOOychgXKHhJrsvdnWYHLSF5a3S43MQfVqduZFrPQQqKjZenRwU5UxpwyIEFe1OANsXdFjXY1tVVOfvcjtaG9cCBjSm0mWl_qRagqmKuraJn6bXzl_InVjagNSf8-RxYTlkxx_mc4hJlFbSKrLYHFX3nfvoTJG0E1__1kP6rKG7WMXFShgBkGdCmYe-i7HJYRdbiRfoxuf80"
                frameBorder="0"
                scrolling="auto"
                allowFullScreen
                style={{
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}></iframe>
            </div>
          </aside>
          <div className={'absolute bottom-0 left-0 -z-10 hidden lg:block'}>
            <svg width="602" height="182" viewBox="0 0 602 182" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g >
                <path d="M199.425 166.285C199.017 162.185 200.305 158.216 201.711 155.953C202.566 154.572 203.285 154.126 203.498 154.126H203.51C204.492 154.2 205.598 155.523 205.675 157.527C205.732 159.007 205.242 161.944 201.31 164.99C200.729 165.44 200.101 165.873 199.425 166.285ZM148.194 128.894C148.466 126.552 147.713 124.198 146.135 122.439C144.554 120.677 142.287 119.668 139.912 119.668H122.453C112.134 119.668 104.705 115.846 100.374 108.305C97.1125 102.626 96.9038 96.8442 96.9015 96.7856C96.8857 96.2473 95.3118 42.8532 96.7655 21.5203C97.3506 12.9475 101.544 7.03033 109.229 3.93323C114.103 1.9691 118.926 1.80467 120.412 1.80467C120.704 1.80467 120.867 1.81142 120.876 1.81142H258.347C267.472 1.81142 274.305 4.10892 278.657 8.63632C283.898 14.0917 283.637 21.009 283.633 21.0766V21.1306C283.639 21.7455 284.304 82.8363 283.633 103.043C283.363 111.127 279.646 116.754 272.584 119.767C267.218 122.058 261.83 121.921 261.778 121.918H192.205C190.109 121.918 188.107 122.693 186.565 124.099C180.07 130.025 163.563 144.765 144.697 159.16L148.194 128.894ZM557.859 141.165C516.842 157.138 486.129 164.291 469.039 161.847C449.564 159.063 437.959 153.405 426.736 147.934C413.932 141.693 401.838 135.798 379.8 135.433C357.941 135.068 327.378 147.008 297.815 158.552C271.178 168.952 246.019 178.775 227.33 180.034C214.041 180.93 205.036 178.144 201.29 171.981C200.548 170.763 200.049 169.483 199.743 168.193C200.723 167.634 201.616 167.039 202.426 166.411C206.995 162.872 207.56 159.282 207.487 157.457C207.383 154.694 205.732 152.489 203.648 152.329C202.217 152.223 200.961 153.725 200.167 155.007C198.523 157.656 197.028 162.408 197.727 167.235C193.838 169.224 188.688 170.72 182.351 171.691C167.554 173.961 157.941 171.26 152.482 168.596C147.516 166.17 144.994 163.332 144.312 162.483L144.409 161.649C163.91 146.88 181.12 131.514 187.792 125.425C188.998 124.326 190.565 123.72 192.205 123.72H261.735C262.148 123.734 267.613 123.833 273.244 121.448C278.607 119.173 285.079 114.145 285.445 103.101C286.113 83.0187 285.463 22.6938 285.447 21.1374C285.472 20.5427 285.644 13.3191 279.991 7.4155C275.285 2.50291 268.003 0.00946045 258.347 0.00946045H120.935C120.457 -0.00854492 114.663 -0.184235 108.603 2.24165C102.814 4.55716 95.7473 9.76256 94.9558 21.3987C93.4953 42.8171 95.0714 96.3014 95.0873 96.8374C95.0941 97.0875 95.3005 103.07 98.7611 109.136C101.975 114.762 108.692 121.47 122.453 121.47H139.912C141.77 121.47 143.543 122.261 144.779 123.637C146.017 125.015 146.604 126.856 146.391 128.689L142.695 160.681C142.103 161.127 141.509 161.573 140.912 162.019C128.056 171.628 113.726 172.371 103.97 171.303C93.3389 170.141 85.6602 166.636 85.5853 166.6L85.5173 166.569L85.4447 166.551C84.6624 166.334 6.83224 144.853 -22.125 139.503C-39.7116 136.253 -58.9832 141.028 -81.3004 146.56C-96.5172 150.331 -113.766 154.604 -133.3 157.063C-157.885 160.158 -173.88 151.883 -182.969 144.395C-186.666 141.352 -189.553 138.188 -191.721 135.415V138.305C-189.711 140.672 -187.221 143.226 -184.196 145.727C-178.227 150.657 -171.41 154.327 -163.931 156.633C-154.602 159.507 -144.22 160.255 -133.071 158.852C-113.43 156.378 -96.1271 152.09 -80.8604 148.308C-58.7496 142.828 -39.6549 138.095 -22.4584 141.274C6.04532 146.542 82.1542 167.512 84.8891 168.267C85.7373 168.652 93.2209 171.932 103.712 173.087C110.129 173.797 116.33 173.549 122.142 172.355C129.424 170.859 136.105 167.866 142.003 163.458C142.171 163.334 142.339 163.208 142.507 163.082L142.62 163.246C142.727 163.402 145.294 167.06 151.555 170.15C157.261 172.965 167.28 175.826 182.628 173.472C188.908 172.508 194.085 171.031 198.099 169.064C198.45 170.373 198.981 171.67 199.736 172.914C201.65 176.063 204.741 178.434 208.921 179.959C212.638 181.318 217.23 182 222.616 182C224.162 182 225.777 181.944 227.453 181.831C246.421 180.554 271.706 170.681 298.477 160.228C327.877 148.749 358.274 136.881 379.77 137.235C401.403 137.593 413.32 143.402 425.938 149.554C437.286 155.086 449.022 160.805 468.781 163.631C478.521 165.023 492.352 163.453 509.891 158.969C523.865 155.394 540.232 149.966 558.535 142.839C575.656 136.17 591.322 129.228 602.001 124.306V122.319C591.338 127.248 575.362 134.35 557.859 141.165Z" fill="#3F55E9"/>
              </g>
              <defs>
                <clipPath id="clip0_150_487">
                  <rect width="794" height="182" fill="white" transform="translate(-192)"/>
                </clipPath>
              </defs>
            </svg>
          </div>
        </section>
      </main>
      <footer className={"p-6 pt-8 w-full bg-[#FAFAFB] text-xs text-secondary"}>
        <section className={'max-w-[1344px] mx-auto'}>
          <p>© artpay srl 2024 - Tutti i diritti riservati</p>
          <div className={'flex flex-col items-center gap-4 border-b border-gray-300 py-8 md:flex-row'}>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
              title="Privacy Policy ">
              Privacy Policy
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
              title="Cookie Policy ">
              Cookie Policy
            </a>
            <NavLink to="/termini-e-condizioni" className={'underline-none text-primary'}>
              Termini e condizioni
            </NavLink>

            <NavLink to="/condizioni-generali-di-acquisto" className={'underline-none text-primary'}>
              Condizioni generali di acquisto
            </NavLink>
          </div>
          <div className={'pt-8'}>
            <p>Artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita IVA 04065160923</p>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default LandingForCampaign;
