import xml.etree.ElementTree as ET
from collections import OrderedDict
import pandas
# import threading


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


xml_file = 'data/dblp.' + str(self.filenum) + '.xml'

e = ET.parse(xml_file, parser=parser).getroot()

tot_docs = len(e)
doc_number = 0
mitad = False
max_mitad = False
complete = False
found = False


# html.unescape(f.read()).replace('&','&#038;')

d = {}
docs = ['article', 'inproceedings', 'incollection']
tags = ['author', 'year', 'month', 'title', 'booktitle']


# Borrado previo del fichero de resultados
with open('data/result' + str(self.filenum) +'.txt', 'w') as out:
    out.writelines('')


    # Almacenamiento de valores en dicc para volcado posterior a json
    for child1 in e:
        if ((doc_number / tot_docs > 0.5) & (not mitad)):
            print('50% de los documentos procesados en el thread',str(self.filenum))
            mitad = True
        if ((doc_number / tot_docs > 0.9) & (not max_mitad)):
            print('90% de los documentos procesados en el thread',str(self.filenum))
            max_mitad = True
        if ((doc_number / tot_docs == 1.0) & (not complete)):
            print('100% de los documentos procesados en el thread',str(self.filenum))
            complete = True
        if (child1.tag in docs):
            if (child1.tag == 'inproceedings') & (not found):
                print('Al menos un inproceeding encontrado en fichero',str(self.filenum))
                found = True
            d[child1.tag] = OrderedDict()
            d[child1.tag]['doc_type'] = child1.tag
            d[child1.tag]['author'] = []
            for key, value in child1.attrib.items():
                d[child1.tag][key] = value
            for child2 in child1:
                if (child2.tag in tags):
                    if (child2.tag == 'author'):
                        d[child1.tag]['author'].append(child2.text)
                    else:
                        d[child1.tag][child2.tag] = child2.text
            out.writelines(json.dumps(d[child1.tag])+'\n')
        doc_number += 1
out.close()
