
def file_len(fname):
    with open(fname) as f:
        for i, l in enumerate(f):
            pass
    return i

with open('../../../data/result_total.json','w') as output:
    output.write('')

    output.write('[')
    readed = False
    for i in range(7):
        json_file = '../../../data/result' + str(i) + '.txt'
        with open(json_file, 'r') as insert:
            n = 0
            for line in insert:
                if i < 6:
                    # pass
                    # line = line.strip('\n')[1] + ',\n'
                    line = line[:-1] + ',\n'
                elif i == 6:
                    if readed == False:
                        long = file_len(json_file)
                        readed = True
                    if n < long:
                        line = line[:-1] + ',\n'
                    else:
                        line = line[:-1]
                output.write(line)
                n += 1
            insert.close()
    output.write(']')
