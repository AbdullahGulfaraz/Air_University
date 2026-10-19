maze = {
    "Entrance": ["Hall1", "Hall2"],
    "Hall1": ["Room1"],
    "Hall2": ["Room2", "Trap"],
    "Room1": [],
    "Room2": ["Exit"],
    "Trap": [],
    "Exit": [],
}

def dfs_can_reach(maze, start, exit_room, visited=None):
    if visited is None:
        visited = []

    if start not in visited:
        visited.append(start)

    if start == exit_room:
        return True, visited

    for neighbour in maze.get(start, []):
        if neighbour not in visited:
            reached, visited = dfs_can_reach(maze, neighbour, exit_room, visited)
            if reached:
                return True, visited

    return False, visited

can_reach, visit_order = dfs_can_reach(maze, "Entrance", "Exit")
print("Visit order:", visit_order)
print("Can reach Exit from Entrance?", can_reach)