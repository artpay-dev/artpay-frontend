import { useEffect } from "react";

const HotjarTracking = () => {
  useEffect(() => {
    if (typeof window !== "undefined" ) {
      (function (h: any, o: Document, t: string, j: string) {
        h.hj = h.hj || function () {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
        h._hjSettings = { hjid: 5304776, hjsv: 6 };
        const head = o.getElementsByTagName("head")[0];
        const script = o.createElement("script");
        script.async = true;
        script.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        head.appendChild(script);
      })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
    }
  }, []);

  return null;
};

export default HotjarTracking;
