### Leetcode Ide  [See Live](https://leetcode-ide.vercel.app/)

- It is a clone of Leetcode Ide

**Version-1**
<kbd>![Version-1](https://user-images.githubusercontent.com/64205626/176822891-187fb3b9-f3b4-429f-ace7-2f937ac0f23d.png)</kbd>

https://user-images.githubusercontent.com/64205626/177022732-d633f91a-ae5f-4afc-b002-e30d4023ce2c.mp4


**Understanding Folder Structure [ This was version1 and is moved to another branch ]** 

- There are two folders `client` for frontend `backend` for backend.
- In `client` folder:

  - `app.js` is the Home page or main page.
  - `components` folder have all the components :
    - `CodeEditor` - The editor for writing codes [ Multiple themes/Language support]
    - `CodeInput` - For taking user input same as in leetcode ide
    - `CodeOutput` - For showing the result of the code
    - `Navbar` - It is the basic navbar above editor for providing features of Run Code and theme selection etc.
  - `lib` folder contains a file `defineTheme.js` which is used to define a new theme for the editor
  - `boilerCodes` contains the initial codes for all the languages in the editor

- In `backend` folder:
  - `index.js` is the main file of execution.
  - A post request `/run` is created using Express inside it which is the main request of this project.
  - It gets the `user-code`,`code-language` and `user-input` as request.
  - Then it creates two separate files one for code [like 'a.cpp','a.py','a.js'] and other file for input ['input.txt'] using `generateCodeFile.js`
  - Now Node child process [ exec ] is used to compile the compiled language [cpp] or interpret the interpreted languages [py,js] using `executeCodeFile.js`
  - Return the error or result as promise to frontend.

> This was all about the folder structure and working of the files.


**For Deploying the project**

- As I was not getting any idea how to create a file on mongodb database and then compile that file.
- I researched a lot about it and then I found some online compiler api's that gives support to all languages.
- I will be implementing that in my project and then will deploy it.


---

**Version -2** 

## Using Rapid API and Judge0 
- I have used RapidAPI and JUDGE0 for compiling the codes.


https://user-images.githubusercontent.com/64205626/182112312-18be0413-a8ef-4f99-a676-8f8bd27f4fc2.mp4


### Things that are to be implemented in it
- [ ] Boiler Code for all languages.
- [ ] Facility to save code snippets with some keywords and accessing it
- [ ] Saving the code in system.
- [ ] Save current code in localstorage to avoid loss of code on reload.

### Later on extra features 
- [] Authentication 
- [] Settings, snippets for each user
- [] Many more things

### How to run this project in your local?

- Go to [Judge0-rapidApi](https://rapidapi.com/judge0-official/api/judge0-ce/) and signup if needed
- Create a `.env` file with given keys and values [These values can be taken from above link]
```env
  REACT_APP_RAPID_API_HOST = X-RapidAPI-Host
  REACT_APP_RAPID_API_KEY = X-RapidAPI-Key
  REACT_APP_RAPID_API_URL = X-RapidAPI-Host/submissions
```
