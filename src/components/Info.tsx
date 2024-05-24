import { useState } from "react";

const Minus = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
};
const Plus = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
};

export default function Info() {
  const [open, setOpen] = useState(true);

  return (
    <aside className="absolute bg-[#CFCFCF] rounded-xl bottom-4 right-4 w-80 px-4 py-2">
      <h3 className="font-semibold text-xl flex w-full items-center justify-between">
        <span>Info:</span>
        <button
          onClick={() => {
            setOpen(!open);
          }}
        >
          {open ? <Minus /> : <Plus />}
        </button>
      </h3>
      {open ? (
        <ul>
          <li>
            &bull; How does it work? Upload an image, tweak the inputs, download
            the result.
          </li>
          <li>&bull; I don't plan on adding anything else, for now.</li>
          <li>
            &bull; Everything is done client-side + open-source so don't have
            trust issues.
          </li>
          <li>&bull; It supports JPG/JPEG, and PNG for now.</li>
        </ul>
      ) : null}
    </aside>
  );
}
