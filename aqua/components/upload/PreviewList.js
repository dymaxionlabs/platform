import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { isImage } from "./helpers.js";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import Fab from "@material-ui/core/Fab";
import VirtualizedList from "../VirtualizedList.js";

const styles = {
  removeBtn: {
    transition: ".5s ease",
    position: "absolute",
    opacity: 0,
    top: -5,
    right: -5,
    width: 40,
    height: 40
  },
  smallPreviewImg: {
    height: 100,
    width: "initial",
    maxWidth: "100%",
    marginTop: 5,
    marginRight: 10,
    color: "rgba(0, 0, 0, 0.87)",
    transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
    boxSizing: "border-box",
    boxShadow: "rgba(0, 0, 0, 0.12) 0 1px 6px, rgba(0, 0, 0, 0.12) 0 1px 4px",
    borderRadius: 2,
    zIndex: 5,
    opacity: 1
  },
  imageContainer: {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
    "&:hover $smallPreviewImg": {
      opacity: 0.3
    },
    "&:hover $removeBtn": {
      opacity: 1
    }
  }
};

function PreviewList(props) {
  const { fileObjects, handleRemove } = props;

  const items = fileObjects.map((obj, id) => ({ id, name: obj.file.name }))

  return (
    <VirtualizedList
      items={items}
      itemSize={30}
      height={200}
      disableRipple
      showRemove
      onRemove={handleRemove}
    />
  );
}

export default withStyles(styles)(PreviewList);
