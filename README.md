This project has two different projects in the two initial tabs:
1. File System App
2. Url Shortener

(For the file system application, records get stored in localstorage on your browser)

### Installation Scripts

1. **Client side** \
In the Project directory, please run the following after making sure you have npm installed:\
`npm install`
2. **Server side** \
Go into the 'backend' directory and please run the following command after making sure you have anaconda installed:\
`conda env create -f environment.yml`\
`conda activate pipe_17`
3. **Database** \
Run the following scripts to pull mongo from Docker Hub assuming Docker is installed:\
`docker pull mongo`

### Run Scripts
1. **Client side** \
In the project directory, you can run:\
  `npm start`\
Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
2. **Server side** \
Go into the 'backend' directory and please run the following commands:\
`python server.py`\
If you would like to use MongoDB to store, please set the variable USE_MONGO to *True* in the same file.
3. **Database** \
Run the following to get mongodb up and running if necessary:\
`docker run -p 27017:27017 --name mongodb mongo`