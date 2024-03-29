import { withStyles } from "@material-ui/core/styles";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import React from "react";
import AnnotatedImageTile from "./annotate/AnnotatedImageTile";
import { Link, withTranslation } from "../../i18n";
import { routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";
import CodeBlock from "../CodeBlock";

import cattle_estimator from "../../data/testdrive/cattle_estimator.json";
import cattle_annotations from "../../data/testdrive/cattle_annotations.json";
import cattle_tiles from "../../data/testdrive/cattle_tiles.json";
import cattle_labels from "../../data/testdrive/cattle_labels.json";

import pools_estimator from "../../data/testdrive/pools_estimator.json";
import pools_annotations from "../../data/testdrive/pools_annotations.json";
import pools_tiles from "../../data/testdrive/pools_tiles.json";
import pools_labels from "../../data/testdrive/pools_labels.json";

import {
  Button,
  Grid,
  GridList,
  GridListTile,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@material-ui/core";

const PAGE_SIZE = 10;
const IMAGE_SIZE = 600;
const MIN_COUNT_PER_LABEL = 50;

const styles = (theme) => ({
  header: {
    textAlign: "center",
    marginBottom: theme.spacing(3),
  },
  imageTileListContainer: {
    overflow: "hidden",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: theme.spacing(1),
  },
  imageTileList: {
    height: 500,
    transform: "translateZ(0)",
  },
  paper: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
      3
    )}px`,
  },
  pageButtons: {
    marginTop: theme.spacing(1),
  },
  pageButton: {
    marginTop: 0,
    marginRight: theme.spacing(1),
  },
  page: {
    display: "inline",
    textAlign: "center",
  },
  submitButton: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  buttons: {
    textAlign: "center",
  },
});

class ImageTileList extends React.Component {
  render() {
    const { classes, ...props } = this.props;
    return (
      <React.Fragment>
        <GridList
          cellHeight="auto"
          className={classes.imageTileList}
          cols={1}
          spacing={1}
        >
          {props.imageTiles.map((tile) => (
            <GridListTile key={tile.tile_file}>
              <AnnotatedImageTile
                key={tile.id}
                id={tile.id}
                src={tile.tile_file}
                width={IMAGE_SIZE}
                height={IMAGE_SIZE}
                rectangles={props.annotationsByTile[tile.id] || {}}
                labels={props.labels || []}
                onChange={props.onChange}
                onNew={props.onNew}
                onDelete={props.onDelete}
                style={{ margin: 5 }}
              />
            </GridListTile>
          ))}
        </GridList>
        <div className={classes.pageButtons}>
          <IconButton
            className={classes.pageButton}
            onClick={props.onFirstPageClick}
          >
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            className={classes.pageButton}
            onClick={props.onPrevPageClick}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <Typography className={classes.page}>
            {props.offset} / {props.count}
          </Typography>
          <IconButton
            className={classes.pageButton}
            onClick={props.onNextPageClick}
          >
            <NavigateNextIcon />
          </IconButton>
          <IconButton
            className={classes.pageButton}
            onClick={props.onLastPageClick}
          >
            <SkipNextIcon />
          </IconButton>
        </div>
      </React.Fragment>
    );
  }
}

ImageTileList = withStyles(styles)(ImageTileList);

let remainingMessage = (t, count) => {
  if (count < MIN_COUNT_PER_LABEL) {
    return (
      <Typography>
        ({t("annotate_step.remaining")}:{MIN_COUNT_PER_LABEL - count})
      </Typography>
    );
  }
};

let LabelCountList = ({ t, classes, labelCount }) => (
  <Paper className={classes.paper}>
    <Typography>{t("annotate_step.annotations_per_class")}</Typography>
    <List>
      {Object.entries(labelCount).map(([label, count]) => (
        <ListItem key={label}>
          <ListItemText>
            {label}: {count} {remainingMessage(t, count)}
          </ListItemText>
        </ListItem>
      ))}
    </List>
  </Paper>
);

LabelCountList = withTranslation("testdrive")(LabelCountList);
LabelCountList = withStyles(styles)(LabelCountList);

let LoadingContent = ({ t }) => (
  <React.Fragment>
    <Typography>{t("annotate_step.loading")}</Typography>
    <LinearProgress />
  </React.Fragment>
);

LoadingContent = withTranslation("testdrive")(LoadingContent);
LoadingContent = withStyles(styles)(LoadingContent);

let AnnotateContent = ({ t, classes, ...props }) => (
  <React.Fragment>
    <Typography variant="body2">{t("annotate_step.explanation1")}</Typography>
    <Typography variant="body2">{t("annotate_step.explanation2")}</Typography>
    <Grid container spacing={3}>
      <Grid item xs={9}>
        <div className={classes.imageTileListContainer}>
          <ImageTileList {...props} />
        </div>
      </Grid>
      <Grid item xs={3}>
        {props.labels && props.labelCount && (
          <LabelCountList labelCount={props.labelCount} />
        )}
      </Grid>
    </Grid>
  </React.Fragment>
);

AnnotateContent = withTranslation("testdrive")(AnnotateContent);
AnnotateContent = withStyles(styles)(AnnotateContent);

const apiContentByUseCase = {
  pools: { name: "pool", path: "pools/labels/", nameVar: "pools_detector" },
  cattle: {
    name: "cattle",
    path: "cattle/labels/",
    nameVar: "cattle_detector",
  },
};

let APIContent = ({ classes, t, path, name, modelVar }) => (
  <div>
    <Typography gutterBottom>
      You can upload a vector file (a Shapefile or GeoJSON) with annotated
      objects. Each feature must contain a single rectangle, and a property
      <code>"label"</code>, referencing one of the class names you entered when
      you created the model.
    </Typography>
    <Typography gutterBottom>
      To upload a vector file named <code>labels.geojson</code> and set label{" "}
      <code>{name}</code>, using the Python package, execute:
    </Typography>
    <CodeBlock language="python">
      {`labels = File.upload("labels.geojson", ${JSON.stringify(path)})
${modelVar}.add_labels_for(labels, img, ${JSON.stringify(name)})`}
    </CodeBlock>
    <Link href="/demo/train">
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        {t("next_btn")}
      </Button>
    </Link>
  </div>
);

APIContent = withStyles(styles)(APIContent);
APIContent = withTranslation("testdrive")(APIContent);

class AnnotateStep extends React.Component {
  state = {
    offset: 0,
    count: 0,
    imageTiles: [],
    estimator: null,
    imageTiles: [],
    annotationsByTile: {},
    labelCount: {},
    loading: true,
    currentModel: null,
  };

  _loadCurrentModel() {
    const current = window.localStorage.getItem("current");
    if (!current) {
      routerReplace("/demo");
      return;
    }
    const currentModel = JSON.parse(current);
    console.debug(currentModel);

    this.setState({ currentModel });
  }

  async componentDidMount() {
    this._loadCurrentModel();
    await this.fetchEstimator();
    await this.fetchImageTiles();
    await this.fetchAnnotations();
    await this.fetchLabelCount();
    this.setState({ loading: false });
  }

  async fetchEstimator() {
    const current = JSON.parse(window.localStorage.getItem("current"));
    const useCase = current["useCase"];
    console.debug("fetchEstimator");
    console.debug("useCase: " + useCase);
    if (useCase == "cattle") {
      this.setState({ estimator: cattle_estimator });
    } else if (useCase == "pools") {
      this.setState({ estimator: pools_estimator });
    }
    console.debug(this.state.estimator);
    console.debug("done fetchEstimator");
  }

  async fetchImageTiles() {
    console.debug("fetchImageTiles");
    const current = JSON.parse(window.localStorage.getItem("current"));
    const useCase = current["useCase"];
    let data;
    if (useCase == "cattle") {
      data = cattle_tiles;
    } else if (useCase == "pools") {
      data = pools_tiles;
    }
    const { count } = data;
    this.setState({ imageTiles: data.results });
    this.state.count = count;
    console.debug("done fetchImageTiles");
  }

  async fetchAnnotations() {
    console.debug("fetchAnnotations");
    const current = JSON.parse(window.localStorage.getItem("current"));
    const useCase = current["useCase"];
    let data;
    if (useCase == "pools") {
      data = pools_annotations;
    } else if (useCase == "cattle") {
      data = cattle_annotations;
    }
    const annotationsByTile = data.results.reduce((obj, annot) => {
      const segments = annot.segments
        .map((segment, i) => [i, Object.assign(segment, { name: String(i) })])
        .reduce((obj, [i, segment]) => ({ ...obj, [i]: segment }), {});
      return { ...obj, [annot.image_tile]: segments };
    }, {});
    this.setState({ annotationsByTile });
    console.debug("Done fetchAnnotations");
  }

  async fetchLabelCount() {
    console.debug("fetchLabelCount");
    const current = JSON.parse(window.localStorage.getItem("current"));
    const useCase = current["useCase"];
    let data;
    if (useCase == "cattle") {
      data = cattle_labels;
    } else if (useCase == "pools") {
      data = pools_labels;
    }
    let labelCount = data["detail"];
    // In case object is empty, fill it with all known labels
    const labels = this.state.estimator.classes;
    for (const label of labels) {
      if (!labelCount[label]) {
        labelCount[label] = 0;
      }
    }
    this.setState({ labelCount });
    console.debug("done fetchLabelCount");
  }
  _trackEvent = (action, value) => {
    if (this.props.analytics) {
      this.props.analytics.event("testdrive", action, value);
    }
  };

  _hasPrevPage() {
    const { offset } = this.state;
    return offset >= PAGE_SIZE;
  }

  _hasNextPage() {
    const { offset } = this.state;
    return offset + PAGE_SIZE < offset;
  }

  _hasEnoughAnnotations() {
    const { labelCount } = this.state;
    const hasLabels = Object.entries(labelCount).length > 0;
    const allLabelsHaveEnoughAnnotations = Object.values(labelCount).every(
      (count) => count >= MIN_COUNT_PER_LABEL
    );
    return hasLabels && allLabelsHaveEnoughAnnotations;
  }

  handleChange = (imageTileId, rectangles) => {
    this.setState((state, _) => ({
      annotationsByTile: {
        ...state.annotationsByTile,
        [imageTileId]: rectangles,
      },
    }));
  };

  handleNew = (_, rectangle) => {
    console.log("new rect");
    this.setState((state, _) => {
      const { label } = rectangle;
      const newCount =
        typeof state.labelCount[label] === "undefined"
          ? 1
          : state.labelCount[label] + 1;
      return { labelCount: { ...state.labelCount, [label]: newCount } };
    });
  };

  handleDelete = (_, rectangle) => {
    console.log("delete rect");
    this.setState((state, _) => {
      const { label } = rectangle;
      const newCount = Math.max(state.labelCount[label] - 1, 0);
      return { labelCount: { ...state.labelCount, [label]: newCount } };
    });
  };

  _updateStateAndRefetch(newState) {
    this.setState(newState, async () => {
      await this.fetchImageTiles();
      this.fetchAnnotations();
    });
  }

  handleFirstPageClick = () => {
    this._updateStateAndRefetch({ offset: 0 });
  };

  handlePrevPageClick = () => {
    this._updateStateAndRefetch((state, _) => ({
      offset: Math.max(state.offset - PAGE_SIZE, 0),
    }));
  };

  handleNextPageClick = () => {
    const { offset, count } = this.state;
    if (offset + PAGE_SIZE < count) {
      this._updateStateAndRefetch((state, _) => ({
        offset: Math.min(state.offset + PAGE_SIZE, state.count),
      }));
    }
  };

  handleLastPageClick = () => {
    this._updateStateAndRefetch((state, _) => ({
      offset: Math.floor(state.count / PAGE_SIZE) * PAGE_SIZE,
    }));
  };

  handleSubmit = async () => {
    const canAdvance = this._hasEnoughAnnotations();

    if (canAdvance) {
      this._trackEvent("AnnotateStep", "buttonClick");
      routerPush("/demo/train");
    }
  };

  render() {
    const { classes, t, apiMode } = this.props;
    const {
      loading,
      imageTiles,
      estimator,
      annotationsByTile,
      labelCount,
      offset,
      count,
      currentModel,
    } = this.state;

    const labels = estimator && estimator.classes;
    const canAdvance = this._hasEnoughAnnotations();

    let apiContent;
    if (currentModel) {
      const useCase = currentModel["useCase"];
      apiContent = apiContentByUseCase[useCase];
    }

    return (
      <StepContentContainer width={1000}>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("annotate_step.title")}
        </Typography>
        {apiMode ? (
          <APIContent
            path={apiContent["path"]}
            name={apiContent["name"]}
            modelVar={apiContent["nameVar"]}
          />
        ) : (
          <React.Fragment>
            {loading ? (
              <LoadingContent />
            ) : (
              <AnnotateContent
                labels={labels}
                labelCount={labelCount}
                imageTiles={imageTiles}
                annotationsByTile={annotationsByTile}
                offset={offset}
                count={count}
                onChange={this.handleChange}
                onNew={this.handleNew}
                onDelete={this.handleDelete}
                onFirstPageClick={this.handleFirstPageClick}
                onPrevPageClick={this.handlePrevPageClick}
                onNextPageClick={this.handleNextPageClick}
                onLastPageClick={this.handleLastPageClick}
              />
            )}
            <div className={classes.buttons}>
              <Button
                className={classes.submitButton}
                disabled={loading || !canAdvance}
                color="primary"
                variant="contained"
                onClick={this.handleSubmit}
              >
                {t("annotate_step.continue_btn")}
              </Button>
            </div>
          </React.Fragment>
        )}
      </StepContentContainer>
    );
  }
}

AnnotateStep = withStyles(styles)(AnnotateStep);
AnnotateStep = withTranslation("testdrive")(AnnotateStep);

export default AnnotateStep;
