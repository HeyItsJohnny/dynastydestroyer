import React from "react";

//Visual
import { AiOutlineCheck } from "react-icons/ai";
import { useStateContext } from "../../../contexts/ContextProvider";
import TextField from "@mui/material/TextField";

const LodgingComponent = ({ lodgingNext, backStep }) => {
  const { currentColor } = useStateContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    lodgingNext(e);
  };

  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">Lodging</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mt-1 w-72 md:w-400">
            <TextField
              autoFocus
              margin="dense"
              id="Name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="Address1"
              label="Address 1"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="Address2"
              label="Address 2"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="City"
              label="City"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="State"
              label="State"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="ZipCode"
              label="Zip Code"
              type="text"
              fullWidth
              variant="standard"
            />
          </div>
          <div className="mt-5 w-72 md:w-400">
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl mb-5 mr-5`}
              onClick={backStep}
            >
              Back
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl mb-5 mr-5`}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LodgingComponent;
