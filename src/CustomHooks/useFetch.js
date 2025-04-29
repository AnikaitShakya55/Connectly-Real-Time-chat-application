import { useState } from "react";

const useFetch = () => {
  const [getDataLoader, setGetDataLoader] = useState(false);

  const getFun = async (url) => {
    try {
      setGetDataLoader(true);
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = response.json();
      setGetDataLoader(false);
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  return { getDataLoader, getFun };
};

export default useFetch;
