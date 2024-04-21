// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Ownable2StepUpgradeable} from
    "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {PausableUpgradeable} from
    "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IBlast} from "./interfaces/IBlast.sol";

/// @title QuantumOrb
/// @notice Points game on Blast. One free orb a day, higher tiers for sale.
///         An orb is paid for in one block and decided by the hash of a later
///         one, so its outcome cannot be predicted or reverted at payment time.
contract QuantumOrb is
    Initializable,
    Ownable2StepUpgradeable,
    PausableUpgradeable
{
    enum OrbType {
        DAILY,
        GENESIS,
        QUANTUM
    }

    struct User {
        address referrer;
        uint128 points;
        uint128 referralPoints;
        uint64 lastDailyOpen;
        bool isPartner;
        bool registered;
        uint32 dailyStreak;
    }

    struct Pending {
        uint64 commitBlock;
        uint96 paid;
        uint64 prevDailyOpen;
        OrbType orbType;
        bool exists;
    }

    struct OrbConfig {
        uint96 price;
        bool enabled;
        uint32[4] minPoints;
        uint32[4] maxPoints;
    }

    IBlast public constant BLAST =
        IBlast(0x4300000000000000000000000000000000000002);

    uint64 public constant REVEAL_DELAY = 2;
    uint64 public constant REVEAL_WINDOW = 250;

    uint256 private constant REFERRAL_BPS = 1000;
    uint256 private constant BPS_DENOMINATOR = 10_000;
    uint256 private constant PARTNER_MULTIPLIER = 2;

    uint256 public constant ROLL_SPACE = 10_000;
    uint256 public constant RANK_4_ROLLS = 20;
    uint256 public constant RANK_3_ROLLS = 800;
    uint256 public constant RANK_2_ROLLS = 2100;

    uint32 public constant MAX_STREAK_BONUS_DAYS = 7;
    uint256 private constant STREAK_BONUS_BPS_PER_DAY = 500;

    uint8 public constant REASON_SELF_OPEN = 0;
    uint8 public constant REASON_REFERRAL_BONUS = 1;

    bytes32 private constant _REENTRANCY_SLOT = keccak256(
        abi.encode(uint256(keccak256("quantumorb.storage.reentrancy")) - 1)
    ) & ~bytes32(uint256(0xff));

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    mapping(address => User) public users;
    mapping(address => Pending) public pending;
    mapping(OrbType => OrbConfig) internal _orbConfig;

    event UserRegistered(address indexed user, address indexed referrer);
    event OrbCommitted(
        address indexed user, OrbType orbType, uint64 commitBlock
    );
    event OrbOpened(
        address indexed user, OrbType orbType, uint8 rank, uint256 points
    );
    event OrbExpired(address indexed user, OrbType orbType, uint256 refunded);
    event PointsCredited(
        address indexed user,
        uint256 points,
        uint256 referralPoints,
        uint8 reason
    );
    event OrbConfigChanged(OrbType orbType, uint96 price, bool enabled);
    event PartnerChanged(address indexed user, bool isPartner);
    event DailyStreakChanged(address indexed user, uint32 streak);
    event Withdrawn(address indexed to, uint256 amount);

    error InvalidPointsRange();
    error OrbDisabled();
    error IncorrectPayment(uint256 expected, uint256 received);
    error DailyNotReady(uint64 availableAt);
    error OpenAlreadyPending();
    error NoPendingOpen();
    error RevealTooEarly(uint64 firstRevealBlock);
    error RevealWindowClosed();
    error RevealWindowOpen();
    error InvalidReferrer();
    error TransferFailed();
    error ReentrantCall();
    error InsufficientBalance();

    modifier nonReentrant() {
        bytes32 slot = _REENTRANCY_SLOT;
        uint256 status;
        assembly {
            status := sload(slot)
        }
        if (status == _ENTERED) revert ReentrantCall();
        assembly {
            sstore(slot, _ENTERED)
        }
        _;
        assembly {
            sstore(slot, _NOT_ENTERED)
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() external initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();

        BLAST.configureAutomaticYield();
        BLAST.configureClaimableGas();
        BLAST.configureGovernor(msg.sender);

        _setOrbConfig(
            OrbType.DAILY,
            0,
            true,
            [uint32(25), 126, 251, 401],
            [uint32(125), 176, 326, 501]
        );
        _setOrbConfig(
            OrbType.GENESIS,
            0.0015 ether,
            true,
            [uint32(401), 1001, 2001, 3501],
            [uint32(1000), 2000, 3500, 9999]
        );
        _setOrbConfig(
            OrbType.QUANTUM,
            0.0027 ether,
            true,
            [uint32(1001), 2001, 3501, 7001],
            [uint32(2000), 3500, 6999, 19999]
        );
    }

    function setOrbConfig(
        OrbType orbType,
        uint96 price,
        bool enabled,
        uint32[4] calldata minPoints,
        uint32[4] calldata maxPoints
    ) external onlyOwner {
        _setOrbConfig(orbType, price, enabled, minPoints, maxPoints);
    }

    function setPartner(address user, bool isPartner) external onlyOwner {
        users[user].isPartner = isPartner;
        emit PartnerChanged(user, isPartner);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @param referrer Bound permanently on the caller's first open. Pass the
    ///        zero address for none.
    function openOrb(OrbType orbType, address referrer)
        external
        payable
        whenNotPaused
    {
        User storage u = users[msg.sender];
        if (pending[msg.sender].exists) revert OpenAlreadyPending();

        OrbConfig storage c = _orbConfig[orbType];
        if (!c.enabled) revert OrbDisabled();
        if (msg.value != c.price) {
            revert IncorrectPayment(c.price, msg.value);
        }

        if (!u.registered) {
            u.registered = true;
            u.referrer = _validatedReferrer(referrer);
            emit UserRegistered(msg.sender, u.referrer);
        }

        uint64 prevDailyOpen = u.lastDailyOpen;
        if (orbType == OrbType.DAILY) {
            _consumeDailyAllowance(u, prevDailyOpen);
        }

        pending[msg.sender] = Pending({
            commitBlock: uint64(block.number),
            paid: uint96(msg.value),
            prevDailyOpen: prevDailyOpen,
            orbType: orbType,
            exists: true
        });

        emit OrbCommitted(msg.sender, orbType, uint64(block.number));
    }

    /// @notice Resolve a committed orb. Callable by anyone: normally the
    ///         relayer, but a player can always reveal their own.
    function revealOrb(address user) external nonReentrant {
        Pending memory p = pending[user];
        if (!p.exists) revert NoPendingOpen();

        uint64 firstRevealBlock = p.commitBlock + REVEAL_DELAY + 1;
        if (block.number < firstRevealBlock) {
            revert RevealTooEarly(firstRevealBlock);
        }
        if (block.number > p.commitBlock + REVEAL_WINDOW) {
            revert RevealWindowClosed();
        }

        delete pending[user];

        uint256 seed = _seed(user, p.commitBlock);
        uint8 rank = _rank(seed);
        uint256 points = _pointsFor(seed, p.orbType, rank);

        User storage u = users[user];
        if (p.orbType == OrbType.DAILY) {
            points += _streakBonus(points, u.dailyStreak);
        }
        u.points += uint128(points);
        emit OrbOpened(user, p.orbType, rank, points);
        emit PointsCredited(user, u.points, u.referralPoints, REASON_SELF_OPEN);

        address referrer = u.referrer;
        if (referrer != address(0)) {
            _creditReferrer(referrer, points);
        }
    }

    /// @notice Recover the payment for an orb nobody revealed in time.
    function reclaimOrb() external nonReentrant {
        Pending memory p = pending[msg.sender];
        if (!p.exists) revert NoPendingOpen();
        if (block.number <= p.commitBlock + REVEAL_WINDOW) {
            revert RevealWindowOpen();
        }

        delete pending[msg.sender];

        if (p.orbType == OrbType.DAILY) {
            _restoreDailyAllowance(users[msg.sender], p.prevDailyOpen);
        }

        emit OrbExpired(msg.sender, p.orbType, p.paid);

        if (p.paid > 0) {
            (bool ok,) = payable(msg.sender).call{value: p.paid}("");
            if (!ok) revert TransferFailed();
        }
    }

    function withdraw(address payable to, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        if (amount > address(this).balance) revert InsufficientBalance();
        emit Withdrawn(to, amount);

        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    function claimGas() external onlyOwner returns (uint256) {
        return BLAST.claimMaxGas(address(this), address(this));
    }

    receive() external payable {}

    function orbConfig(OrbType orbType)
        external
        view
        returns (uint96 price, bool enabled)
    {
        OrbConfig storage c = _orbConfig[orbType];
        return (c.price, c.enabled);
    }

    function getOrbPoints(OrbType orbType)
        external
        view
        returns (uint32[4] memory minPoints, uint32[4] memory maxPoints)
    {
        OrbConfig storage c = _orbConfig[orbType];
        return (c.minPoints, c.maxPoints);
    }

    function _setOrbConfig(
        OrbType orbType,
        uint96 price,
        bool enabled,
        uint32[4] memory minPoints,
        uint32[4] memory maxPoints
    ) internal {
        for (uint256 i = 0; i < 4; ++i) {
            if (minPoints[i] > maxPoints[i]) revert InvalidPointsRange();
        }
        OrbConfig storage c = _orbConfig[orbType];
        c.price = price;
        c.enabled = enabled;
        c.minPoints = minPoints;
        c.maxPoints = maxPoints;

        emit OrbConfigChanged(orbType, price, enabled);
    }

    function _consumeDailyAllowance(User storage u, uint64 prevDailyOpen)
        internal
    {
        uint64 readyAt = prevDailyOpen == 0 ? 0 : prevDailyOpen + 1 days;
        if (block.timestamp < readyAt) revert DailyNotReady(readyAt);

        bool continues =
            prevDailyOpen != 0 && block.timestamp <= prevDailyOpen + 2 days;
        u.dailyStreak = continues ? u.dailyStreak + 1 : 1;
        u.lastDailyOpen = uint64(block.timestamp);

        emit DailyStreakChanged(msg.sender, u.dailyStreak);
    }

    function _restoreDailyAllowance(User storage u, uint64 prevDailyOpen)
        internal
    {
        u.lastDailyOpen = prevDailyOpen;
        if (u.dailyStreak > 0) u.dailyStreak -= 1;
        emit DailyStreakChanged(msg.sender, u.dailyStreak);
    }

    function _streakBonus(uint256 points, uint32 streak)
        internal
        pure
        returns (uint256)
    {
        if (streak <= 1) return 0;
        uint32 rewarded = streak - 1;
        if (rewarded > MAX_STREAK_BONUS_DAYS - 1) {
            rewarded = MAX_STREAK_BONUS_DAYS - 1;
        }
        return (points * STREAK_BONUS_BPS_PER_DAY * rewarded) / BPS_DENOMINATOR;
    }

    function _creditReferrer(address referrer, uint256 points) internal {
        uint256 bonus = (points * REFERRAL_BPS) / BPS_DENOMINATOR;
        if (users[referrer].isPartner) bonus *= PARTNER_MULTIPLIER;

        User storage r = users[referrer];
        r.points += uint128(bonus);
        r.referralPoints += uint128(bonus);

        emit PointsCredited(
            referrer, r.points, r.referralPoints, REASON_REFERRAL_BONUS
        );
    }

    function _seed(address user, uint64 commitBlock)
        internal
        view
        returns (uint256)
    {
        return uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(commitBlock + REVEAL_DELAY), user, commitBlock
                )
            )
        );
    }

    function _rank(uint256 seed) internal pure returns (uint8) {
        uint256 roll = seed % ROLL_SPACE;
        if (roll < RANK_4_ROLLS) return 4;
        if (roll < RANK_3_ROLLS) return 3;
        if (roll < RANK_2_ROLLS) return 2;
        return 1;
    }

    function _pointsFor(uint256 seed, OrbType orbType, uint8 rank)
        internal
        view
        returns (uint256)
    {
        OrbConfig storage c = _orbConfig[orbType];
        uint256 lo = c.minPoints[rank - 1];
        uint256 hi = c.maxPoints[rank - 1];

        uint256 roll = _independentRoll(seed);
        return lo + (roll % (hi - lo + 1));
    }

    function _independentRoll(uint256 seed) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(seed, "points")));
    }

    function _validatedReferrer(address referrer)
        internal
        view
        returns (address)
    {
        if (referrer == address(0)) return address(0);
        if (referrer == msg.sender) revert InvalidReferrer();
        if (users[referrer].referrer == msg.sender) revert InvalidReferrer();
        return referrer;
    }

    uint256[45] private __gap;
}
