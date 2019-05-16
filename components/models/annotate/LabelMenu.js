import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Popover from "@material-ui/core/Popover";
import React from "react";

class LabelMenu extends React.Component {
  render() {
    const { open, items, top, left, onClose, onItemClick } = this.props;

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
      </Popover>
    );
  }
}

export default LabelMenu;
