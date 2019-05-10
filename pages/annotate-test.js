import Fab from "@material-ui/core/Fab";
import RemoveIcon from "@material-ui/icons/Remove";
import React from "react";
import { Layer, Rect, Stage, Transformer } from "react-konva";

class Rectangle extends React.Component {
  render() {
    return (
      <Rect
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}
        fill="#0080ff40"
        name={this.props.name}
        draggable
      />
    );
  }
}

class TransformerComponent extends React.Component {
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

  render() {
    return (
      <Transformer
        ref={node => {
          this.transformer = node;
        }}
        rotateEnabled={false}
        keepRatio={false}
        ignoreStroke={true}
      />
    );
  }
}

class DeleteRectangleHandle extends React.Component {
  render() {
    const { shape, onClick } = this.props;

    const center = {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2
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
    rectangles: [
      {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        name: "rect1"
      },
      {
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        name: "rect2"
      }
    ],
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
    const rect = this.state.rectangles.find(r => r.name === name);
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
    console.log(`delete rectangle`);

    const { selectedShapeName } = this.state;

    // If there is no shape selected, do nothing
    if (!selectedShapeName) return;

    const { rectangles } = this.state;
    const newRectangles = rectangles.filter(r => r.name !== selectedShapeName);
    this.setState({ rectangles: newRectangles });
  };

  render() {
    const {
      innerWidth,
      innerHeight,
      rectangles,
      selectedShapeName
    } = this.state;

    const selectedShape = rectangles.find(r => r.name === selectedShapeName);

    return (
      <React.Fragment>
        <Stage
          width={innerWidth}
          height={innerHeight}
          onMouseDown={this.handleStageMouseDown}
        >
          <Layer>
            {rectangles.map((rect, i) => (
              <Rectangle key={i} {...rect} />
            ))}
            <TransformerComponent selectedShapeName={selectedShapeName} />
          </Layer>
        </Stage>
        {selectedShape && (
          <DeleteRectangleHandle
            shape={selectedShape}
            onClick={this.handleDeleteRectangle}
          />
        )}
      </React.Fragment>
    );
  }
}

export default AnnotateTest;
