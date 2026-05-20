import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";

const RedTextAdd = ({ title }: { title: string }) => {
  return (
    <JsxComponentSetter
      title={title}
      iconSrc={"src/assets/red-text.svg"}
      tsx={{
        name: "RedText",
        kind: "text",
        hasChildren: false,
        props: [],
      }}
    />
  );
};
export default RedTextAdd;
