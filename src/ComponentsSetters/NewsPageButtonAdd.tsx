import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";

const NewsPageButtonAdd = ({ title }: { title: string }) => {
  return (
    <JsxComponentSetter
      title={title}
      iconSrc={"src/assets/button.svg"}
      tsx={{
        name: "NewsPageButton",
        kind: "flow",
        hasChildren: false,
        props: [{name: 'buttonText', default: 'Смотреть репортаж'}],
      }}
    />
  );
};
export default NewsPageButtonAdd;
