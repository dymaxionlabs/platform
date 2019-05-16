import React from "react";
import AnnotatedImage from "../components/models/annotate/AnnotatedImage";

const IMAGE_SIZE = 600;

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
        annotations: {}
      },
      {
        src: "/static/tiles/1_2.jpg",
        annotations: {}
      },
      {
        src: "/static/tiles/1_3.jpg",
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

    return (
      <div
        style={{
          height: 500,
          width: IMAGE_SIZE + 20,
          overflowX: "hidden",
          overflowY: "scroll"
        }}
      >
        {images.map(image => (
          <AnnotatedImage
            key={image.src}
            src={image.src}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            rectangles={image.annotations}
            labels={labels}
            onChange={this.handleChange}
            style={{ margin: 5 }}
          />
        ))}
      </div>
    );
  }
}

export default AnnotateTest;
