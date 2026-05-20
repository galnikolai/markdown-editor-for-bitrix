import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";

const QuoteAdd = ({ title }: { title: string }) => {
  return (
    <JsxComponentSetter
      title={title}
      iconSrc={"src/assets/quote.svg"}
      tsx={{
        name: "QuotePersonBlock",
        kind: "text",
        hasChildren: false,
        props: [],
      }}
    />
  );
};
export default QuoteAdd;
