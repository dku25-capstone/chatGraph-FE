import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// 브라우저 창의 너비 기준으로 모바일 환경인지 확인하는 커스텀 훅
export function useIsMobile() {
  // 화면이 모바일 사이즈인지 여부
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
