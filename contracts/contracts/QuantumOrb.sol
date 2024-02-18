// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

enum YieldMode {
    AUTOMATIC,
    VOID,
    CLAIMABLE
}

enum GasMode {
    VOID,
    CLAIMABLE
}

interface IBlast{
    // configure
    function configureContract(address contractAddress, YieldMode _yield, GasMode gasMode, address governor) external;
    function configure(YieldMode _yield, GasMode gasMode, address governor) external;

    // base configuration options
    function configureClaimableYield() external;
    function configureClaimableYieldOnBehalf(address contractAddress) external;
    function configureAutomaticYield() external;
    function configureAutomaticYieldOnBehalf(address contractAddress) external;
    function configureVoidYield() external;
    function configureVoidYieldOnBehalf(address contractAddress) external;
    function configureClaimableGas() external;
    function configureClaimableGasOnBehalf(address contractAddress) external;
    function configureVoidGas() external;
    function configureVoidGasOnBehalf(address contractAddress) external;
    function configureGovernor(address _governor) external;
    function configureGovernorOnBehalf(address _newGovernor, address contractAddress) external;

    // claim yield
    function claimYield(address contractAddress, address recipientOfYield, uint256 amount) external returns (uint256);
    function claimAllYield(address contractAddress, address recipientOfYield) external returns (uint256);

    // claim gas
    function claimAllGas(address contractAddress, address recipientOfGas) external returns (uint256);
    function claimGasAtMinClaimRate(address contractAddress, address recipientOfGas, uint256 minClaimRateBips) external returns (uint256);
    function claimMaxGas(address contractAddress, address recipientOfGas) external returns (uint256);
    function claimGas(address contractAddress, address recipientOfGas, uint256 gasToClaim, uint256 gasSecondsToConsume) external returns (uint256);

    // read functions
    function readClaimableYield(address contractAddress) external view returns (uint256);
    function readYieldConfiguration(address contractAddress) external view returns (uint8);
    function readGasParams(address contractAddress) external view returns (uint256 etherSeconds, uint256 etherBalance, uint256 lastUpdated, GasMode);
}

contract QuantumOrb is Initializable {
    IBlast public constant BLAST = IBlast(0x4300000000000000000000000000000000000002);

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

    event UserInitialized(address indexed user, address indexed parent);
    event UserUpdated(address indexed user, uint points, uint referralPoints);
    event UserXLinked(address indexed user, string x_link);

    event OrbOpened(address indexed user, uint pointsEarned);

    function initialize() public initializer {
        owner = msg.sender;
        BLAST.configureAutomaticYield();
        BLAST.configureClaimableGas();
        BLAST.configureGovernor(owner);
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

        emit UserInitialized(_user, _parent);
    }

    function markAsPartner(address _user) external onlyOwner {
        require(!users[_user].partner, "User is already marked as partner");
        users[_user].partner = true;
    }

    function claimBalance() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function claimGas() external onlyOwner returns (uint256) {
        return BLAST.claimMaxGas(address(this), address(this));
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

        emit UserUpdated(_user, users[_user].points, users[_user].referralPoints);
    }

    function setXLink(string memory _x_link) external {
        address _user = msg.sender;
        require(bytes(_x_link).length > 0, "Invalid x_link");
        require(bytes(users[_user].x_link).length == 0, "x_link already set");
        users[_user].x_link = _x_link;

        emit UserXLinked(_user, _x_link);
        addPoints(3000);
    }

    function getOrbRank() internal view returns (uint8) {
        uint randint = getRand() % 10000;
        if ((1050 <= randint) && (randint <= 8949)) {
            return 1;
        } else if ((400 <= randint) && (randint <= 9599)) {
            return 2;
        } else if ((10 <= randint) && (randint <= 9989)) {
            return 3;
        } else {
            return 4;
        }
    }

    function getRand() internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender)));
    }

    function openDailyOrb() external payable returns (uint) {
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

        return pointsEarned;
    }

    function openGenesisOrb() external payable returns (uint) {
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

        return pointsEarned;
    }

    function openQuantumOrb() external payable returns (uint) {
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

        return pointsEarned;
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

    function getUserParent(address _user) external view returns (address) {
        return users[_user].parent;
    }

    function getUserPartnerStatus(address _user) external view returns (bool) {
        return users[_user].partner;
    }

    function getUserLastOpenedDaily(address _user) external view returns (uint256) {
        return users[_user].lastOpenedDaily;
    }

    receive() external payable {}
}
