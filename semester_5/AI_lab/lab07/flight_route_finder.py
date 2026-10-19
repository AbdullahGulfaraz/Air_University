flights = {
    "Islamabad": [("Lahore", 40), ("Karachi", 90)],
    "Lahore": [("Karachi", 50), ("Peshawar", 30)],
    "Karachi": [("Quetta", 60)],
    "Peshawar": [("Quetta", 70)],
    "Quetta": [],
}

def path_cost(path):
    return sum(cost for _, cost in path)

def ucs_cheapest_route(graph, start, goal):
    visited = []
    queue = [[(start, 0)]]
    explored_count = 0

    while queue:
        queue.sort(key=path_cost)
        path = queue.pop(0)
        node = path[-1][0]

        # Display path currently being expanded
        current_route = [city for city, _ in path]
        print(f"Exploring route: {current_route} with current cost: {path_cost(path)}")
        explored_count += 1

        if node in visited:
            continue
        visited.append(node)

        if node == goal:
            print(f"Total routes explored: {explored_count}")
            return [city for city, _ in path], path_cost(path)

        for neighbour, cost in graph.get(node, []):
            if neighbour not in visited:
                queue.append(path + [(neighbour, cost)])

    print(f"Total routes explored: {explored_count}")
    return None, None

best_route, total_cost = ucs_cheapest_route(flights, "Islamabad", "Quetta")
print("Cheapest route:", best_route)
print("Total ticket cost:", total_cost)