import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import React from "react";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import IconButton from "@material-ui/core/IconButton";
import AnnotatedImageTile from "../../../../components/models/annotate/AnnotatedImageTile";
import { i18n, withNamespaces } from "../../../../i18n";
import { buildApiUrl } from "../../../../utils/api";
import StepContentContainer from "../StepContentContainer";

const IMAGE_SIZE = 600;

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3
  },
  imageTileListContainer: {
    overflow: "hidden",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around"
  },
  imageTileList: {
    height: 500,
    transform: "translateZ(0)"
  },
  paper: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
      .spacing.unit * 3}px`
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit
  }
});

class ImageTileList extends React.Component {
  render() {
    const {
      classes,
      labels,
      imageTiles,
      annotationsByTile,
      onChange,
      onFirstPageClick,
      onLastPageClick,
      onPrevPageClick,
      onNextPageClick
    } = this.props;

    return (
      <React.Fragment>
        <GridList
          cellHeight="auto"
          className={classes.imageTileList}
          cols={1}
          spacing={1}
        >
          {imageTiles.map(tile => (
            <GridListTile key={tile.tile_file}>
              <AnnotatedImageTile
                key={tile.id}
                id={tile.id}
                src={tile.tile_file}
                width={IMAGE_SIZE}
                height={IMAGE_SIZE}
                rectangles={annotationsByTile[tile.id] || {}}
                labels={labels || []}
                onChange={onChange}
                style={{ margin: 5 }}
              />
            </GridListTile>
          ))}
        </GridList>
        <div>
          <IconButton className={classes.button} onClick={onFirstPageClick}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton className={classes.button} onClick={onPrevPageClick}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton className={classes.button} onClick={onNextPageClick}>
            <NavigateNextIcon />
          </IconButton>
          <IconButton className={classes.button} onClick={onLastPageClick}>
            <SkipNextIcon />
          </IconButton>
        </div>
      </React.Fragment>
    );
  }
}

ImageTileList = withStyles(styles)(ImageTileList);

let LabelCountList = ({ t, classes, labelCount }) => (
  <Paper className={classes.paper}>
    <Typography>{t("annotate_step.annotations_per_class")}</Typography>
    <ul>
      {Object.entries(labelCount).map(([label, count]) => (
        <li key={label}>
          <Typography>
            {label}: {count}
          </Typography>
        </li>
      ))}
    </ul>
  </Paper>
);

LabelCountList = withNamespaces("models")(LabelCountList);
LabelCountList = withStyles(styles)(LabelCountList);

class AnnotateStep extends React.Component {
  state = {
    offset: 0,
    imageTiles: [],
    estimator: null,
    imageTiles: [],
    annotationsByTile: {},
    labelCount: {}
  };

  async componentDidMount() {
    await this.fetchEstimator();
    await this.fetchImageTiles();

    // TODO Check if there are enough image tiles for annotation
    // if (this.state.imag)

    this.fetchAnnotations();
    this.fetchLabelCount();
  }

  async fetchEstimator() {
    const { token, estimatorId } = this.props;

    const response = await axios.get(
      buildApiUrl(`/estimators/${estimatorId}`),
      {
        headers: {
          Authorization: token,
          "Accept-Language": i18n.language
        }
      }
    );

    this.setState({ estimator: response.data });
  }

  async fetchImageTiles() {
    const { token } = this.props;
    const { estimator, offset } = this.state;

    const response = await axios.get(buildApiUrl(`/image_tiles/`), {
      params: {
        limit: 10,
        offset: offset,
        files: estimator.image_files
      },
      headers: {
        Authorization: token,
        "Accept-Language": i18n.language
      }
    });

    this.setState({ imageTiles: response.data.results });
  }

  async fetchAnnotations() {
    const { token } = this.props;
    const { estimator, imageTiles } = this.state;
    const imageTileIds = imageTiles.map(imageTile => imageTile.id);

    const response = await axios.get(buildApiUrl(`/annotations/`), {
      params: {
        estimator: estimator.uuid,
        image_tile: imageTileIds.join(",")
      },
      headers: {
        Authorization: token,
        "Accept-Language": i18n.language
      }
    });

    const annotationsByTile = response.data.results.reduce((obj, annot) => {
      const segments = annot.segments
        .map((segment, i) => [i, Object.assign(segment, { name: String(i) })])
        .reduce((obj, [i, segment]) => ({ ...obj, [i]: segment }), {});
      return { ...obj, [annot.image_tile]: segments };
    }, {});

    this.setState({ annotationsByTile });
  }

  async fetchLabelCount() {
    const { token, estimatorId } = this.props;

    const response = await axios.get(
      buildApiUrl(`/estimators/${estimatorId}/segments_per_label/`),
      {
        headers: {
          Authorization: token,
          "Accept-Language": i18n.language
        }
      }
    );

    const labelCount = response.data["detail"];

    this.setState({ labelCount });
  }

  handleChange = (imageTileId, rectangles) => {
    const { annotationsByTile } = this.state;
    this.setState({
      annotationsByTile: { ...annotationsByTile, [imageTileId]: rectangles }
    });
  };

  handleFirstPageClick = () => {
    console.log("first page");
  };

  handlePrevPageClick = () => {
    console.log("prev page");
  };

  handleNextPageClick = () => {
    console.log("next page");
  };

  handleLastPageClick = () => {
    console.log("last page");
  };

  handleSubmit = async () => {
    const { token } = this.props;
    const { estimator, imageTiles, annotationsByTile } = this.state;

    let savedTiles = 0;
    for (const imageTile of imageTiles) {
      const annotations = annotationsByTile[imageTile.id] || {};
      const segments = Object.values(annotations).map(segment => ({
        x: segment.x,
        y: segment.y,
        width: segment.width,
        height: segment.height,
        label: segment.label
      }));

      const data = {
        estimator: estimator.uuid,
        image_tile: imageTile.id,
        segments: segments
      };

      axios
        .post(buildApiUrl(`/annotations/`), data, {
          headers: {
            Authorization: token,
            "Accept-Language": i18n.language
          }
        })
        .then(response => {
          savedTiles += 1;
          if (savedTiles === imageTiles.length) {
            console.log("All annotations saved!");
          }
        });
    }
  };

  render() {
    const { classes, t } = this.props;
    const { imageTiles, estimator, annotationsByTile, labelCount } = this.state;

    // FIXME
    const labels = estimator && estimator.classes;

    return (
      <StepContentContainer width={1000}>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("annotate_step.title")}
        </Typography>
        <Grid container spacing={24}>
          <Grid item xs={9}>
            <div className={classes.imageTileListContainer}>
              <ImageTileList
                labels={labels}
                imageTiles={imageTiles}
                annotationsByTile={annotationsByTile}
                onChange={this.handleChange}
                onFirstPageClick={this.handleFirstPageClick}
                onPrevPageClick={this.handlePrevPageClick}
                onNextPageClick={this.handleNextPageClick}
                onLastPageClick={this.handleLastPageClick}
              />
            </div>
          </Grid>
          <Grid item xs={3}>
            {labels && labelCount && <LabelCountList labelCount={labelCount} />}
          </Grid>
        </Grid>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={this.handleSubmit}
        >
          {t("annotate_step.submit_btn")}
        </Button>
      </StepContentContainer>
    );
  }
}

AnnotateStep = withStyles(styles)(AnnotateStep);
AnnotateStep = withNamespaces("models")(AnnotateStep);

export default AnnotateStep;
