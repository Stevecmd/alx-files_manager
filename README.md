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

bob@dylan:~$ cat 1-main.js
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

bob@dylan:~$ npm run dev 1-main.js
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

steve@ubuntu:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"id":"6752d1c7b7ad127a2b707b6b","email":"bob@dylan.com"}
stevecmd@stevecmd-HP-ENVY-15-Notebook-PC:/media/stevecmd/48

steve@ubuntu$ echo 'db.users.find()' | mongo files_manager
MongoDB shell version v4.4.29
connecting to: mongodb://127.0.0.1:27017/files_manager?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("e2b2ebe0-a271-4fb1-a998-9dd165ec86b5") }
MongoDB server version: 8.0.3
WARNING: shell and server versions do not match
{ "_id" : ObjectId("6752d1c7b7ad127a2b707b6b"), "email" : "bob@dylan.com", "password" : "89cad29e3ebc1035b29b1478a8e70854f25fa2b2" }
bye
steve@ubuntu$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
{"error":"Already exist"}
{error:Already exist}: command not found
steve@ubuntu$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
steve@ubuntu$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com" }' ; echo ""
{"error":"Missing password"}

```