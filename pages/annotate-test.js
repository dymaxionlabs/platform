import Fab from "@material-ui/core/Fab";
import RemoveIcon from "@material-ui/icons/Remove";
import React from "react";
import { Layer, Rect, Stage, Transformer, Image } from "react-konva";

const MIN_RECT_SIZE = 50;

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

  render() {
    const { image } = this.state;
    const { width, height } = this.props;

    return <Image width={width} height={height} image={image} />;
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
    } else {
      container.style.cursor = "crosshair";
    }
  }

  render() {
    const { x, y, width, height, name, onDragMove } = this.props;

    return (
      <Rect
        ref={node => (this.rect = node)}
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#0080ff40"
        name={name}
        draggable
        onDragMove={onDragMove}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      />
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
    if (newBox.width < MIN_RECT_SIZE) {
      newBox.width = MIN_RECT_SIZE;
    }
    if (newBox.height < MIN_RECT_SIZE) {
      newBox.height = MIN_RECT_SIZE;
    }
    return newBox;
  };

  render() {
    const { onTransform } = this.props;

    return (
      <Transformer
        ref={node => (this.transformer = node)}
        rotateEnabled={false}
        keepRatio={false}
        ignoreStroke={true}
        onTransform={onTransform}
        boundBoxFunc={this.boundBoxFunc}
      />
    );
  }
}

class DeleteRectangleFab extends React.Component {
  render() {
    const { shape, onClick } = this.props;

    const center = {
      x: shape.x + shape.width / 2 - 20,
      y: shape.y + shape.height / 2 - 20
    };

    return (
      <Fab
        size="small"
        color="secondary"
        aria-label="Remove"
        onClick={onClick}
        style={{ position: "fixed", top: center.y, left: center.x }}
      >
        <RemoveIcon />
      </Fab>
    );
  }
}

class AnnotateTest extends React.Component {
  state = {
    innerWidth: 0,
    innerHeight: 0,
    rectangles: {
      "0": {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        name: "0"
      },
      "1": {
        x: 150,
        y: 150,
        width: 200,
        height: 120,
        name: "1"
      }
    },
    selectedShapeName: ""
  };

  static async getInitialProps({ res }) {
    return {
      namespacesRequired: []
    };
  }

  componentDidMount() {
    this.setState({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    });
  }

  handleStageMouseDown = e => {
    // Clicked on stage - clear selection
    if (e.target === e.target.getStage()) {
      this.setState({
        selectedShapeName: ""
      });
      return;
    }

    // Clicked on transformer - do nothing
    const clickedOnTransformer =
      e.target.getParent().className === "Transformer";
    if (clickedOnTransformer) {
      return;
    }

    // Find clicked rect by its name
    const name = e.target.name();
    const rect = this.state.rectangles[name];
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

  handleDeleteRectangle = e => {
    const { selectedShapeName, rectangles } = this.state;

    // If there is no shape selected, do nothing
    if (!selectedShapeName) return;

    const { [selectedShapeName]: deletedRect, ...newRectangles } = rectangles;
    this.setState({ rectangles: newRectangles });
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
      rect.width = transformer.getWidth();
      rect.height = transformer.getHeight();
    });
  };

  updateSelectedRectangle(updateCallback) {
    const { rectangles, selectedShapeName } = this.state;
    const selectedShape = rectangles[selectedShapeName];
    updateCallback(selectedShape);
    this.setState({ rectangles: rectangles });
  }

  render() {
    const {
      innerWidth,
      innerHeight,
      rectangles,
      selectedShapeName
    } = this.state;

    const selectedShape = rectangles[selectedShapeName];

    return (
      <React.Fragment>
        <Stage
          width={innerWidth}
          height={innerHeight}
          onMouseDown={this.handleStageMouseDown}
        >
          <Layer>
            <AnnotationImage src="/static/1_1.jpg" width={500} height={500} />
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
            <RectangleTransformer
              selectedShapeName={selectedShapeName}
              onTransform={this.handleTransform}
            />
          </Layer>
        </Stage>
        {selectedShape && (
          <DeleteRectangleFab
            shape={selectedShape}
            onClick={this.handleDeleteRectangle}
          />
        )}
      </React.Fragment>
    );
  }
}

export default AnnotateTest;
