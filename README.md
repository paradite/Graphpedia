# Project Graphpedia

#### Visualize relationships between terms
#### For SoC Orbital Programme 2014

Graphpedia is currently <a href="http://visualize-terms.herokuapp.com" target="_blank">hosted on Heroku</a>

## Setup

### neo4j
+ Check that you have the correct neo4j version (2.3.12)
+ deafult neo4j database url at `http://localhost:7474`
+ set custom neo4j database using environmental variables `GRAPHENEDB_URL` or `NEO4J_URL`
+ configuration neo4j database url in `models/term.js`

docker:

```bash
docker run \
    --restart always \
    --publish=7474:7474 --publish=7687:7687 \
    --volume=$HOME/neo4j/data:/data \
    --name neo4j \
    -d \
    neo4j:2.3.12
```

### mongoDB
+ Check that you have the correct mongoDB version (3.0.15):
```
$ mongod --version
db version v3.0.15
```
+ default mongoDB database url at `mongodb://localhost/passport_local_mongoose`
+ set custom mongoDB database url using environmental variables `MONGOLAB_URI` or `MONGOHQ_URL`
+ configuration of mongoDB database url in `app.js`

docker:
```bash
docker run --restart always -v $HOME/mongo/db:/data/db -p 27017:27017 --name mongodb -d mongo:3.0.15
```

## Ops

### local


DB sync

```bash
scp -r ~/neo4j/data <>:~/neo4j
```

code sync

```bash
rsync -a --exclude=node_modules/ ~/workspace/Graphpedia <>:~
```

running
```bash
nohup node app.js  > /dev/null 2>&1 &
```

### remote

Setup MongoDB with auth

```bash
sudo docker run --restart always -v $HOME/mongo/db:/data/db -p 27017:27017 --name mongodb -d \
    -e MONGO_INITDB_ROOT_USERNAME=<> \
    -e MONGO_INITDB_ROOT_PASSWORD=<> \
    mongo:3.0.15
```

## TODO List

### Non-UI
+ Better data-mining techniques

+ Add category label for generic categories

+ Abstraction of types
  - Done at all levels except jade rendering

+ Add a significance field for the terms for easier suggestions(terms with higher significance will appear more often)

+ Featured terms (Terms with most dependencies or relationships)

+ Handling of synonyms/ merging terms
  - Create a separate model for synonyms and search inside this database before the terms database

+ Modify algorithm to calculate the height of each term in viz panel

### UI

+ Prettify the graph

+ Allow user to propose a relationship from an existing term to a new non-exisiting term(by typing the name of the new term)

[Node.js]: http://nodejs.org/
[Neo4j]: http://www.neo4j.org/
[node-neo4j]: https://github.com/thingdom/node-neo4j

[coffeescript]: http://www.coffeescript.org/
[streamline]: https://github.com/Sage/streamlinejs
