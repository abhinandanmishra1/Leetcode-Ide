### Leetcode Ide

- It is a clone of Leetcode Ide

**Version-1**
<kbd>![Version-1](https://user-images.githubusercontent.com/64205626/176822891-187fb3b9-f3b4-429f-ace7-2f937ac0f23d.png)</kbd>


https://user-images.githubusercontent.com/64205626/177022732-d633f91a-ae5f-4afc-b002-e30d4023ce2c.mp4



**Understanding Folder Structure**

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
