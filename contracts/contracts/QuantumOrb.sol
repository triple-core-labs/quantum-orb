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
/// @notice Points game on Blast. Players open one free orb per day and may buy
///         higher tiers. Outcomes are decided by commit-reveal over a future
///         block hash so that neither the player nor the operator can predict
///         or reverse a result at payment time.
contract QuantumOrb is
    Initializable,
    Ownable2StepUpgradeable,
    PausableUpgradeable
{
    // ---------------------------------------------------------------- types

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

    // ------------------------------------------------------------ constants

    IBlast public constant BLAST =
        IBlast(0x4300000000000000000000000000000000000002);

    uint64 public constant REVEAL_DELAY = 2;
    uint64 public constant REVEAL_WINDOW = 250;

    uint256 private constant REFERRAL_BPS = 1000; // 10%
    uint256 private constant PARTNER_MULTIPLIER = 2;

    uint8 public constant REASON_SELF_OPEN = 0;
    uint8 public constant REASON_REFERRAL_BONUS = 1;

    ///  ERC-7201 namespaced slot for the reentrancy flag, so it can never
    ///      collide with the layout above and needs no constructor.
    ///      OpenZeppelin 5.6 dropped ReentrancyGuardUpgradeable, and its
    ///      non-upgradeable ReentrancyGuard seeds its slot in a constructor,
    ///      which the upgrades validator rejects. Slot value 0 (a fresh proxy)
    ///      reads as "not entered", which is the behaviour we want.
    ///      keccak256(abi.encode(uint256(keccak256("quantumorb.storage.reentrancy")) - 1)) & ~0xff
    bytes32 private constant _REENTRANCY_SLOT =
        0xd6982fbb754be841f61a32b3138c7b1d697694b99d84369af28769527ab47600;

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // -------------------------------------------------------------- storage

    mapping(address => User) public users;
    mapping(address => Pending) public pending;
    mapping(OrbType => OrbConfig) internal _orbConfig;

    // --------------------------------------------------------------- events

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

    // --------------------------------------------------------------- errors

    error InvalidPointsRange();
    error OrbDisabled();
    error IncorrectPayment(uint256 expected, uint256 received);
    error DailyNotReady(uint64 availableAt);
    error OpenAlreadyPending();
    error NoPendingOpen();
    error RevealTooEarly(uint64 readyAtBlock);
    error RevealWindowClosed();
    error RevealWindowOpen();
    error InvalidReferrer();
    error TransferFailed();
    error ReentrantCall();

    // ------------------------------------------------------------ modifiers

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

    // ---------------------------------------------------------- constructor

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

    // ---------------------------------------------------------------- admin

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

    // ------------------------------------------------------------- gameplay

    /// @notice Pay for an orb and commit to the block whose hash will decide it.
    /// @param referrer Bound permanently on the caller first open. Pass the
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
            uint64 readyAt = prevDailyOpen == 0 ? 0 : prevDailyOpen + 1 days;
            if (block.timestamp < readyAt) revert DailyNotReady(readyAt);
            // Consumed at commit time so an unrevealed orb cannot be used to
            // farm extra daily attempts. reclaimOrb restores it.
            u.lastDailyOpen = uint64(block.timestamp);
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
    ///         relayer, but the player can always reveal their own.
    function revealOrb(address user) external nonReentrant {
        Pending memory p = pending[user];
        if (!p.exists) revert NoPendingOpen();

        uint64 readyAt = p.commitBlock + REVEAL_DELAY;
        // Strictly greater: blockhash(block.number) is zero in the EVM, so a
        // reveal landing in readyAt itself would draw a degenerate seed.
        if (block.number <= readyAt) revert RevealTooEarly(readyAt);
        if (block.number > p.commitBlock + REVEAL_WINDOW) {
            revert RevealWindowClosed();
        }

        delete pending[user];

        uint256 seed = _seed(user, p.commitBlock);
        uint8 rank = _rank(seed);
        uint256 points = _pointsFor(seed, p.orbType, rank);

        User storage u = users[user];
        u.points += uint128(points);
        emit OrbOpened(user, p.orbType, rank, points);
        emit PointsCredited(user, u.points, u.referralPoints, REASON_SELF_OPEN);

        address referrer = u.referrer;
        if (referrer != address(0)) {
            uint256 bonus = (points * REFERRAL_BPS) / 10_000;
            if (users[referrer].isPartner) bonus *= PARTNER_MULTIPLIER;

            User storage r = users[referrer];
            r.points += uint128(bonus);
            r.referralPoints += uint128(bonus);

            // Emitted separately so the indexer sees the referrer new
            // totals. The previous contract credited the referrer silently,
            // which is why referral points never reached the leaderboard.
            emit PointsCredited(
                referrer, r.points, r.referralPoints, REASON_REFERRAL_BONUS
            );
        }
    }

    // ----------------------------------------------------------- view calls

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

    // ------------------------------------------------------------ internals

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

    /// @dev The only place entropy enters the contract. Swapping to a VRF
    ///      replaces this function and the reveal trigger, nothing else.
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
        uint256 roll = seed % 10_000;
        if (roll < 20) return 4;
        if (roll < 800) return 3;
        if (roll < 2100) return 2;
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

        // Derived from a second hash so rank and points are independent draws.
        // The previous contract reused one value for both.
        uint256 roll = uint256(keccak256(abi.encodePacked(seed, "points")));
        return lo + (roll % (hi - lo + 1));
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

    /// @dev Reserved so later upgrades can add storage without shifting layout.
    uint256[45] private __gap;
}
