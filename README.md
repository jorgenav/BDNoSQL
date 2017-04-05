# BDNoSQL
Data analysis project with NoSQL data bases. Authors: Jon Kobeaga and Jorge Navarro.

Data source -> http://dblp.uni-trier.de/

## Introduction
DBLP Computer Science Bibliography data base is considered to be the largest collection of computing academic references. It stores data of scientific journals and academic conferences among others. MongoDB and Neo4j will be used to store and analyse the downloaded information.

For MongoDB it is necessary to preprocess the data prior to its insertion in the data base. Data source is a XML file that needs to be converted to JSON format.

## Data convertion
Data source (2Gb file) is splitted into smaller parts to be preprocessed.
