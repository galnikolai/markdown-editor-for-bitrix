import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useContext,
} from "react";

interface IProps {
  children: ReactNode;
}

interface IContext {
  setDopSrcGlobal: (value: string) => void;
  dopSrcGlobal: string;
}

export const DopImgSrcGlobalContext = createContext<IContext>({
  setDopSrcGlobal: () => {},
  dopSrcGlobal: "",
});

// Хук для удобного использования контекста
export const useDopImgSrcGlobal = () => {
  const context = useContext(DopImgSrcGlobalContext);
  if (!context) {
    throw new Error("useDopImgSrcGlobal must be used within DopImgSrcProvider");
  }
  return context;
};

export const DopImgSrcProvider = ({ children }: IProps) => {
  const [dopSrc, setDopSrc] = useState<string>("");

  const handlerSetDopSrc = useCallback((value: string) => {
    setDopSrc(value);
  }, []);

  return (
      <DopImgSrcGlobalContext.Provider
          value={{
            setDopSrcGlobal: handlerSetDopSrc,
            dopSrcGlobal: dopSrc,
          }}
      >
        {children}
      </DopImgSrcGlobalContext.Provider>
  );
};