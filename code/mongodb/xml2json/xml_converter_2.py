import xml.etree.ElementTree as etree
from bs4 import BeautifulSoup
import json
from collections import OrderedDict


file = open("./dblp.xml/data_correct")
bsObj = BeautifulSoup(file, "lxml")
# print(bsObj)

with open('./dblp.xml/publications_5.json', 'w+') as f:
    i=1
    # for art in bsObj.find_all(["article", "inproceedings"]):
    # for art in bsObj.find_all(["incollection"]):
    for art in bsObj.find_all(["incollection","article", "inproceedings"]):
    # for art in bsObj:
            print(i)
            i += 1
            # print(art.author.get_text())

        #     # Extract the information of each paper
        #     id =art.attrs["key"].split("/")[-1]
            # print(id)
            title = art.title.get_text()
            # print(title)
            year = int(art.year.get_text())
            type = art.name
            mdate = art.attrs["mdate"]
            authors = []
            for aut in art.findAll("author"):
                dicc_aut = dict()
                dicc_aut["Nombre"] = aut.get_text()
                authors.append(dicc_aut)
                # print(aut.get_text())
        #     if info.authors:
        #         for aut in info.authors:
        #             dicc_aut = dict()
        #             dicc_aut["Nombre"] = aut.get_text()
        #             authors.append(dicc_aut)
        #
            # Create a collection of Mongodb using a Python dictionary
            dicc = OrderedDict()
            # dicc["_id"] = id
            dicc["Title"] = title
            dicc["Year"] = int(year)
            dicc["Mdate"] = mdate
            dicc["Type"] = type
            dicc["Authors"] = authors
            # Write into a json file
            f.write(json.dumps(dicc, "./dblp.xml/publications_5", indent = None,separators=None,))
            f.write("\n")
            # print(dicc)
            # print(dicc)
f.close()
