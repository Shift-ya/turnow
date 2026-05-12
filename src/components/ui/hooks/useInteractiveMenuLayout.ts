import { useEffect, useRef, useState } from 'react';

export type IndicatorStyle = {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
};

export function useInteractiveMenuLayout(finalItemsLength: number, safeActiveIndex: number) {
  const menuRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);

  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const [menuOffsetStyle, setMenuOffsetStyle] = useState<React.CSSProperties>({
    '--menu-shift': '0px',
  } as React.CSSProperties);

  useEffect(() => {
    const setLayoutMetrics = () => {
      const activeItemElement = itemRefs.current[safeActiveIndex];
      const activeTextElement = textRefs.current[safeActiveIndex];
      const menuElement = menuRef.current;

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        try {
          activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
        } catch (e) {
          // noop
        }
      }

      if (activeItemElement && menuElement) {
        const itemRect = activeItemElement.getBoundingClientRect();
        const menuRect = menuElement.getBoundingClientRect();
        const tabsElement = tabsRef.current;
        const tabsRect = tabsElement?.getBoundingClientRect();
        const shift =
          tabsRect && finalItemsLength > 0
            ? Math.round(
                (safeActiveIndex + 0.5) / finalItemsLength * tabsRect.width - itemRect.width / 2 - (itemRect.left - tabsRect.left),
              )
            : 0;

        setIndicatorStyle({
          left: itemRect.left - menuRect.left,
          top: itemRect.top - menuRect.top,
          width: itemRect.width,
          height: itemRect.height,
          opacity: 1,
        });

        setMenuOffsetStyle({
          '--menu-shift': `${shift}px`,
        } as React.CSSProperties);
      }
    };

    setLayoutMetrics();

    window.addEventListener('resize', setLayoutMetrics);
    return () => {
      window.removeEventListener('resize', setLayoutMetrics);
    };
  }, [safeActiveIndex, finalItemsLength]);

  return {
    menuRef,
    tabsRef,
    itemRefs,
    textRefs,
    indicatorStyle,
    menuOffsetStyle,
  } as const;
}
