import useToolTipStore from "../../../stores/tooltipStore.ts";

type ToolTipType = "success" | "error" | "info";

const typeStyles : Record<ToolTipType, string> = {
  success: 'bg-[#42B396] text-white',
  error: 'bg-red-600 text-red-50',
  info: 'bg-[#F5F5F5] text-[#010F22]',
}

const ToolTip = () => {
  const { visible, message, type, showToolTip } = useToolTipStore();
  const toolTipBackground = typeStyles[type];

  if (visible) {
    setTimeout(() => showToolTip({
      message: "",
      visible: false,
      type: "success",
    }), 3000);
  }

  return (
    visible && (
      <div className={`${toolTipBackground} animate-fade-in-scale rounded-lg p-3 fixed top-30 right-8 z-50 flex gap-2 items-center font-normal shadow-lg`}>
        <span>
          <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15.5 3.08617V9.26117C15.5 10.9413 14.4783 12.0068 12.8134 12.0068H7.11173L4.55061 14.2768C4.40701 14.4127 4.28374 14.5 4.13056 14.5C3.92659 14.5 3.78724 14.3443 3.78724 14.0939V12.0068H3.18667C1.51667 12.0068 0.5 10.959 0.5 9.26117V3.08617C0.5 1.38313 1.51667 0.333344 3.18667 0.333344H12.8134C14.4783 0.333344 15.5 1.40076 15.5 3.08617ZM7.48377 9.05132C7.48377 9.3288 7.71847 9.57483 8.00451 9.57483C8.28861 9.57483 8.52331 9.33087 8.52331 9.05132C8.52331 8.76341 8.29056 8.52271 8.00451 8.52271C7.7165 8.52271 7.48377 8.76548 7.48377 9.05132ZM7.65951 3.1717L7.71057 7.12341C7.71255 7.33474 7.82564 7.46623 8.00451 7.46623C8.17747 7.46623 8.29056 7.33674 8.29258 7.12341L8.35267 3.17372C8.34956 2.96243 8.21271 2.81386 8.00256 2.81386C7.79039 2.81386 7.65753 2.96041 7.65951 3.1717Z"
              fill={`${type == "info" ? "#42B396" : "currentColor"}`}
            />
          </svg>
        </span>
        <p>{message}</p>
      </div>
    )
  );
};

export default ToolTip;
