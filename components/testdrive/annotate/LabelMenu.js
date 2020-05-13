import React from "react";
import { withTranslation } from "../../../i18n";

import { List, ListItem, ListItemText, Popover, Divider } from '@material-ui/core';

class LabelMenu extends React.Component {
  render() {
    const {
      t,
      open,
      items,
      top,
      left,
      onClose,
      onItemClick,
      onDelete,
      editing
    } = this.props;

    return (
      <Popover
        anchorReference="anchorPosition"
        anchorPosition={{ top: top, left: left }}
        open={open}
        onClose={onClose}
      >
        <List>
          {items.map(item => (
            <ListItem key={item} button onClick={() => onItemClick(item)}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={editing ? onDelete : onClose}>
            <ListItemText
              primary={t(
                editing ? "annotate_step.delete" : "annotate_step.cancel"
              )}
            />
          </ListItem>
        </List>
      </Popover>
    );
  }
}

export default withTranslation("models")(LabelMenu);
