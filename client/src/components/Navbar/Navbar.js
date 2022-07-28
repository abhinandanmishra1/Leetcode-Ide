import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";
import ThemeDropdown from "../Dropdowns/ThemeDropdown";
const Navbar = ({
	language,
	setLanguage,
	setTheme,
	theme,
	setOutput,
	setStatus,
	testInput,
	code
}) => {
	const checkStatus = async (token) => {
		console.log("checking status")
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
        }, 2000)
        return
      } else {
        setOutput(response.data)
        setStatus(`Finished`)
        console.log('response.data', response.data)
        return
      }
    } catch (err) {
      console.log("err", err);
    }
  };

	const handleSubmit = async () => {
		setStatus("Running");
		const formData={
			language_id: language.id,
      source_code: btoa(code),
      stdin: btoa(testInput),
		}
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
		await axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        console.log(error);
      });
		
	};
	return (
		<div className="ml-2 mt-2 w-full flex h-8 md:h-12 justify-between mb-2">
			<button
				onClick={() => {
					handleSubmit();
				}}
				className="bg-[#5cb85c] border-[#4cae4c] border-1 text-white rounded-full md:p-2 p-1 w-32 text-sm md:text-base hover:border-[#398439] hover:bg-[#449d44] ">
				<FontAwesomeIcon
					icon={faPlayCircle}
					className="mr-2"
					color="white"
					size="sm"
				/>
				<span>Run Code</span>
			</button>
			<div className="flex md:w-1/2 w-2/3 justify-around">
				<LanguageDropdown language={language} setLanguage={setLanguage}/>
				<ThemeDropdown theme={theme} setTheme={setTheme} />
			</div>
		</div>
	);
};

export default Navbar;
