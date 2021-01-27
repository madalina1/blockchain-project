pragma solidity >=0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PaymentProcessor is AccessControl {
    bytes32 public constant FUNDER_ROLE = keccak256("FUNDER_ROLE");
    bytes32 public constant FREELANCER_ROLE = keccak256("FREELANCER_ROLE");
    bytes32 public constant EVALUATOR_ROLE = keccak256("EVALUATOR_ROLE");

    address public owner;
    IERC20 public token;
    Product[] private products;
    address[] projectAddresses;


    struct person {
        address userAddress;
        string name;
        string roleName;
        bytes32 roleAddress;
        int256 rating;
        string expertiseDomain;
    }

    struct freelancerApplyProduct {
        address projectAddress;
        uint256 amount;
    }
    
    mapping(address => address[]) public evaluatorSubscribers;
    mapping(address => freelancerApplyProduct[]) public freelancerProducts;

    mapping(address => person) public persons;

    event PaymentDone(
        address payer,
        uint256 amount,
        uint256 paymentId,
        uint256 date
    );

    event ProductStarted(
        address productAddress,
        address ownerAddress,
        string projectTitle,
        string projectDescription,
        string projectDomain,
        uint256 devReward,
        uint256 evaluatorReward,
        uint256 date
    );

    constructor(
        address ownerAddress,
        address tokenAddress,
        string memory ownerName
    ) public {
        owner = ownerAddress;
        token = IERC20(tokenAddress);
        persons[ownerAddress] = person(
            ownerAddress,
            ownerName,
            "manager",
            DEFAULT_ADMIN_ROLE,
            5,
            ""
        );
        _setupRole(DEFAULT_ADMIN_ROLE, ownerAddress);
    }

    function startProduct(
        string calldata title,
        string calldata description,
        string calldata domain,
        uint256 devReward,
        uint256 evaluatorReward
    ) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not a manager"
        );

        Product newProduct =
            new Product(
                msg.sender,
                token,
                title,
                description,
                domain,
                devReward,
                evaluatorReward
            );
        products.push(newProduct);
        emit ProductStarted(
            address(newProduct),
            msg.sender,
            title,
            description,
            domain,
            devReward,
            evaluatorReward,
            block.timestamp
        );
    }

    function returnAllProducts() external view returns (Product[] memory) {
        return products;
    }

    function addFunder(address funder, string calldata name) external {
        persons[funder] = person(funder, name, "funder", FUNDER_ROLE, -1, "");
        _setupRole(FUNDER_ROLE, funder);
    }

    function addFreelancer(
        address freelancer,
        string calldata name,
        string calldata domain
    ) external {
        persons[freelancer] = person(
            freelancer,
            name,
            "freelancer",
            FREELANCER_ROLE,
            5,
            domain
        );
        _setupRole(FREELANCER_ROLE, freelancer);
    }

    function addEvaluator(
        address evaluator,
        string calldata name,
        string calldata domain
    ) external {
        persons[evaluator] = person(
            evaluator,
            name,
            "evaluator",
            EVALUATOR_ROLE,
            5,
            domain
        );
        _setupRole(EVALUATOR_ROLE, evaluator);
    }

    function getCurrentPerson()
        public
        view
        returns (
            address userAddress,
            string memory name,
            string memory roleName,
            bytes32 roleAddress,
            int256 rating,
            string memory expertiseDomain
        )
    {
        userAddress = persons[msg.sender].userAddress;
        name = persons[msg.sender].name;
        roleName = persons[msg.sender].roleName;
        roleAddress = persons[msg.sender].roleAddress;
        rating = persons[msg.sender].rating;
        expertiseDomain = persons[msg.sender].expertiseDomain;
    }

    function getUserBasedOnAddress(address userAddress)
        public
        view
        returns (
            string memory name,
            string memory roleName,
            bytes32 roleAddress,
            int256 rating,
            string memory expertiseDomain
        )
    {
        name = persons[userAddress].name;
        roleName = persons[userAddress].roleName;
        roleAddress = persons[userAddress].roleAddress;
        rating = persons[userAddress].rating;
        expertiseDomain = persons[userAddress].expertiseDomain;
    }

    function addSubscriber(address productAddress) external {
        require(
            hasRole(EVALUATOR_ROLE, msg.sender),
            "Caller is not an evaluator"
        );
        
        evaluatorSubscribers[msg.sender].push(productAddress);
    }

    function checkIfHasSubscriber(address productAddress) external view returns (bool) {
        for(uint i = 0; i < evaluatorSubscribers[msg.sender].length; i++) {
            if(evaluatorSubscribers[msg.sender][i] == productAddress) {
                return true;
            }
        }
        return false;
    }

    function applyProduct(address productAddress, uint256 amount) external {
        require(
            hasRole(FREELANCER_ROLE, msg.sender),
            "Caller is not a freelancer"
        );
        
        freelancerProducts[msg.sender].push(freelancerApplyProduct(productAddress, amount));
    }

    function checkIfFreelancerApplied(address productAddress) external view returns (bool) {
        for(uint i = 0; i < freelancerProducts[msg.sender].length; i++) {
            if(freelancerProducts[msg.sender][i].projectAddress == productAddress) {
                return true;
            }
        }
        return false;
    }
}

