import xml.etree.ElementTree as ET
from collections import OrderedDict
import pandas as pd
import numpy as np


parser = ET.XMLParser(encoding='ISO-8859-1')

parser.entity["agrave"] = 'à'
parser.entity["uuml"] = 'ü'
parser.entity["Eacute"] = 'É'
parser.entity["eacute"] = 'é'
parser.entity["aacute"] = 'á'
parser.entity["iacute"] = 'í'
parser.entity["ouml"] = 'ö'
parser.entity["ccedil"] = 'ç'
parser.entity["egrave"] = 'è'
parser.entity["auml"] = 'ä'
parser.entity["uacute"] = 'ú'
parser.entity["aring"] = 'å'
parser.entity["oacute"] = 'ó'
parser.entity["szlig"] = 'ß'
parser.entity["oslash"] = 'ø'
parser.entity["yacute"] = 'ỳ'
parser.entity["iuml"] = 'ï'
parser.entity["igrave"] = 'í'
parser.entity["ocirc"] = 'ô'
parser.entity["icirc"] = 'î'
parser.entity["Uuml"] = 'Ü'
parser.entity["euml"] = 'ë'
parser.entity["acirc"] = 'â'
parser.entity["atilde"] = 'ã'
parser.entity["Uacute"] = 'Ù'
parser.entity["Aacute"] = 'À'
parser.entity["ntilde"] = 'ñ'
parser.entity["Auml"] = 'Ä'
parser.entity["Oslash"] = 'Ø'
parser.entity["Ccedil"] = 'Ç'
parser.entity["otilde"] = 'õ'
parser.entity["ecirc"] = 'ê'
parser.entity["times"] = '×'
parser.entity["Ouml"] = 'Ö'
parser.entity["reg"] = '®'
parser.entity["Aring"] = 'Å'
parser.entity["Oacute"] = 'Ò'
parser.entity["ograve"] = 'ó'
parser.entity["yuml"] = 'ÿ'
parser.entity["eth"] = 'ð'
parser.entity["aelig"] = 'æ'
parser.entity["AElig"] = 'Æ'
parser.entity["Agrave"] = 'Á'
parser.entity["Iuml"] = 'Ï'
parser.entity["micro"] = 'µ'
parser.entity["Acirc"] = 'Â'
parser.entity["Otilde"] = 'Õ'
parser.entity["Egrave"] = 'É'
parser.entity["ETH"] = 'Ð'
parser.entity["ugrave"] = 'ú'
parser.entity["ucirc"] = 'û'
parser.entity["thorn"] = 'þ'
parser.entity["THORN"] = 'Þ'
parser.entity["Iacute"] = 'Ì'
parser.entity["Icirc"] = 'Î'
parser.entity["Ntilde"] = 'Ñ'
parser.entity["Ecirc"] = 'Ê'
parser.entity["Ocirc"] = 'Ô'
parser.entity["Ograve"] = 'Ó'
parser.entity["Igrave"] = 'Í'
parser.entity["Atilde"] = 'Ã'
parser.entity["Yacute"] = 'Ỳ'
parser.entity["Ucirc"] = 'Û'
parser.entity["Euml"] = 'Ë'


xml_file = '../../../data/dblp.0.xml'
# xml_file = '../../../data/dblp.xml'

e = ET.parse(xml_file, parser=parser).getroot()

# html.unescape(f.read()).replace('&','&#038;')

d = {}
docs = ['article', 'inproceedings', 'incollection']
tags = ['author', 'year', 'title']

dict_autores = OrderedDict()
dict_autores["authorId:ID(Authors)"] = []
dict_autores["name"] = []
dict_autores[":LABEL"] = []

dict_publicaciones = OrderedDict()
dict_publicaciones["pubId:ID(Pubs)"] = []
dict_publicaciones["Title"] = []
dict_publicaciones["Year"] = []
dict_publicaciones["Tipo"] = []
dict_publicaciones[":LABEL"] = []

dict_rel_AA = OrderedDict()
dict_rel_AA[":START_ID(Authors)"] = []
dict_rel_AA["Title"] = []
dict_rel_AA["Year"] = []
dict_rel_AA[":END_ID(Authors)"] = []
dict_rel_AA[":TYPE"] = []

dict_autores_general = {}
dict_pub_general = {}

