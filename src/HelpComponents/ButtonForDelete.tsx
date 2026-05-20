const ButtonForDelete = ({
  handleDelete,
}: {
  handleDelete: (e: React.MouseEvent) => void;
}) => {
  return (
    <button
      type="button"
      onClick={handleDelete}
      style={{
        position: "absolute",
        top: "-10px",
        right: "-10px",
        background: "#ff4444",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "24px",
        height: "24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        fontSize: "16px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 10,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#cc0000";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#ff4444";
        e.currentTarget.style.transform = "scale(1)";
      }}
      title="Удалить компонент"
    >
      ×
    </button>
  );
};

export default ButtonForDelete;
