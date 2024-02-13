// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract QuantumOrb {
    address public owner;
    mapping(address => User) public users;

    struct User {
        bool partner;
        address parent;
        uint points;
        uint referralPoints;
        uint256 lastOpenedDaily;
        string x_link;
    }

    event OrbOpened(address indexed user, uint pointsEarned);
    event MarkedAsPartner(address indexed user);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    function initializeUser(address _parent) external {
        address _user = msg.sender;
        users[_user].partner = false;
        if (_parent != address(0)) {
            users[_user].parent = _parent;
        } else {
            users[_user].parent = owner;
        }
    }

    function markAsPartner(address _user) external onlyOwner {
        require(!users[_user].partner, "User is already marked as partner");
        users[_user].partner = true;
        emit MarkedAsPartner(_user);
    }

    function addPoints(uint _points) internal {
        address _user = msg.sender;
        users[_user].points += _points;
        address parent = users[_user].parent;
        uint amount = (10 * _points) / 100;
        if (users[parent].partner) {
            amount *= 2;
        }
        users[_user].referralPoints += amount;
        users[parent].points += amount;
    }

    function setXLink(string memory _x_link) external {
        address _user = msg.sender;
        require(bytes(_x_link).length > 0, "Invalid x_link");
        require(bytes(users[_user].x_link).length == 0, "x_link already set");
        users[_user].x_link = _x_link;

        // Add 100 points to the user who set the x_link
        addPoints(100);
    }

    function getOrbRank() internal view returns (uint8) {
        uint randint = getRand() % 10000;
        if (randint < 7900) {
            return 1;
        } else if (randint < 9600) {
            return 2;
        } else if (randint < 9990) {
            return 3;
        } else {
            return 4;
        }
    }

    function getRand() internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender)));
    }

    function openDailyOrb() external payable {
        require(users[msg.sender].lastOpenedDaily + 1 days <= block.timestamp, "You have already opened your daily orb");

        users[msg.sender].lastOpenedDaily = block.timestamp;
        uint pointsEarned;
        
        uint8 rank = getOrbRank();

        if (rank == 1) {
            pointsEarned = (getRand() % 101) + 25;
        } else if (rank == 2) {
            pointsEarned = (getRand() % 51) + 126;
        } else if (rank == 3) {
            pointsEarned = (getRand() % 76) + 251;
        } else {
            pointsEarned = (getRand() % 101) + 401;
        }

        addPoints(pointsEarned);

        emit OrbOpened(msg.sender, pointsEarned);
    }

    function openGenesisOrb() external payable {
        require(msg.value >= 0.0015 ether, "Insufficient ETH sent for Genesis Orb, 0.0015 ETH required");
        uint pointsEarned;
        
        uint8 rank = getOrbRank();
        uint rand = getRand();

        if (rank == 1) {
            pointsEarned = (rand % 600) + 401;
        } else if (rank == 2) {
            pointsEarned = (rand % 1000) + 1001;
        } else if (rank == 3) {
            pointsEarned = (rand % 1500) + 2001;
        } else {
            pointsEarned = (rand % 6499) + 3501;
        }

        addPoints(pointsEarned);

        emit OrbOpened(msg.sender, pointsEarned);
    }

    function openQuantumOrb() external payable {
        require(msg.value >= 0.0027 ether, "Insufficient ETH sent for Quantum Orb, 0.0027 ETH required");
        uint pointsEarned;
        
        uint8 rank = getOrbRank();
        uint rand = getRand();

        if (rank == 1) {
            pointsEarned = (rand % 1000) + 1001;
        } else if (rank == 2) {
            pointsEarned = (rand % 1500) + 2001;
        } else if (rank == 3) {
            pointsEarned = (rand % 3499) + 3501;
        } else {
            pointsEarned = (rand % 12999) + 7001;
        }

        addPoints(pointsEarned);
        emit OrbOpened(msg.sender, pointsEarned);
    }

    function getPoints(address _user) external view returns (uint) {
        return users[_user].points;
    }

    function getReferralPoints(address _user) external view returns (uint) {
        return users[_user].referralPoints;
    }

    function getUserX(address _user) external view returns (string memory) {
        return users[_user].x_link;
    }

    receive() external payable {}
}