dict_rel_AP = OrderedDict()
dict_rel_AP[":START_ID(Authors)"] = []
dict_rel_AP[":END_ID(Pubs)"] = []
dict_rel_AP[":TYPE"] = []



authorId = 1
pubId = 1

# Almacenamiento de valores en dicc para volcado posterior a json
for child1 in e:
    list_rel_AA = []
    list_rel_AP = []
    # print("Next doc---------------------------------------------")
    if (child1.tag in docs):

        # d[child1.tag] = OrderedDict()
        # d[child1.tag]['doc_type'] = child1.tag
        # d[child1.tag]['author'] = []
        dict_publicaciones[":LABEL"].append("Pub")
        dict_publicaciones["Tipo"].append(child1.tag)

        for child2 in child1:
            if (child2.tag in tags):
                if (child2.tag == 'title'):
                    dict_publicaciones["pubId:ID(Pubs)"].append(pubId)
                    dict_publicaciones["Title"].append(child2.text)
                    title_rel_AA = child2.text
                    # dict_rel_AP[":END_ID(Pubs)"].append(dict_pub_general[child2.text])
                    dict_pub_general[child2.text] = pubId
                    pubId += 1
                elif (child2.tag == 'year'):
                    dict_publicaciones["Year"].append(child2.text)
                    year_rel_AA = child2.text
                elif (child2.tag == 'author'):
                    if child2.text not in dict_autores["name"]:
                        dict_autores["authorId:ID(Authors)"].append(authorId)
                        dict_autores["name"].append(child2.text)

                        dict_autores_general[child2.text] = authorId

                        dict_autores[":LABEL"].append("Autor")
                        authorId += 1
                    if child2.text not in list_rel_AA:
                        list_rel_AA.append(dict_autores_general[child2.text])


                        # list_rel_AA.append(dict_autores["name"])

                        # dict_autores["name"] == child2.text
                        # dict_autores["authorId:ID(Author)"]


                    # d[child1.tag]['author'].append(child2.text)
                else:
                    # d[child1.tag][child2.tag] = child2.text
                    pass
        cont_rel_AA = 0
        for i in range(len(list_rel_AA)):
            # print(len(list_rel_AA))
            dict_rel_AP[":START_ID(Authors)"].append(list_rel_AA[i])
            dict_rel_AP[":TYPE"].append("Autoria")
            dict_rel_AP[":END_ID(Pubs)"].append(dict_pub_general[title_rel_AA])
            # print(dict_rel_AP[":START_ID(Authors)"])
            # print(dict_rel_AP[":TYPE"])
            # print(dict_rel_AP[":END_ID(Pubs)"])

            for j in range(i+1,len(list_rel_AA)):
                dict_rel_AA[":START_ID(Authors)"].append(list_rel_AA[i])
                dict_rel_AA[":END_ID(Authors)"].append(list_rel_AA[j])
                # print(cont_rel_AA)
                # print(list_rel_AA[i])
                # print(list_rel_AA[j])
                cont_rel_AA += 1

        dict_rel_AA[":TYPE"] = np.repeat("Collaborate", len(dict_rel_AA[":START_ID(Authors)"]))
        for x in np.repeat(title_rel_AA, cont_rel_AA):
            dict_rel_AA["Title"].append(x)
        for x in np.repeat(year_rel_AA, cont_rel_AA):
            dict_rel_AA["Year"].append(x)



# CREACION DE DATAFRAMES
autores = pd.DataFrame(dict_autores)
publicaciones = pd.DataFrame(dict_publicaciones)
relation_AA = pd.DataFrame(dict_rel_AA)
relation_AP = pd.DataFrame(dict_rel_AP)

autores.to_csv("results/autores_T.csv", index = False)
publicaciones.to_csv("results/publicaciones_T.csv", index = False)
relation_AA.to_csv("results/relation_AA.csv_T", index = False)
relation_AP.to_csv("results/relation_AP.csv_T", index = False)

# with open("results/autores.csv", "w") as out:
#     out.write(autores)
#
# with open("results/publicaciones.csv", "w") as out:
#     out.write(publicaciones)
#
# with open("results/relation_AA.csv", "w") as out:
#     out.write(relation_AA)
#
# with open("results/relation_AP.csv", "w") as out:
#     out.write(relation_AP)


# out.writelines(json.dumps(d[child1.tag])+'\n')



# print(autores)
# print(publicaciones)
# print(relation_AA)
# print(relation_AP)

