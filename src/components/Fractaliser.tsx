import { useEffect, useRef, useState, type ChangeEventHandler } from "react";
import * as StackBlur from "stackblur-canvas";

const getObjectFitSize = (
  contains: boolean,
  containerWidth: number,
  containerHeight: number,
  width: number,
  height: number
) => {
  const doRatio = width / height;
  const cRatio = containerWidth / containerHeight;
  let targetWidth = 0;
  let targetHeight = 0;
  const test = contains ? doRatio > cRatio : doRatio < cRatio;

  if (test) {
    targetWidth = containerWidth;
    targetHeight = targetWidth / doRatio;
  } else {
    targetHeight = containerHeight;
    targetWidth = targetHeight * doRatio;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    x: (containerWidth - targetWidth) / 2,
    y: (containerHeight - targetHeight) / 2,
  };
};

const brightnessAdjustment = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  multiplier: number
) => {
  const iD = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const dA = iD.data; // raw pixel data in array

  for (let i = 0; i < dA.length; i += 4) {
    const red = dA[i]; // Extract original red color [0 to 255]
    const green = dA[i + 1]; // Extract green
    const blue = dA[i + 2]; // Extract blue

    let brightenedRed = multiplier * red;
    let brightenedGreen = multiplier * green;
    let brightenedBlue = multiplier * blue;

    /**
     *
     * Remember, you should make sure the values brightenedRed,
     * brightenedGreen, and brightenedBlue are between
     * 0 and 255. You can do this by using
     * Math.max(0, Math.min(255, brightenedRed))
     *
     */

    dA[i] = brightenedRed;
    dA[i + 1] = brightenedGreen;
    dA[i + 2] = brightenedBlue;
  }

  ctx.putImageData(iD, 0, 0);
};

export default function Fractaliser() {
  const [image, setImage] = useState<File>();
  const [imageUrl, setImageUrl] = useState("");
  const [blur, setBlur] = useState("0");
  const [brightness, setBrightness] = useState("100");
  const [parts, setParts] = useState(25);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const render = (optionalUrl?: string) => {
    const img = new Image();
    img.src = imageUrl || optionalUrl || "";
    img.style.filter = `blur(${blur}px)`;
    img.onload = () => {
      const dimensions = getObjectFitSize(
        true,
        canvas.current?.clientWidth ?? 0,
        canvas.current?.clientHeight ?? 0,
        canvas.current?.width ?? 0,
        canvas.current?.height ?? 0
      );

      const dpr = window.devicePixelRatio || 1;
      if (canvas.current) {
        canvas.current.width = dimensions.width * dpr;
        canvas.current.height = dimensions.height * dpr;
      }

      const ctx = canvas.current?.getContext("2d");
      ctx?.scale(1, 1);

      const widthOfOne = (img.width ?? 0) / parts;
      const canvasWidthOfOne = (canvas.current?.width ?? 0) / parts;

      ctx?.drawImage(
        img,
        0,
        0,
        widthOfOne,
        img.height ?? 0,
        0,
        0,
        canvasWidthOfOne,
        canvas.current?.height ?? 0
      );
      for (let i = 1; i <= parts; i++) {
        ctx?.drawImage(
          img,
          i * widthOfOne - i * (1000 / parts),
          0,
          widthOfOne,
          img.height ?? 0,
          i * canvasWidthOfOne,
          0,
          canvasWidthOfOne,
          canvas.current?.height ?? 0
        );
      }

      StackBlur.canvasRGBA(
        canvas.current!,
        0,
        0,
        canvas.current?.width ?? 0,
        canvas.current?.height ?? 0,
        Number(blur)
      );
      brightnessAdjustment(canvas.current!, ctx!, Number(brightness) / 100);
    };
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setImage(e.target?.files?.[0]);

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result?.toString() ?? "");
      render(reader.result?.toString() ?? "");
    };
    reader.readAsDataURL(e.target?.files?.[0]!);
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = canvas.current?.toDataURL() ?? "";
    link.download = "image-fractalised.png";
    link.click();
    link.remove();
  };

  useEffect(() => {
    render();
  }, [blur, parts, brightness]);

  return image ? (
    <div className="flex items-center gap-4">
      <canvas
        ref={canvas}
        className="w-full min-w-0 h-[calc(100vh-136px)] p-4"
      ></canvas>
      <div className="flex flex-col gap-4 min-w-96 pr-4">
        <div className="flex flex-col gap-1">
          <label>Glass count:</label>
          <input
            className="bg-[#cfcfcf] rounded-xl px-4 py-2 outline-none"
            placeholder="Glass count"
            type="range"
            min="10"
            max="100"
            value={parts.toString()}
            onChange={(e) => setParts(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Blur:</label>
          <input
            className="bg-[#cfcfcf] rounded-xl px-4 py-2 outline-none"
            placeholder="Blur amount"
            type="range"
            min="0"
            max="10"
            value={blur}
            onChange={(e) => setBlur(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Brightness:</label>
          <input
            className="bg-[#cfcfcf] rounded-xl px-4 py-2 outline-none"
            placeholder="Brightness level"
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(e.target.value)}
          />
        </div>
        <button
          className="px-4 py-2 bg-[#cfcfcf] rounded-xl text-[#282828] font-semibold"
          onClick={download}
        >
          Download
        </button>
        <button
          className="px-4 py-2 bg-[#cfcfcf] rounded-xl text-[#282828] font-semibold"
          onClick={() => {
            setBlur("0");
            setBrightness("100");
            setParts(25);
          }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  ) : (
    <>
      <button
        className="border-2 border-dashed px-4 py-2 rounded-xl hover:bg-[#f0f0f0] hover:text-[#282828] transition ease-in-out duration-200"
        onClick={() => inputRef.current?.click()}
      >
        Upload image
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
}
