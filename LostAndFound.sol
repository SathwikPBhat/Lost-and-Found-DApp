// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LostAndFound{
    address public contractOwner;
    uint256 public itemCount;

    enum Status{Open, Claimed, Cancelled}

    struct Item{
        uint256 id;
        address payable owner;
        string title;
        string description;
        uint256 rewardAmount;
        Status status;
    }

    mapping(uint256 => Item) public items;

    event ItemReported(uint256 indexed id, address indexed owner, string title, uint256 reward);
    event BountyClaimed(uint256 indexed id, address indexed finder, uint256 reward);
    event ItemCancelled(uint256 indexed id, uint256 refundedAmount);


    constructor(){
        contractOwner = msg.sender;
        itemCount = 0;
    }

    function reportLostItem(string memory _title, string memory _description) external payable{
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(msg.value > 0, "Reward must be greater than 0");

        itemCount++;
        items[itemCount] = Item({
            id: itemCount,
            owner: payable(msg.sender),
            title: _title,
            description: _description,
            rewardAmount: msg.value,
            status: Status.Open
        });
        emit ItemReported(itemCount, msg.sender, _title, msg.value);
    }

    function payFinder(uint256 _itemId, address payable _finder) external{
        Item storage item = items[_itemId];


        require(_itemId > 0 && _itemId <= itemCount, " Item doesn't exist");
        require(msg.sender == item.owner, "Only the item owner can release the reward");
        require(item.status == Status.Open, "Item is no longer active");
        require(_finder != address(0), "Invalid finder address");
        require(_finder != item.owner, "Cannot reward yourself");

        item.status = Status.Claimed;
        uint256 payout = item.rewardAmount;

        (bool success, ) = _finder.call{value: payout}("");
        require(success, "ETH transfer failed");

        emit BountyClaimed(_itemId, _finder, payout);
    }

    function cancelReport(uint256 _itemId) external{
        Item storage item = items[_itemId];

        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        require(msg.sender == item.owner, "Only the item owner can cancel");
        require(item.status == Status.Open, "Item is no longer active");

        item.status = Status.Cancelled;
        uint256 refund = item.rewardAmount;

        (bool success, ) = item.owner.call{value: refund}("");
        require(success, "Refund transfer failed");

        emit ItemCancelled(_itemId, refund);
    }

    function getItem(uint256 _itemId) external view returns (Item memory){
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        return items[_itemId];
    }
}
