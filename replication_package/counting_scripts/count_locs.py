import argparse
import os
import re
import subprocess

from tqdm import tqdm


def counter(nodes_path: str):
    nodes_locs = dict()
    languages = ["JavaScript", "HTML", "TypeScript"]
    for node_dir in tqdm(sorted(os.listdir(nodes_path))[2:4]):
        total_locs = 0
        path = os.path.join(nodes_path, node_dir)
        result = subprocess.run(["pygount", "--format=summary", path], stdout=subprocess.PIPE)

        res_str = result.stdout.decode().split("\n")
        # Get position of the "Code"-column in the substring to reliably extract that
        loc_portion = re.search("Code", res_str[3]).span()
        for line in res_str:
            if any(lan in line for lan in languages):
                locs = int(line[loc_portion[0] - 1:loc_portion[1]].strip())
                total_locs += locs

        nodes_locs[node_dir] = total_locs
    
    output_path =  os.path.join("..", "lists", "nodes_locs.txt")
    with open(output_path, "w") as output_file:
        output_file.write("Node, LOCs\n")
        for n in nodes_locs:
            output_file.write(f"{n}, {str(nodes_locs[n])}\n")
    
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-n','--nodes_path', help='Path to node source directories', required=True)
    args = vars(parser.parse_args())
    counter(args["nodes_path"])