// Product smart contract

contract Product is AccessControl {
    using SafeMath for uint256;

    enum State {Fundraising, Fail, Successful}

    address payable public manager;
    address public projectAddress;
    uint256 public amountGoal;
    uint256 public currentBalance;
    string public title;
    string public description;
    uint256 public devReward;
    uint256 public evaluatorReward;
    string public domain;
    IERC20 public token;

    State public state = State.Fundraising;
    mapping(address => uint256) public contributions;

    // Event that will be emitted whenever funding will be received
    event FundingReceived(
        address contributor,
        uint256 amount,
        uint256 currentTotal
    );
    // Event that will be emitted whenever the project starter has received the funds
    event CreatorPaid(address recipient);

    // Modifier to check current state
    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    // Modifier to check if the function caller is the project creator
    modifier isCreator() {
        require(msg.sender == manager);
        _;
    }

    constructor(
        address payable managerAddress,
        IERC20 tokenAddress,
        string memory productTitle,
        string memory productDescription,
        string memory productDomain,
        uint256 productDevReward,
        uint256 productEvaluatorReward
    ) public {
        manager = managerAddress;
        title = productTitle;
        description = productDescription;
        amountGoal = productDevReward + productEvaluatorReward;
        currentBalance = 0;
        devReward = productDevReward;
        evaluatorReward = productEvaluatorReward;
        domain = productDomain;
        token = tokenAddress;
        projectAddress = address(this);
    }

    function getSender() public view returns (address sender) {
        sender = msg.sender;
    }

    function getManager() public view returns  (address managerAddress) {
        managerAddress = manager;
    }

    function getProductState() public view returns (State) {
        return state;
    }

    /** @dev Function to fund a certain project.
     */
    function contribute(uint256 amount)
        external
        payable
        inState(State.Fundraising)
    {
        require(msg.sender != manager);
        token.transferFrom(msg.sender, manager, amount);

        contributions[msg.sender] = contributions[msg.sender].add(amount);
        currentBalance = currentBalance.add(amount);
        emit FundingReceived(msg.sender, amount, currentBalance);
        checkIfFundingCompleteOrExpired();
    }

    function checkIfFunderPayed(address funder) external view returns (bool) {
        if(contributions[funder] > 0){
            return true;
        }
        return false;
    }

    /** @dev Function to change the project state depending on conditions.
     */
    function checkIfFundingCompleteOrExpired() public {
        if (currentBalance >= amountGoal) {
            state = State.Successful;
        }
    }

    /** @dev Function to give the received funds to project starter.
     */
    function payOut() internal inState(State.Successful) returns (bool) {
        uint256 totalRaised = currentBalance;
        currentBalance = 0;

        if (manager.send(totalRaised)) {
            emit CreatorPaid(manager);
            return true;
        } else {
            currentBalance = totalRaised;
            state = State.Successful;
        }

        return false;
    }

    /** @dev Function to retrieve donated amount when a project expires.
     */
    function getRefund() external payable inState(State.Fundraising) returns (bool) {
        require(contributions[msg.sender] > 0);

        uint256 amountToRefund = contributions[msg.sender];
        contributions[msg.sender] = 0;

        if (!token.transferFrom(manager, payable(msg.sender), amountToRefund)) {
            contributions[msg.sender] = amountToRefund;
            return false;
        } else {
            currentBalance = currentBalance.sub(amountToRefund);
        }

        return true;
    }

    function getAmountToRefund() public view returns (uint256) {
        require(contributions[msg.sender] > 0);
        return contributions[msg.sender];
    }

    function getDetails()
        public
        view
        returns (
            address productAddress,
            address payable managerAddress,
            string memory productTitle,
            string memory productDescription,
            string memory productDomain,
            State currentState,
            uint256 currentAmount,
            uint256 goalAmount,
            uint256 productDevReward,
            uint256 productEvaluatorReward
        )
    {
        productAddress = projectAddress;
        managerAddress = manager;
        productTitle = title;
        productDescription = description;
        productDomain = domain;
        currentState = state;
        currentAmount = currentBalance;
        goalAmount = amountGoal;
        productDevReward = devReward;
        productEvaluatorReward = evaluatorReward;
    }
}
