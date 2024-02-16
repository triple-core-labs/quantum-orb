import requests

# Define the GraphQL queries with variables
top_query = """
query GetTopAddresses($count: Int!, $userAddress: String!) {
  users(first: $count, orderBy: points, orderDirection: desc, where: { id_not: $userAddress }) {
    id
    points
  }
}
"""

bottom_query = """
query GetBottomAddresses($count: Int!, $userAddress: String!) {
  users(first: $count, orderBy: points, orderDirection: asc, where: { id_not: $userAddress }) {
    id
    points
  }
}
"""

# Define the variables for the queries
variables = {
    "count": 10,
    "userAddress": "YOUR_USER_ADDRESS_HERE"
}

# Define the GraphQL endpoint URL
url = "https://api.studio.thegraph.com/query/65616/blast-quantum-orbs/version/latest"

# Make the HTTP POST request with the top query
response_top = requests.post(url, json={"query": top_query, "variables": variables})

# Make the HTTP POST request with the bottom query
response_bottom = requests.post(url, json={"query": bottom_query, "variables": variables})

# Check if the requests were successful (status code 200)
if response_top.status_code == 200 and response_bottom.status_code == 200:
    # Parse the JSON responses
    data_top = response_top.json()
    data_bottom = response_bottom.json()
    
    # Extract the relevant information from the responses
    top_users = data_top["data"]["users"]
    bottom_users = data_bottom["data"]["users"]
    
    # Print the top users
    print("Top 10 users based on points:")
    for user in top_users:
        print(f"User ID: {user['id']}, Points: {user['points']}")
    
    # Print the bottom users
    print("\nBottom 10 users based on points:")
    for user in bottom_users:
        print(f"User ID: {user['id']}, Points: {user['points']}")
else:
    # Print an error message if any of the requests were not successful
    print("Error: Failed to fetch data")
