interface Props {
  /** Only for whole-page waits. Inside a scroll area this would add a
   *  viewport-height blank gap below the content. */
  fullScreen?: boolean;
  size?: "sm" | "md";
}

const Loader = ({ fullScreen = false, size = "md" }: Props) => {
  const dimensions = size === "sm" ? "w-5 h-5 border-2" : "w-16 h-16 border-4";

  return (
    <div
      className={
        fullScreen
          ? "flex justify-center items-center h-screen"
          : "flex justify-center items-center"
      }
    >
      <div
        className={`${dimensions} border-blue-600 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Loader;
