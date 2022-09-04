import {
  Container,
  FormControl,
  Input,
  InputLabel,
  Button,
  FormHelperText,
  LinearProgress,
} from "@material-ui/core";
import { withSnackbar } from "notistack";
import cookie from "js-cookie";
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { buildApiUrl } from "../../utils/api";
import { makeStyles } from '@material-ui/core/styles';
import { routerPush } from '../../utils/router';

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: "none"
  },
  root: {
    '& > *': {
      margin: theme.spacing(2),
    },
  },
  formControl: {
    maxWidth: "30em"
  }
}));

let ModelPredictContent = ({ modelOwner, modelName, modelVersion, token, enqueueSnackbar }) => {
  const classes = useStyles();

  const [model, setModel] = useState({});
  const [parameters, setParameters] = useState({});
  const [loading, setLoading] = useState(true);

  const predictParams = useMemo(() =>
    (model && model.params && model.params["predict"]) || [], [model])

  const fetchData = async () => {
    const url = buildApiUrl(`/users/${modelOwner}/models/${modelName}/versions/${modelVersion}/`);
    try {
      const response = await axios.get(url, { headers: { Authorization: token } })
      console.log("model", response.data)
      setModel(response.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      this.props.enqueueSnackbar("Failed to get model version", {
        variant: "error",
      });
    }
  }

  useEffect(() => { fetchData() }, []);

  useEffect(() => {
    const _parameters = predictParams.reduce(
      (obj, param) => Object.assign(obj, { [param.id]: "" }), {});
    setParameters(_parameters)
  }, [predictParams])

  const handleChange = (e) => {
    setParameters({
      ...parameters,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    const fixedParams = {}
    predictParams.map(param => {
      fixedParams[param.id] = parameters[param.id].trim() || String(param?.default)
    })
    console.log("Params:", fixedParams)

    const projectId = cookie.get("project");

    try {
      const response = await axios.post(buildApiUrl(`/users/${modelOwner}/models/${modelName}/versions/${modelVersion}/predict/`), {
        parameters: fixedParams,
        project: projectId,
      }, {
        headers: {
          Authorization: token,
        },
      });
      console.log(response.data)
      enqueueSnackbar("Created a prediction task. Please check out the Tasks section later...", {
        variant: "success",
      });
      routerPush("/home/tasks");
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to run prediction task", {
        variant: "error",
      });
    }

    setLoading(false)
  }

  if (model) {
    return (
      <Container className={classes.container}>
        <form className={classes.root} onSubmit={handleSubmit}>
          {predictParams.map(param => (
            <FormControl className={classes.formControl} key={param.id}>
              <InputLabel htmlFor={param.id}>{param.name}</InputLabel>
              <Input id={param.id} name={param.id} disabled={loading} aria-describedby="my-helper-text" placeholder={String(param.default)} value={parameters[param.id]} onChange={handleChange} />
              <FormHelperText id={`${param.id}-helper-text`}>{param.desc}</FormHelperText>
            </FormControl>
          ))}
          <div>
            <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary">Predict</Button>
          </div>
          {loading && <LinearProgress />}
        </form>
      </Container>
    )
  } else {
    return (
      <div>Loading model...</div>
    )
  }
};

ModelPredictContent = withSnackbar(ModelPredictContent);

export default ModelPredictContent;