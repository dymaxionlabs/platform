import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Popover from "@material-ui/core/Popover";
import ClearIcon from "@material-ui/icons/Clear";
import React from "react";
import { Image, Layer, Rect, Stage, Text, Transformer } from "react-konva";

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

class AnnotationImage extends React.Component {
  state = {
    image: null
  };

  componentDidMount() {
    const { src } = this.props;

    const image = new window.Image();
    image.src = src;
    image.onload = () => {
      this.setState({
        image
      });
    };
  }

  handleMouseMove = e => {
    const container = e.target.getStage().container();
    container.style.cursor = "crosshair";
  };

  render() {
    const { image } = this.state;
    const { width, height } = this.props;

    return (
      <Image
        ref={node => (this.image = node)}
        onMouseMove={this.handleMouseMove}
        width={width}
        height={height}
        image={image}
      />
    );
  }
}

class Rectangle extends React.Component {
  state = {
    hover: false
  };

  handleMouseEnter = e => {
    this.setState({ hover: true });
  };

  handleMouseLeave = e => {
    this.setState({ hover: false });
  };

  componentDidUpdate() {
    const { hover } = this.state;
    const { selected } = this.props;

    const container = this.rect.getStage().container();

    if (hover) {
      if (selected) {
        container.style.cursor = "move";
      } else {
        container.style.cursor = "pointer";
      }
    }
  }

  render() {
    const {
      x,
      y,
      width,
      height,
      label,
      name,
      stroke,
      fill,
      selected,
      onDragMove
    } = this.props;

    const textPadding = 5;
    const textX = textPadding + (width < 0 ? x + width : x);
    const textY = textPadding + (height < 0 ? y + height : y);

    return (
      <React.Fragment>
        <Rect
          ref={node => (this.rect = node)}
          x={x}
          y={y}
          width={width}
          height={height}
          stroke={stroke}
          strokeWidth={selected ? 0 : 2}
          fill={fill}
          name={name}
          draggable
          onDragMove={onDragMove}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        />
        <Text
          x={textX}
          y={textY}
          text={label}
          fill="#ffffff"
          fontVariant="small-caps"
        />
      </React.Fragment>
    );
  }
}

class RectangleTransformer extends React.Component {
  componentDidMount() {
    this.checkNode();
  }

  componentDidUpdate() {
    this.checkNode();
  }

  checkNode() {
    // Here we need to manually attach or detach Transformer node
    const stage = this.transformer.getStage();
    const { selectedShapeName } = this.props;

    const selectedNode = stage.findOne("." + selectedShapeName);
    // Do nothing if selected node is already attached
    if (selectedNode === this.transformer.node()) {
      return;
    }

    if (selectedNode) {
      // Attach to another node
      this.transformer.attachTo(selectedNode);
    } else {
      // Remove transformer
      this.transformer.detach();
    }
    this.transformer.getLayer().batchDraw();
  }

  boundBoxFunc = (oldBox, newBox) => {
    const { imageWidth, imageHeight } = this.props;

    // Minimum bounding box size
    if (newBox.width < MIN_RECT_SIZE) {
      newBox.width = MIN_RECT_SIZE;
    }
    if (newBox.height < MIN_RECT_SIZE) {
      newBox.height = MIN_RECT_SIZE;
    }
    // Limit rectangle inside AnnotationImage
    if (imageWidth && newBox.x + newBox.width > imageWidth) {
      newBox.width = imageWidth - newBox.x;
    }
    if (imageHeight && newBox.y + newBox.height > imageHeight) {
      newBox.height = imageHeight - newBox.y;
    }
    return newBox;
  };

  render() {
    const { selectedShape, onTransform } = this.props;

    return (
      <Transformer
        ref={node => (this.transformer = node)}
        rotateEnabled={false}
        keepRatio={false}
        ignoreStroke={true}
        anchorCornerRadius={3}
        anchorStrokeWidth={2}
        anchorStroke={selectedShape && selectedShape.stroke}
        anchorFill={selectedShape && selectedShape.fill}
        borderStroke={selectedShape && selectedShape.stroke}
        borderStrokeWidth={2}
        onTransform={onTransform}
        boundBoxFunc={this.boundBoxFunc}
      />
    );
  }
}

class DeleteRectangleFab extends React.Component {
  render() {
    const { shape, onClick } = this.props;

    const shapeWidth = shape.widthAfterResize || shape.width;
    const shapeHeight = shape.heightAfterResize || shape.height;

    const center = {
      x: shape.x + shapeWidth / 2 - 20,
      y: shape.y + shapeHeight / 2 - 20
    };

    return (
      <Fab
        size="small"
        color="secondary"
        aria-label="Remove"
        onClick={onClick}
        style={{
          position: "absolute",
          backgroundColor: `${shape.stroke}80`,
          top: center.y,
          left: center.x
        }}
      >
        <ClearIcon />
      </Fab>
    );
  }
}

class LabelMenu extends React.Component {
  render() {
    const { open, items, top, left, onItemClick } = this.props;

    return (
      <Popover
        anchorReference="anchorPosition"
        anchorPosition={{ top: top, left: left }}
        open={open}
      >
        <List>
          {items.map(item => (
            <ListItem key={item} button onClick={() => onItemClick(item)}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Popover>
    );
  }
}

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

  handleStageMouseUp = () => {
    const { mouseDraw } = this.state;
    const { labels } = this.props;

    if (mouseDraw) {
      if (labels.length > 1) {
        this.setState({ showLabelMenu: true });
      } else {
        this.addNewRectangle(labels[0]);
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

  handleLabelItemClick = label => {
    this.addNewRectangle(label);
  };

  addNewRectangle(label) {
    const { labels, rectangles } = this.props;
    const { newRect } = this.state;

    const labelIndex = labels.indexOf(label);
    const labelColor = LABEL_COLORS[labelIndex % LABEL_COLORS.length];

    const newRectName = String(Object.keys(rectangles).length + 42);
    const newRectangles = {
      ...rectangles,
      [newRectName]: {
        ...newRect,
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
          onItemClick={this.handleLabelItemClick}
          items={labels}
          left={showLabelMenu ? mouseX : 0}
          top={showLabelMenu ? mouseY : 0}
        />
      </div>
    );
  }
}

class AnnotateTest extends React.Component {
  state = {
    images: [],
    labels: []
  };

  static async getInitialProps({ res }) {
    return {
      namespacesRequired: []
    };
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // This would come from an API response...
    const labels = ["Roof", "Other"];
    const images = [
      {
        src: "/static/tiles/1_1.jpg",
        width: 500,
        height: 500,
        annotations: {}
      },
      {
        src: "/static/tiles/1_2.jpg",
        width: 500,
        height: 500,
        annotations: {}
      },
      {
        src: "/static/tiles/1_3.jpg",
        width: 500,
        height: 500,
        annotations: {}
      }
    ];

    this.setState({
      images: images,
      labels: labels
    });
  }

  handleChange = (src, rectangles) => {
    const { images } = this.state;
    let image = images.find(img => img.src === src);
    image.annotations = rectangles;
    this.setState({ images });
  };

  render() {
    const { images, labels } = this.state;

    return images.map(image => (
      <AnnotatedImage
        key={image.src}
        src={image.src}
        width={image.width}
        height={image.height}
        rectangles={image.annotations}
        labels={labels}
        onChange={this.handleChange}
        style={{ margin: 10 }}
      />
    ));
  }
}

export default AnnotateTest;
