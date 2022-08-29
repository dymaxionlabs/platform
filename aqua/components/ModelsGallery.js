import axios from "axios";
import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";
import {
  TablePagination
} from "@material-ui/core";
import ModelsGalleryItem from "./ModelsGalleryItem";
// import ModelsGalleryItem from "/ModelsGalleryItem";

const modelsSectionStyle = {
  all: "none",
  display: "grid",
  gap: "1rem",
  gridAutoRows: "8.5rem",
  gridTemplateColumns: "repeat(auto-fill, minmax(35rem, 1fr))"
};
const rowsPerPage = 10;

export const ModelsGallery = ({ token }) => {
  const [paginationData, setPaginationData] = useState({
    models: [],
    page: 0,
    url: buildApiUrl("/models/"),
    nextUrl: undefined,
    count: undefined
  })

  useEffect(async () => {
    await axios.get(paginationData.url, { headers: { Authorization: token } }).then((response) => {
      setPaginationData({...paginationData,models:response.data.results, nextUrl:response.data.next, count:response.data.count})
    }).catch((err) => {
      console.log(err)
    });
  }, []);

  function onChangePage(e){
    setPage(e.detail);
  }


  useEffect(() => {
    axios.get(paginationData.url, { headers: { Authorization: token } }).then((response) => {

      setPaginationData({...paginationData,models:response.data.results, nextUrl:response.data.next, count:response.data.count})
    }).catch((err) => {
      console.log(err)
    });
  }, [paginationData])

  return (
    <>
      <section id="models-section" style={modelsSectionStyle}>
        {paginationData.models && paginationData.models.map(model =>
          <ModelsGalleryItem model={model} />
        )}
      </section>
      <TablePagination
        component="div"
        count={paginationData.count}
        page={paginationData.page}
        onChangePage={onChangePage}
        rowsPerPage={rowsPerPage}
      />
    </>
  )
}


export default ModelsGallery;