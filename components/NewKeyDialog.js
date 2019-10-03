import React from 'react';
import PropTypes from "prop-types";
import axios from "axios";

import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import { withNamespaces } from "../i18n";
import { buildApiUrl } from "../utils/api";


const styles = theme => ({
    btnRight: {
        float: "right",
    },
});

class NewKeyDialogForm extends React.Component {
    state = {
        open : false,
        created : false,
        keyname : '',
        generated_apikey: ''
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false, created: false, keyname : '' });
    };

    submit = async () => {
        const { keyname } = this.state;
        try {
            await axios.post(
                buildApiUrl(`/api_keys/`),
                { name: keyname },
                { headers: { Authorization: this.props.token } }
            ).then(response => {
                let apikey = response.data.key;
                this.setState({ 
                    generated_apikey : apikey,
                    created : true
                });
                this.props.created();
            });
        } catch (err) {
            console.error(err);
        }
    };


    render() {
        const { open, created, generated_apikey } = this.state;
        const { classes } = this.props;
        return (
        <div className={classes.btnRight}>
            <Button  onClick={this.handleClickOpen}>
                Nueva
            </Button>
            <Dialog open={open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Nueva API Key</DialogTitle>
                { !created ? (
                    <DialogContent>
                        <DialogContentText>
                            Ingrese un nombre para la nueva API Key.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Nombre"
                            type="text"
                            fullWidth
                            value={this.state.keyname}
                            onChange={e => this.setState({ keyname: e.target.value })}
                        />
                    </DialogContent>
                ) : (
                    <DialogContent>
                        <DialogContentText>
                            Copie y guarde su clave, si la pierde debera crear una nuvea. 
                            No la comparta con nadie
                        </DialogContentText>
                        <TextField
                            InputProps={{
                                readOnly: true,
                            }}
                            id="apikey"
                            defaultValue={generated_apikey}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                    </DialogContent>
                )}
                <DialogActions>
                <Button onClick={this.handleClose} color="primary">
                    { !created ? "Cancel"  : "Cerrar" }
                </Button>
                { !created ? (
                    <Button onClick={this.submit} color="primary">
                        Crear
                    </Button>
                ) : (
                    <CopyToClipboard text={generated_apikey}>
                        <Button onClick={this.copy} color="primary">
                            Copiar
                        </Button>
                    </CopyToClipboard>

                )}
                </DialogActions>
            </Dialog>
        </div>
        )
    }
}


NewKeyDialogForm.propTypes = {
    classes: PropTypes.object.isRequired
};
  
NewKeyDialogForm = withStyles(styles)(NewKeyDialogForm);
NewKeyDialogForm = withNamespaces("me")(NewKeyDialogForm);

export default NewKeyDialogForm;
