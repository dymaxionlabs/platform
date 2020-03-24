import React from "react";
import hljs from "highlight.js";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  pre: {
    padding: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    borderRadius: "0 0 2px 2px",
    borderTop: `solid 1px ${theme.borderColor}`,
    backgroundColor: "#222",
    color: "#eee",
    fontSize: 13,
    overflow: "scroll"
  },
  code: {
    fontFamily: "Monaco, monospace"
  }
});

class CodeBlock extends React.Component {
  shouldComponentUpdate({ children }, _nextState) {
    return this.props.children !== children;
  }

  componentDidMount() {
    if (this.pre) {
      hljs.highlightBlock(this.pre);
      console.log("Code hightlighted");
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.pre) {
      hljs.highlightBlock(this.pre);
      console.log("Code hightlighted");
    }
  }

  render() {
    const { classes, children, language } = this.props;

    return (
      <pre ref={e => (this.pre = e)} className={classes.pre}>
        <code className={`${classes.code} ${language}`}>{children}</code>
      </pre>
    );
  }
}

CodeBlock = withStyles(styles)(CodeBlock);

export default CodeBlock;
