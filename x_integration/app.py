from flask import Flask, jsonify, request
from x import is_following

app = Flask(__name__)


@app.route("/x", methods=["GET"])
def check_subscription():

    username = ""
    target_account = "QuantumOrbs"

    try:

        follows = is_following(username, target_account)

        return jsonify(follows)

    except Exception as e:

        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
