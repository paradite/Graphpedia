Project Graphpedia
===
####Visualize relationships between terms
#####For SoC Orbital Programme 2014

Graphpedia is currently [hosted on Heroku](http://visualize-terms.herokuapp.com) 

TODO List
---
####Non-UI
+ Better data-mining techniques

+ Add category label for generic categories

+ Abstraction of types
	- Done at all levels except jade rendering

+ Add a significance field for the terms for easier suggestions(terms with higher significance will appear more often)

+ Featured terms (Terms with most dependencies or relationships)

+ Handling of synonyms/ merging terms
	- Create a separate model for synonyms and search inside this database before the terms database

+ Modify algorithm to calculate the height of each term in viz panel

####UI

+ Prettify the graph

+ Allow user to propose a relationship from an existing term to a new non-exisiting term(by typing the name of the new term)

[Node.js]: http://nodejs.org/
[Neo4j]: http://www.neo4j.org/
[node-neo4j]: https://github.com/thingdom/node-neo4j

[coffeescript]: http://www.coffeescript.org/
[streamline]: https://github.com/Sage/streamlinejs