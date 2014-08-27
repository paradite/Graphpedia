<!-- Non-UI: -->
Change viz lines to straight lines
	-Dropped idea

Add category label for generic categories

Abstraction of types
	- Done at all levels except jade rendering

Add a significance field for the terms for easier suggestions(terms with higher significance will appear more often)

Featured terms (Terms with most dependencies or relationships)

Limit the name and description length

<!-- UI:  -->

Modify the graph

Box for term bigger on term.jade

Expand boxes
	- Done

PureCSS

Allow user to propose a relationship from an existing term to a new non-exisiting term(by typing the name of the new term)

Link to wiki page
	- New tab 
	- Add text

Refresh

Main page offer suggestions on relationships 

<!-- Completed: -->

Improve the searching experience for the user.
	- Partial search - neo4j regular expression ".*" 
	- Done 13 July

Use moment.js to manage time and date
	- Show creation time, last viewed, last modified
	- Done 14 July

Data mining
	- From stackoverflow
	- Parse the result
	- Done 20 July

Allow user to search a pair of terms
	- Done with rough UI
	- Done with d3.js UI
	- Done on 26 July

Allow user to propose relationship on index
	- DOne on 26 July

User account management
	- Need to implement admin functions (delete or review proposed edits)
	- Delete function limited to admin - 27 July

Merge terms if same name
	- Merge on creating terms - 27 July

Recent Searches
	- Done 27 July

Show term count and relationship count on index page
	- Done 3 Aug

Automatic reverse relationship
	- Done 4 Aug

Clicking on the label in d3.js will direct the user to the respective term page.
	- Done 24 Aug

# Node-Neo4j Template

This is a template [Node.js][] + [Neo4j][] app, using the
**[node-neo4j][]** library (available on npm as `neo4j`).

A demo is running on Heroku at **<https://node-neo4j-template.herokuapp.com/>**.

The app is a simple social network manager: it lets you add, remove, follow,
and unfollow users.
It's basic, and the UI is crappy, but hey, it's a template app. =)

So try it out, browse the code, and fork this project to get a head start on
coding your own app. Enjoy!


## Installation

```
git clone git@github.com:aseemk/node-neo4j-template.git
cd node-neo4j-template
npm install
```

You'll also need a local Neo4j 2.0 instance.
Install it via **[neo4j.org/download](http://neo4j.org/download)**,
or if you're on a Mac, `brew install neo4j`.


## Usage

Start your local Neo4j instance (e.g. `neo4j start`), then:

```
npm start
```

The app will now be accessible at
[http://localhost:3000/](http://localhost:3000/).

To run the tests:

```
npm test
```


## Deploying

This app is running on Heroku, using the free test version of the
[GrapheneDB add-on](https://addons.heroku.com/graphenedb):

<https://node-neo4j-template.herokuapp.com/>

If you want to run your own instance similarly, it's easy:

```
heroku create [your-app-name]
heroku addons:add graphenedb
git push heroku master
```

There's already a [Procfile](./Procfile) here, and the code already checks for the
necessary `PORT` and `GRAPHENEDB_URL` environment variables,
so your deploy should go off without a hitch!

If you're deploying in another way, the code also checks for a `NEO4J_URL`
environment variable to support pointing to any other Neo4j database.
The value of this variable should be set to the database root URL, and it can
contain HTTP Basic Auth info. E.g. `https://user:pass@1.2.3.4:5678`.

One thing to note is that `npm start` is currently geared towards development:
it runs [node-dev](https://github.com/fgnass/node-dev) instead of node.
Edit `scripts.start` in [package.json](./package.json) if you need to change that.


## Miscellany

- MIT license.
- Questions/comments/etc. are welcome.
- As an exercise, I built this without using [CoffeeScript][coffeescript] or
  [Streamline][streamline]. What a gigantic pain! Never again. =P


[Node.js]: http://nodejs.org/
[Neo4j]: http://www.neo4j.org/
[node-neo4j]: https://github.com/thingdom/node-neo4j

[coffeescript]: http://www.coffeescript.org/
[streamline]: https://github.com/Sage/streamlinejs