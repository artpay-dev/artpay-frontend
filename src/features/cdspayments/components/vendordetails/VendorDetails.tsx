import { Gallery } from "../../../../types/gallery.ts";
import { useEffect, useRef, useState } from "react";

type VendorDetailsProps = {
  vendor: Gallery | null;
}

const VendorDetails = ({vendor}: VendorDetailsProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0)

  const handleExpanded = () => {
    setIsExpanded(!isExpanded);
  };


  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, []);

  return (
    <article className="border-t border-secondary pt-6 mt-24 space-y-3">
      <div className={'flex items-center space-x-2'}>
        <div className="min-h-12 max-h-12 min-w-12 max-w-12 overflow-hidden p-1 border border-gray-200 rounded-md">
          <img src={vendor?.shop.image} alt={vendor?.name} width={100} height={100} className="border border-gray-200 w-full h-full aspect-square object-cover" />
        </div>
        <h4 className={'text-2xl'}>
          {vendor?.display_name}
        </h4>
      </div>
      <p ref={contentRef}
        className={`${isExpanded ? contentHeight : 'line-clamp-3'} overflow-hidden leading-5 mt-4`}>
        {vendor?.message_to_buyers}
      </p>
      {contentRef.current && contentRef.current.scrollHeight >= 80 && (
        <button className={"text-secondary mt-2 text-sm cursor-pointer self-start "} onClick={handleExpanded} name={"Mostra"}>
          {isExpanded ? "Mostra meno" : "Mostra altro"}
        </button>
      )}
    </article>
  );
};

export default VendorDetails;