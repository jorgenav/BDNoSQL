file = open("./dblp.xml/data_8")


# print(enumerate(file))
# i=0
# while i < 4:
#     print(file.readline())
#     print(file.readline())
#     i+=1
line_old = ""
with open("./dblp.xml/data_correct", "w+") as f:
    for num,line in enumerate(file):
        # print(line, file=f,end="")
    #     # print(b, file = f)
        if "<article" in line_old:
            if "</article" in line_old:
                f.write("</article>\n")
            if "<author" in line:
                # f.write(line_old)
                f.write(line_old)
            # else:
            #     f.write(line)
        elif "<inproceedings" in line_old:
            if "</inproceedinds" in line_old:
                f.write("</inproceedings>\n")
            if "<author" in line:
                # f.write(line_old)
                f.write(line_old)
            # else:
            #     f.write(line)
        elif "<incollection" in line_old:
            if "</incollection" in line_old:
                f.write("</incollection>\n")
            if "<author" in line:
                # f.write(line_old)
                f.write(line_old)
            # else:
            #     f.write(line)
        else:
            f.write(line_old)
        line_old = line
        # f.write(b)
        # print(b)

f.close()
# for line in file:
#     if "<incollection"