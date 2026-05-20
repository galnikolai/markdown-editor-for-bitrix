const NewsPageButton = ({
  buttonText,
  link,
}: {
  buttonText: string;
  link: string;
}) => {
  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    }}>
      <div
        style={{
          background: "#C3AD26",
          color: "#172C15",
          padding: "22px 40px",
          borderRadius: "90px",
        }}
      >
        {buttonText}
      </div>
      <div>{link}</div>
    </div>
  );
};

export default NewsPageButton
