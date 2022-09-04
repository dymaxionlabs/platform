import Checkbox from "@material-ui/core/Checkbox";
import { Radio } from "@material-ui/core";
import Input from "@material-ui/core/Input";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { FixedSizeList } from "react-window";

const useStyles = makeStyles((theme) => ({
  filterInput: {
    marginLeft: theme.spacing(2),
  },
  itemText: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap"
  }
}));

export default function VirtualizedList({
  className,
  items,
  header,
  showCheckbox,
  showRadio,
  checked,
  onToggle,
  showFilter,
  onFilterChange,
  primaryKey = "name",
  secondaryKey,
  disabled,
  itemSize = 50,
  height = 500,
  placeholder,
  showInputs,
  inputValues,
  onInputChange,
  disableRipple,
  showRemove,
  onRemove,
}) {
  function renderRow(props) {
    const { style, index } = props;
    const item = items[index];

    const labelId = `checkbox-list-label-${item.id}`;

    return (
      <ListItem
        style={style}
        key={index}
        role={undefined}
        disableRipple={disableRipple}
        dense
        button
        onClick={() => onToggle && onToggle(item.id)}
      >
        {showCheckbox ? (
          <ListItemIcon>
            <Checkbox
              // edge="start"
              checked={checked.includes(item.id)}
              tabIndex={-1}
              disableRipple
              disabled={disabled}
              inputProps={{ "aria-labelledby": labelId }}
            />
          </ListItemIcon>
        ) : (
          showRadio && (
            <ListItemIcon>
              <Radio
                // edge="start"
                checked={checked.includes(item.id)}
                tabIndex={-1}
                disableRipple
                disabled={disabled}
                inputProps={{ "aria-labelledby": labelId }}
              />
            </ListItemIcon>
          )
        )}
        <ListItemText
          className={classes.itemText}
          id={labelId}
          primary={item[primaryKey]}
          secondary={secondaryKey && item[secondaryKey]}
          disabled={disabled}
        />
        {showInputs && (
          <Input
            value={inputValues[item.id]}
            onChange={(e) => onInputChange(item.id, e.target.value)}
            placeholder={placeholder}
          />
        )}
        {showRemove && (
          <IconButton aria-label="delete" size="small" onClick={(e) => onRemove(item.id, e)}>
            <DeleteIcon />
          </IconButton>
        )}
      </ListItem>
    );
  }

  const classes = useStyles();

  return (
    <>
      <ListSubheader component="div" id="nested-list-subheader">
        {header}
        {showFilter && (
          <Input
            className={classes.filterInput}
            placeholder="Filter"
            inputProps={{ "aria-label": "filter" }}
            onChange={onFilterChange}
          />
        )}
      </ListSubheader>
      <FixedSizeList
        width="100%"
        height={height}
        itemSize={itemSize}
        itemCount={items.length}
        className={className}
        aria-labelledby="nested-list-subheader"
      >
        {renderRow}
      </FixedSizeList>
    </>
  );
}
