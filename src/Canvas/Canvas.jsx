import useCanvas from "./useCanvas";

const Canvas = (props) => {
  const { draw } = props;
  const ref = useCanvas(draw);

  return <canvas ref={ref} />;
};

export default Canvas;
