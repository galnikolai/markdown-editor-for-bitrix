import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";

const VkVideoAdd = ({ title }: { title: string }) => {
  return (
    <JsxComponentSetter
      title={title}
      iconSrc={"src/assets/vk.svg"}
      tsx={{
        name: "VkVideo",
        kind: "flow",
        hasChildren: false,
        props: [{name: 'id', default: ''}],
      }}
    />
  );
};
export default VkVideoAdd;
