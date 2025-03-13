import os
from tqdm import tqdm # type: ignore
from bs4 import BeautifulSoup # type: ignore
import re
from typing import Union


def extract_html_file_paths(node_source_path: str) -> list:
    """Goes through the downloaded package and returns all paths to .js and .html files in it.
    """

    html_files = list()
    for root, dirs, files in os.walk(node_source_path, topdown=False):
        for name in files:
            if name.split(".")[-1] == "html":
                html_files.append(os.path.join(root, name))

    return html_files


def count_nodes(html_file_paths: list) -> Union[int, None]:
    nr_nodes = 0
    
    for html_file_path in html_file_paths:
        contents = False
        try:
            with open(html_file_path, "r") as file_html:
                contents = file_html.read()
        except Exception as e:
            print(e)
        if contents:
            html_raw = str(BeautifulSoup(contents, "html.parser"))
            new_nodes = len(re.findall('RED.nodes.registerType', html_raw))
            nr_nodes += new_nodes
    return nr_nodes


def main(base_path: str) -> None:
    node_sources_path = os.path.join(base_path, "data", "node_sources")
    total_nr_nodes = 0

    nodes = [x for x in os.listdir(node_sources_path) if not x[0] == "."]
    nodes.sort(key = lambda x: int(x.split('_')[0]))
    
    node_numbers = list()

    with open(os.path.join("..", "lists", "node_numbers_per_node.txt"), "w") as output_file:
        for node_source in tqdm(nodes):
            if node_source[0] == ".":
                continue
            else:
                html_file_paths = extract_html_file_paths(os.path.join(node_sources_path, node_source))
                new_nodes = count_nodes(html_file_paths)
                node_numbers.append(new_nodes)
                total_nr_nodes += new_nodes
            
                output_file.write(f"{node_source}, {str(new_nodes)}")

    print(total_nr_nodes)

    return

if __name__ == "__main__":
    main(".")