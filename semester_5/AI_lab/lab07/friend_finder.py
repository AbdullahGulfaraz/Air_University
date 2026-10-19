network = {
    "Ali": ["Bilal", "Sara"],
    "Bilal": ["Ali", "Zara"],
    "Sara": ["Ali", "Omar"],
    "Zara": ["Bilal", "Hira"],
    "Omar": ["Sara"],
    "Hira": ["Zara"],
}

def bfs_shortest_path(graph, start, goal):
    visited = [start]
    queue = [[start]]

    while queue:
        path = queue.pop(0)
        node = path[-1]

        if node == goal:
            return path

        for neighbour in graph.get(node, []):
            if neighbour not in visited:
                visited.append(neighbour)
                new_path = list(path)
                new_path.append(neighbour)
                queue.append(new_path)

    return None

start_node = "Ali"
goal_node = "Hira"
shortest_path = bfs_shortest_path(network, start_node, goal_node)

if shortest_path:
    print(f"Shortest chain from {start_node} to {goal_node}: {shortest_path}")
    print(f"Number of introductions needed: {len(shortest_path) - 1}")