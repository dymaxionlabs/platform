import React from 'react';
import PropTypes from 'prop-types';
import UploadImageContent from "./home/UploadImageContent";
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';

import { withNamespaces } from "../i18n";

class UploadDialog extends React.Component{
  
  
  handleCancel = () => {
    this.props.onClose(false);
  };


    render() {
        const { open, title, content, t, token, handleComplete } = this.props;
        return (<Dialog
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth="xs"
          aria-labelledby="confirmation-dialog-title"
          open={open}
        >
          <DialogActions>
            <UploadImageContent 
              token={token} 
              handleComplete={() => {handleComplete()}}
              handleCancel={() => {this.handleCancel()}} />
          </DialogActions>
        </Dialog>
        
    );
    }
    
}

UploadDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

UploadDialog = withNamespaces("common")(UploadDialog);

export default UploadDialog;