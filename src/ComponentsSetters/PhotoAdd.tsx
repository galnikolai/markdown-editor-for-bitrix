import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";

const PhotoAdd = ({ title }: { title: string }) => {
  return (
    <JsxComponentSetter
      title={title}
      iconSrc={"src/assets/addPhoto.svg"}
      tsx={{
        name: "ImageWithCopyRight",
        kind: "flow",
        hasChildren: false,
        props: [],
      }}
    />
  );
};
export default PhotoAdd;
