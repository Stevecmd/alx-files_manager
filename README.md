# alx-files_manager
This project is a summary of this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

Technologies used:
- JavaScript
- ES6
- NoSQL
- MongoDB
- Redis
- NodeJS
- ExpressJS
- Kue 

This project is a summary of this back-end trimester: `authentication`, `NodeJS`, `MongoDB`, `Redis`, `pagination` and `background processing`.

The objective is to build a simple platform to upload and view files:

- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

# Resources

Read or watch:

- [Node JS getting started](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [Process API doc](https://node.readthedocs.io/en/latest/api/process/)
- [Express getting started](https://expressjs.com/en/starter/installing.html)
- [Mocha documentation](https://mochajs.org/)
- [Nodemon documentation](https://github.com/remy/nodemon#nodemon)
- [MongoDB](https://github.com/mongodb/node-mongodb-native)
- [Bull](https://github.com/OptimalBits/bull)
- [Image thumbnail](https://www.npmjs.com/package/image-thumbnail)
- [Mime-Types](https://www.npmjs.com/package/mime-types)
- [Redis](https://github.com/redis/node-redis)

## Learning Objectives

At the end of this project, you are expected to be able to explain to anyone, without the help of Google:

- how to create an API with Express
- how to authenticate a user
- how to store data in MongoDB
- how to store temporary data in Redis
- how to setup and use a background worker

### Redis
To stop Redis run:
```sh
sudo systemctl stop redis
sudo systemctl disable redis

```

Verify if Redis Has Stopped
```sh
ps aux | grep redis-server

```

Running Redis as a Docker container:
Build
```sh
docker build -t my-redis-server -f Dockerfile-redis .
```
Run
```sh
docker run -d -p 6379:6379 --name my-redis-container my-redis-server
```
File: `Dockerfile-redis`

### MongoDB
To stop Mongodb run:
```sh
sudo systemctl stop mongodb
sudo systemctl disable mongodb

```

Verify if Mongodb Has Stopped
```sh
ps aux | grep mongo-server

```

Running MongoDB as a Docker container:
Build
```sh
docker build -t my-mongodb-server -f Dockerfile-mongodb .
```
Run
```sh
docker run -d -p 27017:27017 --name my-mongodb-container my-mongodb-server
```
File: `Dockerfile-mongodb`

# Tasks
0. Redis utils

Inside the folder `utils`, create a file `redis.js` that contains the class `RedisClient`.

`RedisClient` should have:

- the constructor that creates a client to Redis:
    - any error of the redis client must be displayed in the console (you should use `on('error')` of the redis client)
- a function `isAlive` that returns `true` when the connection to Redis is a success otherwise, `false`
- an asynchronous function `get` that takes a string key as argument and returns the Redis value stored for this key
- an asynchronous function `set` that takes a string key, a value and a duration in second as- arguments to store it in Redis (with an expiration set by the duration argument)
- an asynchronous function `del` that takes a string key as argument and remove the value in Redis for this key

After the class definition, create and export an instance of `RedisClient` called `redisClient`.

```sh

steve@ubuntu:~$ cat 0-main.js
import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000*10)
})();

npm run dev 0-main.js

> files_manager@1.0.0 dev
> nodemon --exec babel-node --presets @babel/preset-env 0-main.js

[nodemon] 2.0.22
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `babel-node --presets @babel/preset-env 0-main.js`
true
Redis client connected to the server
null
12
null
```

1. MongoDB utils
Inside the folder utils, create a file `db.js` that contains the class `DBClient`.

`DBClient` should have:

- the constructor that creates a client to MongoDB:
    - host: from the environment variable `DB_HOST` or default: `localhost`
    - port: from the environment variable `DB_PORT` or default: `27017`
    - database: from the environment variable `DB_DATABASE` or default: `files_manager`
- a function `isAlive` that returns `true` when the connection to MongoDB is a success otherwise, `false`
- an asynchronous function `nbUsers` that returns the number of documents in the collection `users`
- an asynchronous function `nbFiles` that returns the number of documents in the collection `files`

After the class definition, create and export an instance of `DBClient` called `dbClient`.

```sh

steve@ubuntu:~$ cat 1-main.js
import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();

steve@ubuntu:~$ npm run dev 1-main.js
false
true
4
30
```
File: `utils/db.js`

2. First API
Inside `server.js`, create the Express server:

- it should listen on the port set by the environment variable `PORT` or by default 5000
- it should load all routes from the file `routes/index.js`

Inside the folder `routes`, create a file `index.js` that contains all endpoints of our API:

- `GET /status` => `AppController.getStatus`
- `GET /stats` => `AppController.getStats`

Inside the folder `controllers`, create a file `AppController.js` that contains the definition of the 2 endpoints:

- `GET /status` should return if Redis is alive and if the DB is alive too by using the 2 utils created previously: `{ "redis": true, "db": true }` with a status code 200
-` GET /stats` should return the number of users and files in DB: `{ "users": 12, "files": 1231 }` with a status code 200
    - `users` collection must be used for counting all users
    - `files` collection must be used for counting all files

Terminal 1:
```sh

npm run start-server

> files_manager@1.0.0 start-server
> nodemon --exec babel-node --presets @babel/preset-env ./server.js

[nodemon] 2.0.22
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `babel-node --presets @babel/preset-env ./server.js`
Server running on port 5000
Redis client connected to the server
Promise { <pending> }
MongoDB client connected to the server

```

Terminal :
```sh

steve@ubuntu$ curl 0.0.0.0:5000/status ; echo ""
{"redis":true,"db":true}
steve@ubuntu$ curl 0.0.0.0:5000/stats ; echo ""
{"users":0,"files":0}

```

3. Create a new user
Now that we have a simple API, it’s time to add users to our database.

In the file `routes/index.js`, add a new endpoint:

- `POST /users` => `UsersController.postNew`

Inside `controllers`, add a file `UsersController.js` that contains the new endpoint:

`POST /users` should create a new user in DB:

- To create a user, you must specify an `email` and a `password`
- If the `email` is missing, return an error `Missing email` with a status code 400
- If the `password` is missing, return an error `Missing password` with a status code 400
- If the `email` already exists in DB, return an error `Already exist `with a status code 400
- The `password` must be stored after being hashed in SHA1
- The endpoint is returning the new user with only the `email` and the `id` (auto generated by MongoDB) with a status code 201
- The new user must be saved in the collection `users`:
    - `email`: same as the value received
    - `password`: SHA1 value of the value received
```sh

steve@ubuntu:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "steve@ubuntu.com", "password": "toto1234!" }' ; echo ""
{"id":"6752d1c7b7ad127a2b707b6b","email":"steve@ubuntu.com"}
stevecmd@stevecmd-HP-ENVY-15-Notebook-PC:/media/stevecmd/48

steve@ubuntu$ echo 'db.users.find()' | mongo files_manager
MongoDB shell version v4.4.29
connecting to: mongodb://127.0.0.1:27017/files_manager?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("e2b2ebe0-a271-4fb1-a998-9dd165ec86b5") }
MongoDB server version: 8.0.3
WARNING: shell and server versions do not match
{ "_id" : ObjectId("6752d1c7b7ad127a2b707b6b"), "email" : "steve@ubuntu.com", "password" : "89cad29e3ebc1035b29b1478a8e70854f25fa2b2" }
bye
steve@ubuntu$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "steve@ubuntu.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
{"error":"Already exist"}
{error:Already exist}: command not found
steve@ubuntu$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "steve@ubuntu.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
steve@ubuntu$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "steve@ubuntu.com" }' ; echo ""
{"error":"Missing password"}

```
File: `utils/`, `routes/index.js`, `controllers/UsersController.js`

4. Authenticate a user

In the file `routes/index.js`, add 3 new endpoints:

- `GET /connect` => `AuthController.getConnect`
- `GET /disconnect` => `AuthController.getDisconnect`
- `GET /users/me` => `UserController.getMe`

Inside `controllers`, add a file `AuthController.js` that contains new endpoints:

`GET /connect` should sign-in the user by generating a new authentication token:

- By using the header `Authorization` and the technique of the Basic auth (Base64 of the `<email>:<password>`), find the user associate to this email and with this password (reminder: we are storing the SHA1 of the password)
- If no user has been found, return an error `Unauthorized` with a status code 401
    Otherwise:
    - Generate a random string (using `uuidv4`) as token
    - Create a key: `auth_<token>`
    - Use this key for storing in Redis (by using the redisClient create previously) the user ID for 24 hours
    - Return this token: `{ "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }` with a status code 200

Now, we have a way to identify a user, create a token (= avoid to store the password on any front-end) and use this token for 24h to access to the API!

Every authenticated endpoints of our API will look at this token inside the header `X-Token`.

`GET /disconnect` should sign-out the user based on the token:

- Retrieve the user based on the token:
    - If not found, return an error `Unauthorized` with a status code 401
    - Otherwise, delete the token in Redis and return nothing with a status code 204

Inside the file `controllers/UsersController.js` add a new endpoint:

`GET /users/me` should retrieve the user base on the token used:

- Retrieve the user based on the token:
    - If not found, return an error `Unauthorized` with a status code 401
    - Otherwise, return the user object (`email` and `id` only)
```sh
steve@ubuntu:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"031bffac-3edc-4e51-aaae-1c121317da8a"}
steve@ubuntu:~$ 
steve@ubuntu:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"id":"5f1e7cda04a394508232559d","email":"steve@ubuntu.com"}
steve@ubuntu:~$ 
steve@ubuntu:~$ curl 0.0.0.0:5000/disconnect -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""

steve@ubuntu:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"error":"Unauthorized"}

```
File: `utils/`, `routes/index.js`, `controllers/UsersController.js`, `controllers/AuthController.js`

5. First File

In the file `routes/index.js`, add a new endpoint:

- `POST /files `=> `FilesController.postUpload`

Inside `controllers`, add a file `FilesController.js` that contains the new endpoint:

`POST /files` should create a new file in DB and in disk:

- Retrieve the user based on the token:
    - If not found, return an error `Unauthorized` with a status code 401
- To create a file, you must specify:
        - `name`: as filename
        - `type`: either `folder`, `file` or `image`
        - `parentId`: (optional) as ID of the parent (default: 0 -> the root)
        - `isPublic`: (optional) as boolean to define if the file is public or not (default: false)
        - `data`: (only for `type=file|image)` as Base64 of the file content
- If the `name` is missing, return an error `Missing name` with a status code 400
- If the `type` is missing or not part of the list of accepted type, return an error `Missing type` with a status code 400
- If the `data` is missing and `type != folder`, return an error `Missing data` with a status code 400
- If the `parentId` is set:
    - If no file is present in DB for this `parentId`, return an error `Parent not found` with a status code 400
    - If the file present in DB for this `parentId` is not of type folder, return an error- Parent is not a folder with a status code 400
- The user ID should be added to the document saved in DB - as owner of a file
- If the type is `folder`, add the new file document in the DB and return the new file with a status code 201
- Otherwise:
    - All file will be stored locally in a folder (to create automatically if not present):
        - The relative path of this folder is given by the environment variable `FOLDER_PATH`
        - If this variable is not present or empty, use `/tmp/files_manager` as storing folder path
    - Create a local path in the storing folder with filename a UUID
    - Store the file in clear (reminder: `data` contains the Base64 of the file) in this local path
    - Add the new file document in the collection `files` with these attributes:
        - `userId`: ID of the owner document (owner from the authentication)
        - `name`: same as the value received
        - `type`: same as the value received
        - `isPublic`: same as the value received
        - `parentId`: same as the value received - if not present: 0
        - `localPath`: for a `type=file|image`, the absolute path to the file save in local
    - Return the new file with a status code 201

```sh

steve@ubuntu:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"f21fb953-16f9-46ed-8d9c-84c6450ec80f"}
steve@ubuntu:~$ 
steve@ubuntu:~$ curl -XPOST 0.0.0.0:5000/files -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" -H "Content-Type: application/json" -d '{ "name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" }' ; echo ""
{"id":"5f1e879ec7ba06511e683b22","userId":"5f1e7cda04a394508232559d","name":"myText.txt","type":"file","isPublic":false,"parentId":0}
steve@ubuntu:~$
steve@ubuntu:~$ ls /tmp/files_manager/
2a1f4fc3-687b-491a-a3d2-5808a02942c9
steve@ubuntu:~$
steve@ubuntu:~$ cat /tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9 
Hello Webstack!
steve@ubuntu:~$
steve@ubuntu:~$ curl -XPOST 0.0.0.0:5000/files -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" -H "Content-Type: application/json" -d '{ "name": "images", "type": "folder" }' ; echo ""
{"id":"5f1e881cc7ba06511e683b23","userId":"5f1e7cda04a394508232559d","name":"images","type":"folder","isPublic":false,"parentId":0}
steve@ubuntu:~$
steve@ubuntu:~$ cat image_upload.py
import base64
import requests
import sys

file_path = sys.argv[1]
file_name = file_path.split('/')[-1]

file_encoded = None
with open(file_path, "rb") as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = { 'name': file_name, 'type': 'image', 'isPublic': True, 'data': file_encoded, 'parentId': sys.argv[3] }
r_headers = { 'X-Token': sys.argv[2] }

r = requests.post("http://0.0.0.0:5000/files", json=r_json, headers=r_headers)
print(r.json())

steve@ubuntu:~$
steve@ubuntu:~$ python image_upload.py image.png f21fb953-16f9-46ed-8d9c-84c6450ec80f 5f1e881cc7ba06511e683b23
{'id': '5f1e8896c7ba06511e683b25', 'userId': '5f1e7cda04a394508232559d', 'name': 'image.png', 'type': 'image', 'isPublic': True, 'parentId': '5f1e881cc7ba06511e683b23'}
steve@ubuntu:~$
steve@ubuntu:~$ echo 'db.files.find()' | mongo files_manager
{ "_id" : ObjectId("5f1e881cc7ba06511e683b23"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "images", "type" : "folder", "parentId" : "0" }
{ "_id" : ObjectId("5f1e879ec7ba06511e683b22"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "myText.txt", "type" : "file", "parentId" : "0", "isPublic" : false, "localPath" : "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9" }
{ "_id" : ObjectId("5f1e8896c7ba06511e683b25"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "image.png", "type" : "image", "parentId" : ObjectId("5f1e881cc7ba06511e683b23"), "isPublic" : true, "localPath" : "/tmp/files_manager/51997b88-5c42-42c2-901e-e7f4e71bdc47" }
steve@ubuntu:~$
steve@ubuntu:~$ ls /tmp/files_manager/
2a1f4fc3-687b-491a-a3d2-5808a02942c9   51997b88-5c42-42c2-901e-e7f4e71bdc47

```

> My work:

- Connect and get the token:
```sh
curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"c3a19fa3-525d-4ee9-a27b-e1e08b85ce5f"}
```

- Get user information:
```sh
curl 0.0.0.0:5000/users/me -H "X-Token: c3a19fa3-525d-4ee9-a27b-e1e08b85ce5f" ; echo ""
{"id":"6752d1c7b7ad127a2b707b6b","email":"steve@ubuntu.com"}
```

- Create a file:
```sh
curl -XPOST 0.0.0.0:5000/files -H "X-Token: c3a19fa3-525d-4ee9-a27b-e1e08b85ce5f" -H "Content-Type: application/json" -d '{ 
"name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" }' ; echo
 ""
{"id":"675333b0f4354f8f4c175919","userId":"6752d1c7b7ad127a2b707b6b","name":"myText.txt","type":"file","isPublic":false,"parentId":0}
```

- Create a folder:
```sh
curl -XPOST 0.0.0.0:5000/files -H "X-Token: c3a19fa3-525d-4ee9-a27b-e1e08b85ce5f" -H "Content-Type: application/json" -d '{ "name": "images", "type": "folder" }' ; echo ""
```

- Upload a file:
```sh
curl -XPOST 0.0.0.0:5000/files -H "X-Token: c3a19fa3-525d-4ee9-a27b-e1e08b85ce5f" -H "Content-Type: application/json" -d '{ "name": "images", "type": "folder" }' ; echo ""
```

- ls /tmp/files_manager/ </br>
`90c8e949-b4bf-421b-9a6b-1fb5f740eef1`

Upload a file to a folder: </br>
`python image_upload.py image.jpeg c3a19fa3-525d-4ee9-a27b-e1e08b85ce5f 675334cdf4354f8f4c17591a`