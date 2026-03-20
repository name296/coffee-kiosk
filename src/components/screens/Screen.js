import React, { memo, useRef, useEffect } from "react";
import Process from "@/components/processes/Process";
import { Modal } from "@/components/modals/Modal";

/**
 * Screen – Process + Modal 자식으로 구성. 키보드 1·2·3·4로만 해당 영역에 포커스.
 */
const Screen = memo(() => {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);

  useEffect(() => {
    const map = { "1": ref1, "2": ref2, "3": ref3, "4": ref4 };
    const onKeyDown = (e) => {
      const ref = map[e.key];
      if (ref?.current) {
        ref.current.focus();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="screen">
        <div ref={ref1} className="screen-1" tabIndex={-1} aria-label="화면 1" />
        <div ref={ref2} className="screen-2" tabIndex={-1} aria-label="화면 2" />
        <div ref={ref3} className="screen-3" tabIndex={-1} aria-label="화면 3" />
        <div ref={ref4} className="screen-4" tabIndex={-1} aria-label="화면 4" />
      </div>
      <Process />
      <Modal />
    </>
  );
});

Screen.displayName = "Screen";
export default Screen;
