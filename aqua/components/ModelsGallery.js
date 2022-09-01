import axios from "axios";
import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";
import {
  TablePagination
} from "@material-ui/core";
import ModelsGalleryItem from "./ModelsGalleryItem";

const modelsSectionStyle = {
  all: "none",
  display: "grid",
  gap: "1rem",
  gridAutoRows: "8.5rem",
  gridTemplateColumns: "repeat(auto-fill, minmax(35rem, 1fr))"
};
const rowsPerPage = 10;

export const ModelsGallery = ({ token }) => {
  const [loading, setLoading] = useState(false)
  const [paginationData, setPaginationData] = useState({
    models: [],
    page: 0,
    url: buildApiUrl("/models/"),
    nextUrl: undefined,
    count: undefined
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(paginationData.url, { headers: { Authorization: token } })
      setPaginationData({
        ...paginationData,
        models: response.data.results,
        nextUrl: response.data.next,
        count: response.data.count,
      })
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, []);
  useEffect(() => { fetchData() }, [paginationData.url])

  // function onChangePage(e) {
  //   setPaginationData({ ...paginationData, page: e.detail })
  // }

  useEffect(() => {
    setPaginationData({ ...paginationData, url: paginationData.nextUrl })
  }, [paginationData.page])

  // useEffect(() => {
  //   console.log("pagination:", paginationData)
  // }, [paginationData])

  return (
    <>
      <section id="models-section" style={modelsSectionStyle}>
        {paginationData.models && paginationData.models.map(model =>
          <ModelsGalleryItem key={`${model.owner}/${model.name}`} model={model} />
        )}
      </section>
      {/* {loading ||
        <TablePagination
          component="div"
          count={paginationData.count}
          page={paginationData.page}
          onChangePage={onChangePage}
          rowsPerPage={rowsPerPage}
        />
      } */}
    </>
  )
}


export default ModelsGallery;