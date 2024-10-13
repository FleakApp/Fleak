import type { PropsWithChildren } from "react";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation } from "@remix-run/react";

import { useMediaQuery } from "@fleak-org/ui";

interface LayoutContextInterface {
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
}

interface LayoutProviderInterface {
  defaultOpen?: boolean;
}

const LayoutContext = createContext<LayoutContextInterface>(
  {} as LayoutContextInterface,
);

export const useLayout = (): LayoutContextInterface => {
  const layout = useContext(LayoutContext);

  if (!layout) {
    throw new Error("Error in creating the layout context");
  }

  return layout;
};

export const LayoutProvider = ({
  children,
  defaultOpen = true,
}: PropsWithChildren<LayoutProviderInterface>) => {
  const [isLeftPanelOpen, setLeftPanelOpen] = useState(defaultOpen);
  const [isRightPanelOpen, setRightPanelOpen] = useState(defaultOpen);

  const location = useLocation();

  const isDesktop = useMediaQuery("(min-width: 1280px)");

  useEffect(() => {
    setLeftPanelOpen(() => isDesktop);
    setRightPanelOpen(() => isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    setLeftPanelOpen(() => (!isDesktop ? false : true));
    setRightPanelOpen(() => (!isDesktop ? false : true));
  }, [location, isDesktop]);

  return createElement(
    LayoutContext.Provider,
    {
      value: {
        toggleLeftPanel: () =>
          setLeftPanelOpen((previousState) => !previousState),
        toggleRightPanel: () =>
          setRightPanelOpen((previousState) => !previousState),
        isLeftPanelOpen,
        isRightPanelOpen,
      },
    },
    children,
  );
};
