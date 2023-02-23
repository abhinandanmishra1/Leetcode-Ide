import axios from "axios";

export const checkStatus = async (token) => {
  const options = {
    method: "GET",
    url: 'https://judge0-ce.p.rapidapi.com/submissions/' + token,
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
      "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
    },
  };
  try {
    let response = await axios.request(options);
    let statusId = response.data.status?.id;

    if (statusId === 1 || statusId === 2) {
      //  processing --> so run again the same token after 2s
      setTimeout(() => {
        checkStatus(token)
      }, 2000);
    } else {
      const { data } = response;

      return { success: true, data};
    }
  } catch (err) {
    return {success: false, err};
  }
};

export const submitCode = async (formData) => {
  const options = {
    method: "POST",
    url: 'https://judge0-ce.p.rapidapi.com/submissions',
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "content-type": "application/json",
      "Content-Type": "application/json",
      "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
      "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
    },
    data: formData,
  };

  try {
    const { data } = await axios.request(options);

    return { success: true, data};
  }catch(err) {
    return { success: false, err}
  }
}