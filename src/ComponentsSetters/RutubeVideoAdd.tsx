import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";

const RutubeVideoAdd = ({ title }: { title: string }) => {
  return (
    <JsxComponentSetter
      title={title}
      iconSrc={"src/assets/rutube.svg"}
      tsx={{
        name: "RutubeVideo",
        kind: "flow",
        hasChildren: false,
        props: [{name: 'id', default: ''}],
      }}
    />
  );
};
export default RutubeVideoAdd;
