import React, { useState, useEffect } from "react";

//Visual
import { useStateContext } from "../../../contexts/ContextProvider";
import { AiOutlineCheck } from "react-icons/ai";
import ClipLoader from "react-spinners/ClipLoader";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Chat GPT
import { Configuration, OpenAIApi } from "openai";

const AIGeneratedMeals = ({ detailsData, addSelectedData }) => {
  const { currentColor } = useStateContext();
  let [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState([]);

  const addMealToMyMeals = (meal) => { 
    toast(meal.name + " added to my list.");
    addSelectedData(meal);
  };

  //Chat GPT -
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
  //Chat GPT +

  const getAIGeneratedMeals = async () => {
    try {
      setLoading(true);
      setMeals([]);

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You will be provided with a question, and your task is to parse the answers it into JSON format with the key being restaurants, properties: name, description, review_stars, website, category. Please limit to 10 restaurants.",
          },
          {
            role: "user",
            content:
              "Please give me a list of popular resturants in " +
              detailsData.Destination +
              "?",
          },
        ],
        temperature: 0,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const returnText = response.data.choices[0].message.content.replace(
        /(\r\n|\n|\r)/gm,
        ""
      );
      const jsonObject = JSON.parse(returnText);
      console.log(jsonObject.restaurants);
      setMeals(jsonObject.restaurants);

      setLoading(false);
    } catch (error) {
      alert("ERROR: " + error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAIGeneratedMeals();
    return () => {
      setMeals([]);
    };
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">
            Top Restaurants in {detailsData.Destination}
          </p>
        </div>
        <div className="mt-5 w-72 md:w-400">
          {loading ? (
            <div className="flex justify-between items-center gap-2">
              <ClipLoader
                color="#ffffff"
                loading={loading}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          ) : (
            meals.map((meal) => (
              <div className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    style={{
                      backgroundColor: currentColor,
                      color: "White",
                    }}
                    className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                    onClick={()=>addMealToMyMeals(meal)}
                  >
                    <AiOutlineCheck />
                  </button>
                  <div>
                    <a href={meal.website} target="_blank">
                      <p className="text-md font-semibold">{meal.name}</p>
                    </a>
                    <p className="text-sm text-gray-400">
                     {meal.category}
                    </p>
                  </div>
                </div>
                <p className={`text-green-600`}>{meal.review_stars}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AIGeneratedMeals;
