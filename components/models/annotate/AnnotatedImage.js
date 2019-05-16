import React from "react";
import { Layer, Stage } from "react-konva";
import AnnotationImage from "./AnnotationImage";
import DeleteRectangleFab from "./DeleteRectangleFab";
import LabelMenu from "./LabelMenu";
import Rectangle from "./Rectangle";
import RectangleTransformer from "./RectangleTransformer";

const MIN_RECT_SIZE = 50;
const RECT_FILL = "#0080ff40";
const RECT_STROKE = "#0080ff";
const LABEL_COLORS = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#42d4f4",
  "#f032e6",
  "#bfef45",
  "#fabebe",
  "#469990",
  "#e6beff",
  "#9A6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#a9a9a9",
  "#ffffff",
  "#000000"
];

class AnnotatedImage extends React.Component {
  state = {
    mouseDraw: false,
    rectCount: 0,
    rectangles: {},
    selectedShapeName: "",
    showLabelMenu: false,
    mouseX: 0,
    mouseY: 0
  };

  handleStageMouseDown = e => {
    // Clicked on stage - clear selection
    if (e.target.className === "Image") {
      const stage = e.target.getStage();
      const mousePos = stage.getPointerPosition();
      const newRect = {
        x: mousePos.x,
        y: mousePos.y,
        width: 0,
        height: 0,
        stroke: RECT_STROKE,
        fill: RECT_FILL
      };
      this.setState({
        mouseDown: true,
        newRect: newRect,
        selectedShapeName: ""
      });
      return;
    }

    // Clicked on transformer - do nothing
    const parent = e.target.getParent();
    const clickedOnTransformer = parent && parent.className === "Transformer";
    if (clickedOnTransformer) {
      return;
    }

    // Find clicked rect by its name
    const name = e.target.name();
    const rect = this.props.rectangles[name];
    if (rect) {
      this.setState({
        selectedShapeName: name
      });
    } else {
      this.setState({
        selectedShapeName: ""
      });
    }
  };

  handleStageMouseMove = e => {
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();

    // Update new rectangle, if drawing any
    let { newRect } = this.state;
    if (newRect) {
      newRect.width = mousePos.x - newRect.x;
      newRect.height = mousePos.y - newRect.y;
      this.setState({ newRect, mouseDraw: true });
    }

    const mouseX = e.evt.clientX;
    const mouseY = e.evt.clientY;
    this.setState({ mouseX, mouseY });
  };

  isNewRectValid() {
    const { newRect } = this.state;
    return (
      newRect &&
      Math.abs(newRect.width) >= MIN_RECT_SIZE &&
      Math.abs(newRect.height) >= MIN_RECT_SIZE
    );
  }

  handleStageMouseUp = () => {
    const { newRect, mouseDraw } = this.state;
    const { labels } = this.props;

    // If rect is too small, enlarge it to minimum size
    if (mouseDraw && !this.isNewRectValid()) {
      newRect.width = newRect.width < 0 ? -MIN_RECT_SIZE : MIN_RECT_SIZE;
      newRect.height = newRect.height < 0 ? -MIN_RECT_SIZE : MIN_RECT_SIZE;
      this.setState({ newRect });
    }

    if (mouseDraw) {
      if (this.isNewRectValid()) {
        if (labels.length > 1) {
          this.setState({ showLabelMenu: true });
        } else {
          this.addNewRectangle(newRect, labels[0]);
        }
      } else {
        this.setState({ newRect: null });
      }
    }

    this.setState({ mouseDown: false });
  };

  triggerOnChange(rectangles) {
    const { src, onChange } = this.props;
    onChange(src, rectangles);
  }

  handleDeleteRectangle = e => {
    const { rectangles } = this.props;
    const { selectedShapeName } = this.state;

    // If there is no shape selected, do nothing
    if (!selectedShapeName) return;

    const { [selectedShapeName]: deletedRect, ...newRectangles } = rectangles;
    this.triggerOnChange(newRectangles);
  };

  handleRectangleDragMove = e => {
    this.updateSelectedRectangle(rect => {
      rect.x = e.target.x();
      rect.y = e.target.y();
    });
  };

  handleTransform = e => {
    const transformer = e.currentTarget;

    this.updateSelectedRectangle(rect => {
      rect.x = transformer.getX();
      rect.y = transformer.getY();
      // Workaround for Transformer bug when resizing with top-left handlers:
      // Store new width and height in different variables.
      rect.widthAfterResize = transformer.getWidth();
      rect.heightAfterResize = transformer.getHeight();
    });
  };

  handleLabelMenuClose = () => {
    this.setState({ newRect: null, showLabelMenu: false });
  };

  handleLabelMenuItemClick = label => {
    const { newRect } = this.state;
    this.addNewRectangle(newRect, label);
  };

  addNewRectangle(rect, label) {
    const { labels, rectangles } = this.props;

    const labelIndex = labels.indexOf(label);
    const labelColor = LABEL_COLORS[labelIndex % LABEL_COLORS.length];

    const newRectName = String(Object.keys(rectangles).length + 42);
    const newRectangles = {
      ...rectangles,
      [newRectName]: {
        ...rect,
        name: newRectName,
        label: label,
        fill: `${labelColor}30`,
        stroke: labelColor
      }
    };

    this.setState({
      mouseDraw: false,
      showLabelMenu: false,
      selectedShapeName: newRectName
    });

    this.triggerOnChange(newRectangles);
  }

  updateSelectedRectangle(cb) {
    const { rectangles } = this.props;
    const { selectedShapeName } = this.state;
    const selectedShape = rectangles[selectedShapeName];
    if (selectedShape) cb(selectedShape);
    this.triggerOnChange(rectangles);
  }

  render() {
    const {
      src,
      width,
      height,
      rectangles,
      labels,
      style,
      className
    } = this.props;

    const {
      showLabelMenu,
      selectedShapeName,
      newRect,
      mouseDraw,
      mouseDown,
      mouseX,
      mouseY
    } = this.state;

    const selectedShape = rectangles && rectangles[selectedShapeName];

    return (
      <div style={{ position: "relative", ...style }} className={className}>
        <Stage
          width={width}
          height={height}
          onMouseDown={this.handleStageMouseDown}
          onMouseUp={mouseDown && this.handleStageMouseUp}
          onMouseMove={mouseDown && this.handleStageMouseMove}
        >
          <Layer>
            <AnnotationImage src={src} width={width} height={height} />
          </Layer>
          <Layer>
            {Object.entries(rectangles).map(([name, rect]) => (
              <Rectangle
                key={name}
                onDragMove={this.handleRectangleDragMove}
                selected={name === selectedShapeName}
                {...rect}
              />
            ))}
            {mouseDraw && <Rectangle {...newRect} />}
            <RectangleTransformer
              selectedShapeName={selectedShapeName}
              selectedShape={selectedShape}
              onTransform={this.handleTransform}
              imageWidth={width}
              imageHeight={height}
              minRectSize={MIN_RECT_SIZE}
            />
          </Layer>
        </Stage>
        {selectedShape && (
          <DeleteRectangleFab
            shape={selectedShape}
            onClick={this.handleDeleteRectangle}
          />
        )}
        <LabelMenu
          open={showLabelMenu}
          onClose={this.handleLabelMenuClose}
          onItemClick={this.handleLabelMenuItemClick}
          items={labels}
          left={showLabelMenu ? mouseX : 0}
          top={showLabelMenu ? mouseY : 0}
        />
      </div>
    );
  }
}

export default AnnotatedImage;
