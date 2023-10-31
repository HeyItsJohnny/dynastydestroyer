import React from "react";
import { Header } from "../../components";

import { useStateContext } from "../../contexts/ContextProvider";

import TextField from "@mui/material/TextField";

const Details = ({ detailsNext }) => {
  const { currentColor } = useStateContext();

  const handleSubmit = (e) => {
    e.preventDefault();

    detailsNext(e);
  };

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="" title="Details" />
        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            required
            margin="dense"
            id="Destination"
            label="Destination"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="none"
            id="StartDate"
            label=""
            type="date"
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            id="EndDate"
            label=""
            type="date"
            fullWidth
            variant="standard"
          />
          <div className="mt-10">
            <button
              type="submit"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl`}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Details;
